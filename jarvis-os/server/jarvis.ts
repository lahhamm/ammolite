import {
  query,
  type Query,
  type SDKUserMessage,
  type PermissionResult,
} from '@anthropic-ai/claude-agent-sdk';
import { MODELS, PROJECTS_ROOT, WORKSPACE_ROOT, MAX_CONCURRENT_WORKERS } from './config.js';
import { q, logEvent, type AgentRow } from './db.js';
import { AsyncQueue, summarizeToolCall, trim } from './util.js';
import { broadcast, activity } from './bus.js';
import { registerJarvisNotify } from './jarvisLink.js';
import { jarvisToolServer, JARVIS_TOOL_NAMES } from './tools.js';
import { classifyToolUse } from './workers.js';

const SYSTEM_PROMPT = `You are JARVIS — Adam's personal AI chief of staff, running inside Jarvis OS, a local mission-control he built on his Mac. You are the orchestrator; worker agents do the heavy lifting.

VOICE & STYLE
- Your replies are usually spoken aloud through TTS. Write plain, speakable sentences — no markdown, no bullet lists, no code blocks, no emoji.
- Default to 1-3 short sentences. Calm, precise, lightly dry British wit. "Sir" is fine occasionally, never every line.
- When something finishes or fails, lead with the fact, then the one detail that matters.

TRIAGE EVERY DIRECTIVE
1. Question or trivial ask → answer directly yourself.
2. Single well-scoped task → spawn_agent immediately (say so: "On it — dispatching a Sonnet agent.").
3. Big or multi-part project → inspect what exists if needed (Read/Glob/Grep/light Bash), then propose_plan with tasks, dependencies, a model per task, and a cwd per task. Then WAIT — never spawn before the approval note arrives.

MODEL POLICY (Adam pays per use — respect it)
- sonnet: default for routine builds, file work, research, automation.
- opus: genuinely hard coding, design-heavy builds, complex multi-step reasoning.
- fable: ONLY when a task already failed on opus, or requires the deepest planning. Adam's words: "only if absolutely necessary."

EXECUTION (after approval)
- Spawn every task whose dependencies are met; the OS caps concurrency at ${MAX_CONCURRENT_WORKERS}, queue the rest freely.
- System notes ([SYSTEM NOTE] …) are from the OS, not Adam: agent completions, approvals, escalation answers. React to them — spawn dependents, steer or restart drifting agents, escalate a model tier on repeated failure.
- Irreversible or costly calls (deploys, pushes, deletions, purchases) get auto-escalated to Adam's Needs You pane. Use ask_adam yourself for decisions or missing credentials.
- When a whole project completes, give Adam a short spoken wrap-up.

WORKING DIRECTORIES
- Existing projects live under ${PROJECTS_ROOT} (e.g. reclaim-integrative, roofer-demo-site, ivy-landing).
- Brand-new output goes under ${WORKSPACE_ROOT}/<slug>. Always set cwd explicitly on every task.

RULES
- You never Write or Edit files yourself — workers do that. Your Bash is for inspection only.
- Worker prompts must be fully self-contained: context, exact deliverable, how to verify. Workers cannot ask Adam questions.
- If nothing needs attention, reply in one short sentence.`;

type JarvisState = 'idle' | 'thinking' | 'error';

class Jarvis {
  private input = new AsyncQueue<SDKUserMessage>();
  private handle: Query | null = null;
  private restarts = 0;
  state: JarvisState = 'idle';

  start() {
    registerJarvisNotify((text) => this.push(text, 'note'));
    this.reapOrphans();
    this.run();
  }

  /** Agents left 'running' in the DB from a previous server process are dead. */
  private reapOrphans() {
    const agents = q.allAgents.all() as AgentRow[];
    for (const agent of agents) {
      if (['running', 'queued', 'waiting', 'starting'].includes(agent.status)) {
        q.updateAgentStatus.run('stopped', 'lost on server restart', Date.now(), agent.id);
      }
    }
  }

  private setState(state: JarvisState) {
    this.state = state;
    broadcast('jarvis.status', { state });
  }

  sendUser(text: string) {
    logEvent('jarvis', 'adam', { text });
    broadcast('jarvis.message', { role: 'adam', text, ts: Date.now() });
    this.push(text, 'adam');
  }

  private push(text: string, kind: 'adam' | 'note') {
    if (kind === 'note') logEvent('jarvis', 'note', { text });
    this.input.push({
      type: 'user',
      message: { role: 'user', content: [{ type: 'text', text }] },
      parent_tool_use_id: null,
      session_id: '',
    } as SDKUserMessage);
    this.setState('thinking');
  }

  private async run() {
    const canUseTool = async (
      toolName: string,
      toolInput: Record<string, unknown>
    ): Promise<PermissionResult> => {
      if (toolName === 'Bash') {
        const danger = classifyToolUse(toolName, toolInput);
        if (danger) {
          return {
            behavior: 'deny',
            message: `Denied (${danger}). You are the orchestrator — inspection only. Delegate this to a worker agent instead.`,
          };
        }
      }
      return { behavior: 'allow', updatedInput: toolInput };
    };

    try {
      this.handle = query({
        prompt: this.input,
        options: {
          model: MODELS.jarvis,
          cwd: PROJECTS_ROOT,
          systemPrompt: SYSTEM_PROMPT,
          mcpServers: { jarvis: jarvisToolServer },
          allowedTools: ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch', ...JARVIS_TOOL_NAMES],
          disallowedTools: ['Write', 'Edit', 'NotebookEdit', 'Task'],
          settingSources: [],
          includePartialMessages: true,
          canUseTool,
        },
      });

      broadcast('jarvis.status', { state: 'idle', booted: true });
      activity('JARVIS online');

      for await (const msg of this.handle) {
        if (msg.type === 'stream_event') {
          const ev = msg.event as { type: string; delta?: { type: string; text?: string } };
          if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
            broadcast('jarvis.delta', { text: ev.delta.text });
          }
        } else if (msg.type === 'assistant') {
          for (const block of msg.message.content) {
            if (block.type === 'text' && block.text.trim()) {
              logEvent('jarvis', 'jarvis', { text: block.text });
              broadcast('jarvis.message', { role: 'jarvis', text: block.text, ts: Date.now() });
            } else if (block.type === 'tool_use') {
              const summary = summarizeToolCall(block.name, block.input as Record<string, unknown>);
              logEvent('jarvis', 'jarvis.tool', { name: block.name, summary });
              activity(`jarvis → ${block.name.replace('mcp__jarvis__', '')}: ${trim(summary, 90)}`);
            }
          }
        } else if (msg.type === 'result') {
          this.setState('idle');
          if ('total_cost_usd' in msg && typeof msg.total_cost_usd === 'number' && msg.total_cost_usd > 0.5) {
            activity(`jarvis turn cost $${msg.total_cost_usd.toFixed(2)}`);
          }
        }
      }
      // Input closed or session ended
      this.setState('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      activity(`JARVIS session error: ${trim(message, 160)}`);
      broadcast('jarvis.status', { state: 'error', message });
      this.restarts += 1;
      if (this.restarts <= 3) {
        setTimeout(() => {
          this.input = new AsyncQueue<SDKUserMessage>();
          this.push(
            '[SYSTEM NOTE] Your previous session crashed and was restarted. Briefly tell Adam you are back online.',
            'note'
          );
          this.run();
        }, 4000);
      }
    }
  }

  async interrupt() {
    await this.handle?.interrupt().catch(() => {});
    this.setState('idle');
  }
}

export const jarvis = new Jarvis();
