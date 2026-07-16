import {
  query,
  type Query,
  type SDKUserMessage,
  type PermissionResult,
} from '@anthropic-ai/claude-agent-sdk';
import { MAX_CONCURRENT_WORKERS, WORKER_MAX_TURNS, resolveModel } from './config.js';
import { db, q, logEvent, type AgentRow } from './db.js';
import { AsyncQueue, shortId, trim, summarizeToolCall } from './util.js';
import { broadcast, activity } from './bus.js';
import { notifyJarvis } from './jarvisLink.js';

interface LiveWorker {
  id: string;
  input: AsyncQueue<SDKUserMessage>;
  handle: Query;
  stopping: boolean;
}

const live = new Map<string, LiveWorker>();
const startQueue: string[] = [];
const pendingPermissions = new Map<string, { resolve: (r: PermissionResult) => void }>();

function userMsg(text: string): SDKUserMessage {
  return {
    type: 'user',
    message: { role: 'user', content: [{ type: 'text', text }] },
    parent_tool_use_id: null,
    session_id: '',
  } as SDKUserMessage;
}

// --- guardrails ---

const DANGEROUS_BASH: [RegExp, string][] = [
  [/\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)+/, 'recursive/forced delete'],
  [/\bgit\s+push\b/, 'push to a remote'],
  [/\bgit\s+reset\s+--hard\b/, 'hard reset'],
  [/\bsudo\b/, 'privileged command'],
  [/\b(vercel|netlify|firebase|wrangler|fly|railway)\b.*\b(deploy|publish|--prod)\b/, 'deployment'],
  [/\bnpm\s+publish\b/, 'package publish'],
  [/\bgh\s+(release|pr\s+merge)\b/, 'GitHub release/merge'],
  [/\b(shutdown|reboot|diskutil|mkfs|launchctl)\b/, 'system-level command'],
  [/curl[^|]*\|\s*(ba)?sh/, 'piping remote script to shell'],
  [/\bkillall\b/, 'killing processes broadly'],
];

const SAFE_MCP_VERBS =
  /^(list|get|search|read|fetch|show|count|check|status|describe|preview|web_search|web_fetch|screenshot|snapshot|inspect)/;

export function classifyToolUse(toolName: string, input: Record<string, unknown>): string | null {
  if (toolName === 'Bash') {
    const cmd = String(input.command ?? '');
    for (const [re, label] of DANGEROUS_BASH) {
      if (re.test(cmd)) return `${label}: ${trim(cmd, 200)}`;
    }
    return null;
  }
  if (toolName.startsWith('mcp__')) {
    const parts = toolName.split('__');
    const bare = parts.slice(2).join('__');
    if (SAFE_MCP_VERBS.test(bare)) return null;
    return `external service action: ${toolName}`;
  }
  return null;
}

// --- escalations ---

export function createEscalation(
  agentId: string,
  question: string,
  context: string | null,
  options: string[] | null
): string {
  const id = shortId('esc');
  q.insertEscalation.run(id, agentId, question, context, options ? JSON.stringify(options) : null, Date.now());
  const row = q.getEscalation.get(id);
  broadcast('escalation.new', { escalation: row });
  activity(`escalation: ${trim(question, 90)}`);
  return id;
}

export function resolveEscalation(id: string, answer: string, approved: boolean) {
  const row = q.getEscalation.get(id) as { agent_id: string; question: string; status: string } | undefined;
  if (!row || row.status !== 'pending') return;
  q.resolveEscalation.run(approved ? 'approved' : 'denied', answer, Date.now(), id);
  broadcast('escalation.resolved', { id, answer, approved });
  activity(`escalation ${approved ? 'approved' : 'denied'}: ${trim(row.question, 70)}`);

  const pending = pendingPermissions.get(id);
  if (pending) {
    pendingPermissions.delete(id);
    pending.resolve(
      approved
        ? { behavior: 'allow', updatedInput: {} } // updatedInput replaced at call site
        : { behavior: 'deny', message: `Adam denied this: ${answer || 'not allowed'}` }
    );
  }
  const agent = q.getAgent.get(row.agent_id) as AgentRow | undefined;
  if (agent && agent.status === 'waiting') setAgentStatus(row.agent_id, 'running');
  notifyJarvis(
    `Escalation ${id} (agent ${row.agent_id}) was ${approved ? 'APPROVED' : 'DENIED'} by Adam${answer ? `: "${answer}"` : ''}.`
  );
}

function setAgentStatus(id: string, status: string, summary?: string) {
  const done = ['completed', 'failed', 'stopped'].includes(status);
  q.updateAgentStatus.run(status, summary ?? null, done ? Date.now() : null, id);
  broadcast('agents.update', { agent: q.getAgent.get(id) });
}

