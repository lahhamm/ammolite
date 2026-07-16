import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { WORKSPACE_ROOT } from './config.js';
import { q, logEvent, type TaskRow } from './db.js';
import { shortId } from './util.js';
import { broadcast, activity } from './bus.js';
import { getPlanPayload } from './plans.js';
import {
  spawnAgent,
  steerAgent,
  stopAgent,
  agentStatusReport,
  listAgentsReport,
  createEscalation,
  runningWorkerCount,
} from './workers.js';

const ok = (text: string) => ({ content: [{ type: 'text' as const, text }] });

const modelEnum = z.enum(['sonnet', 'opus', 'fable']);

function resolveCwd(cwd: string | undefined, fallbackSlug: string): string {
  if (!cwd || !cwd.trim()) {
    const dir = path.join(WORKSPACE_ROOT, fallbackSlug);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
  const abs = path.resolve(cwd);
  if (!fs.existsSync(abs)) {
    if (abs.startsWith(WORKSPACE_ROOT)) {
      fs.mkdirSync(abs, { recursive: true });
    } else {
      throw new Error(`cwd does not exist: ${abs}. Use an existing directory or a path under ${WORKSPACE_ROOT}.`);
    }
  }
  return abs;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'project';
}

const proposePlan = tool(
  'propose_plan',
  'Propose a multi-task plan for a big project. Renders a plan card for Adam to approve. Do NOT spawn agents until you receive the approval note.',
  {
    project_name: z.string().describe('Short human name for the project'),
    summary: z.string().describe('1-2 sentence summary of the overall goal'),
    workspace_dir: z.string().optional().describe('Base directory for the project if it has one'),
    tasks: z
      .array(
        z.object({
          id: z.string().describe('Short task id like t1, t2'),
          title: z.string(),
          prompt: z.string().describe('Full self-contained instructions for the worker agent'),
          model: modelEnum.describe('sonnet = routine, opus = hard, fable = only if absolutely necessary'),
          cwd: z.string().optional().describe('Working directory for this task'),
          depends_on: z.array(z.string()).optional().describe('Task ids that must complete first'),
        })
      )
      .min(1)
      .max(20),
  },
  async (args) => {
    const projectId = shortId('p');
    const slug = slugify(args.project_name);
    q.insertProject.run(projectId, args.project_name, 'pending_approval', args.workspace_dir ?? null, Date.now());
    for (const t of args.tasks) {
      const taskId = `${projectId}.${t.id}`;
      const cwd = t.cwd ?? args.workspace_dir ?? path.join(WORKSPACE_ROOT, slug);
      q.insertTask.run(
        taskId,
        projectId,
        t.title,
        t.prompt,
        t.model,
        cwd,
        JSON.stringify((t.depends_on ?? []).map((d) => `${projectId}.${d}`)),
        'proposed',
        Date.now()
      );
    }
    const plan = getPlanPayload(projectId)!;
    broadcast('plan.proposed', { plan, summary: args.summary });
    activity(`plan proposed: ${args.project_name} (${args.tasks.length} tasks)`);
    logEvent('jarvis', 'plan.proposed', { projectId, name: args.project_name, tasks: args.tasks.length });
    return ok(
      `Plan ${projectId} presented to Adam for approval (${args.tasks.length} tasks). Task ids are prefixed: ${plan.tasks
        .map((t) => t.id)
        .join(', ')}. WAIT for the approval system note before spawning anything. Tell Adam briefly what you proposed.`
    );
  }
);

const spawnAgentTool = tool(
  'spawn_agent',
  'Spawn a worker agent. Either pass task_id from an approved plan, or title+prompt(+model,+cwd) for an ad-hoc agent.',
  {
    task_id: z.string().optional().describe('Task id from an approved plan'),
    title: z.string().optional(),
    prompt: z.string().optional(),
    model: modelEnum.optional(),
    cwd: z.string().optional(),
  },
  async (args) => {
    if (args.task_id) {
      const task = q.getTask.get(args.task_id) as TaskRow | undefined;
      if (!task) return ok(`No task ${args.task_id}.`);
      if (task.status !== 'approved') return ok(`Task ${args.task_id} is "${task.status}", not approved — cannot spawn.`);
      const deps = JSON.parse(task.depends_on) as string[];
      const unmet = deps.filter((d) => {
        const dep = q.getTask.get(d) as TaskRow | undefined;
        return dep && dep.status !== 'completed';
      });
      if (unmet.length) return ok(`Task ${args.task_id} has unmet dependencies: ${unmet.join(', ')}. Wait for them.`);
      const cwd = resolveCwd(task.cwd ?? undefined, slugify(task.title));
      const id = spawnAgent({ title: task.title, prompt: task.prompt, model: task.model, cwd, taskId: task.id });
      return ok(`Agent ${id} spawned for task ${task.id} ("${task.title}", ${task.model}). Running workers: ${runningWorkerCount()}.`);
    }
    if (!args.title || !args.prompt) return ok('Provide either task_id, or title + prompt.');
    let cwd: string;
    try {
      cwd = resolveCwd(args.cwd, slugify(args.title));
    } catch (err) {
      return ok(String(err instanceof Error ? err.message : err));
    }
    const id = spawnAgent({
      title: args.title,
      prompt: args.prompt,
      model: args.model ?? 'sonnet',
      cwd,
      taskId: null,
    });
    return ok(`Agent ${id} spawned ("${args.title}", ${args.model ?? 'sonnet'}, cwd ${cwd}). Running workers: ${runningWorkerCount()}.`);
  }
);

const listAgents = tool('list_agents', 'List recent agents and their statuses.', {}, async () =>
  ok(listAgentsReport())
);

const agentStatus = tool(
  'agent_status',
  'Get status + recent activity for one agent.',
  { agent_id: z.string() },
  async (args) => ok(agentStatusReport(args.agent_id))
);

const steerAgentTool = tool(
  'steer_agent',
  'Send a mid-flight steering message to a running agent.',
  { agent_id: z.string(), message: z.string() },
  async (args) => {
    const sent = steerAgent(args.agent_id, args.message, 'jarvis');
    return ok(sent ? `Steering message delivered to ${args.agent_id}.` : `Agent ${args.agent_id} is not running.`);
  }
);

const stopAgentTool = tool(
  'stop_agent',
  'Stop a running agent immediately.',
  { agent_id: z.string() },
  async (args) => {
    const stopped = stopAgent(args.agent_id);
    return ok(stopped ? `Agent ${args.agent_id} stopped.` : `Agent ${args.agent_id} is not running.`);
  }
);

const askAdam = tool(
  'ask_adam',
  'Put a question in the Needs You pane for Adam. Use for irreversible decisions, missing credentials, or genuine blockers. His answer arrives as a system note.',
  {
    question: z.string(),
    context: z.string().optional(),
    options: z.array(z.string()).max(4).optional(),
  },
  async (args) => {
    const id = createEscalation('jarvis', args.question, args.context ?? null, args.options ?? null);
    return ok(`Question ${id} is now in Adam's Needs You pane. His answer will arrive as a system note. Also say it out loud briefly.`);
  }
);

export const jarvisToolServer = createSdkMcpServer({
  name: 'jarvis',
  version: '1.0.0',
  tools: [proposePlan, spawnAgentTool, listAgents, agentStatus, steerAgentTool, stopAgentTool, askAdam],
});

export const JARVIS_TOOL_NAMES = [
  'mcp__jarvis__propose_plan',
  'mcp__jarvis__spawn_agent',
  'mcp__jarvis__list_agents',
  'mcp__jarvis__agent_status',
  'mcp__jarvis__steer_agent',
  'mcp__jarvis__stop_agent',
  'mcp__jarvis__ask_adam',
];