// --- spawning ---

export interface SpawnSpec {
  title: string;
  prompt: string;
  model: string;
  cwd: string;
  taskId?: string | null;
}

export function spawnAgent(spec: SpawnSpec): string {
  const id = shortId('a');
  q.insertAgent.run(id, spec.taskId ?? null, spec.title, spec.model, spec.cwd, 'queued', Date.now());
  if (spec.taskId) q.updateTaskStatus.run('running', id, spec.taskId);
  logEvent(id, 'spawned', { title: spec.title, model: spec.model, cwd: spec.cwd, prompt: spec.prompt });
  broadcast('agents.update', { agent: q.getAgent.get(id) });
  activity(`agent ${id} queued: ${spec.title} [${spec.model}]`);

  const running = [...live.values()].filter((w) => !w.stopping).length;
  if (running >= MAX_CONCURRENT_WORKERS) {
    startQueue.push(id);
  } else {
    void runWorker(id, spec);
  }
  return id;
}

function startNextQueued() {
  const nextId = startQueue.shift();
  if (!nextId) return;
  const agent = q.getAgent.get(nextId) as AgentRow | undefined;
  if (!agent || agent.status !== 'queued') return startNextQueued();
  const spawnEvent = (q.eventsForAgent.all(nextId) as { type: string; payload: string }[]).find(
    (e) => e.type === 'spawned'
  );
  const spec = spawnEvent ? (JSON.parse(spawnEvent.payload) as SpawnSpec & { prompt: string }) : null;
  if (!spec) return startNextQueued();
  void runWorker(nextId, { ...spec, taskId: agent.task_id });
}

async function runWorker(id: string, spec: SpawnSpec) {
  const input = new AsyncQueue<SDKUserMessage>();
  input.push(userMsg(spec.prompt));

  const guard = async (
    toolName: string,
    toolInput: Record<string, unknown>
  ): Promise<PermissionResult> => {
    const danger = classifyToolUse(toolName, toolInput);
    if (!danger) return { behavior: 'allow', updatedInput: toolInput };

    setAgentStatus(id, 'waiting');
    const escId = createEscalation(
      id,
      `Agent ${id} (${spec.title}) wants to run a guarded action — ${danger}. Allow?`,
      JSON.stringify({ tool: toolName, input: toolInput }, null, 2),
      ['Allow', 'Deny']
    );
    notifyJarvis(
      `Agent ${id} ("${spec.title}") is blocked on a guarded action (${danger}). Escalation ${escId} is waiting for Adam in the Needs You pane. If Adam has already given direction, advise him aloud.`
    );
    logEvent(id, 'guarded', { tool: toolName, danger });
    broadcast('agent.event', { agentId: id, event: { type: 'guarded', danger, ts: Date.now() } });

    const result = await new Promise<PermissionResult>((resolve) => {
      pendingPermissions.set(escId, { resolve });
    });
    // 'allow' resolutions carry empty updatedInput — restore the real input here.
    if (result.behavior === 'allow') return { behavior: 'allow', updatedInput: toolInput };
    return result;
  };

  const appendPrompt = [
    `You are worker agent ${id} ("${spec.title}") inside Jarvis OS, dispatched by JARVIS — the orchestrator of Adam's local agent system.`,
    `Work autonomously in your assigned directory: ${spec.cwd}. Stay in scope; do exactly the task you were given.`,
    `You cannot ask Adam questions interactively. If truly blocked, state clearly what you need and finish.`,
    `Verify your work before reporting (build, run, screenshot — whatever applies). Never claim something works without checking.`,
    `Do not deploy, push to remotes, bulk-delete, or spend money — such actions are escalated automatically; avoid them unless the task explicitly requires them.`,
    `End with a concise report: what you did, files touched, how you verified it, anything left over.`,
  ].join('\n');

  const handle = query({
    prompt: input,
    options: {
      model: resolveModel(spec.model),
      cwd: spec.cwd,
      permissionMode: 'acceptEdits',
      systemPrompt: { type: 'preset', preset: 'claude_code', append: appendPrompt },
      settingSources: ['user', 'project'],
      maxTurns: WORKER_MAX_TURNS,
      canUseTool: guard,
      includePartialMessages: false,
    },
  });

  live.set(id, { id, input, handle, stopping: false });
  setAgentStatus(id, 'running');
  activity(`agent ${id} running: ${spec.title}`);

  const emit = (type: string, payload: Record<string, unknown>) => {
    logEvent(id, type, payload);
    broadcast('agent.event', { agentId: id, event: { type, ...payload, ts: Date.now() } });
  };

  try {
    for await (const msg of handle) {
      if (msg.type === 'system' && msg.subtype === 'init') {
        q.setAgentSession.run(msg.session_id, id);
      } else if (msg.type === 'assistant') {
        for (const block of msg.message.content) {
          if (block.type === 'text' && block.text.trim()) {
            emit('text', { text: block.text });
          } else if (block.type === 'tool_use') {
            emit('tool', {
              name: block.name,
              summary: summarizeToolCall(block.name, block.input as Record<string, unknown>),
            });
          }
        }
      } else if (msg.type === 'result') {
        const ok = msg.subtype === 'success';
        const summary = ok && 'result' in msg ? trim(String(msg.result ?? ''), 2000) : `ended: ${msg.subtype}`;
        const cost = 'total_cost_usd' in msg ? (msg.total_cost_usd as number) : 0;
        const turns = 'num_turns' in msg ? (msg.num_turns as number) : 0;
        emit('result', { ok, summary, cost, turns });
        finishWorker(id, spec, ok ? 'completed' : 'failed', summary, cost, turns);
        return;
      }
    }
    // Stream ended without a result (interrupt or close)
    const agent = q.getAgent.get(id) as AgentRow;
    if (agent.status !== 'stopped') finishWorker(id, spec, 'stopped', 'stream closed', 0, 0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    emit('error', { message });
    finishWorker(id, spec, 'failed', `crashed: ${trim(message, 400)}`, 0, 0);
  }
}

function finishWorker(
  id: string,
  spec: SpawnSpec,
  status: 'completed' | 'failed' | 'stopped',
  summary: string,
  cost: number,
  turns: number
) {
  const worker = live.get(id);
  if (worker) {
    worker.input.close();
    live.delete(id);
  }
  setAgentStatus(id, status, summary);
  if (spec.taskId) q.updateTaskStatus.run(status === 'completed' ? 'completed' : 'failed', id, spec.taskId);
  const costLine = cost ? ` · $${cost.toFixed(2)} · ${turns} turns` : '';
  activity(`agent ${id} ${status}: ${spec.title}${costLine}`);
  notifyJarvis(
    `Agent ${id} ("${spec.title}"${spec.taskId ? `, task ${spec.taskId}` : ''}) ${status.toUpperCase()}${costLine}. Report: ${trim(summary, 1200)}`
  );
  startNextQueued();
}

// --- controls ---

export function steerAgent(id: string, message: string, from: 'adam' | 'jarvis') {
  const worker = live.get(id);
  if (!worker) return false;
  logEvent(id, 'steer', { from, message });
  broadcast('agent.event', { agentId: id, event: { type: 'steer', from, message, ts: Date.now() } });
  worker.input.push(userMsg(`[Steering message from ${from === 'adam' ? 'Adam' : 'Jarvis'}]: ${message}`));
  return true;
}

export function stopAgent(id: string): boolean {
  const worker = live.get(id);
  if (!worker) return false;
  worker.stopping = true;
  setAgentStatus(id, 'stopped', 'stopped by request');
  void worker.handle.interrupt().catch(() => {});
  worker.input.close();
  live.delete(id);
  activity(`agent ${id} stopped`);
  startNextQueued();
  return true;
}

export function agentStatusReport(id: string): string {
  const agent = q.getAgent.get(id) as AgentRow | undefined;
  if (!agent) return `No agent ${id}.`;
  const recent = q.recentEventsForAgent.all(id, 12) as { type: string; payload: string }[];
  const lines = recent.map((e) => {
    const p = JSON.parse(e.payload);
    if (e.type === 'text') return `said: ${trim(p.text, 160)}`;
    if (e.type === 'tool') return `tool: ${p.summary}`;
    if (e.type === 'result') return `result: ${trim(p.summary, 200)}`;
    return `${e.type}`;
  });
  return `Agent ${id} ("${agent.title}") — status ${agent.status}, model ${agent.model}, cwd ${agent.cwd}.\nRecent:\n${lines.join('\n')}`;
}

export function listAgentsReport(): string {
  const agents = q.allAgents.all() as AgentRow[];
  if (!agents.length) return 'No agents yet.';
  return agents
    .slice(0, 25)
    .map((a) => `${a.id} · ${a.status} · ${a.model} · "${a.title}"${a.task_id ? ` (task ${a.task_id})` : ''}`)
    .join('\n');
}

export function runningWorkerCount(): number {
  return [...live.values()].filter((w) => !w.stopping).length;
}
