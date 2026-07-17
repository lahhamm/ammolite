import {
  getState,
  mutate,
  pushActivity,
  pushAgentEvent,
  pushChat,
  setState,
  upsertAgent,
} from './store';
import type { Agent, AgentEvent, Escalation, Health, Plan } from './types';
import { speak } from './voice';

let socket: WebSocket | null = null;
let retryMs = 800;

// --- coalesced delta streaming: at most one store update per animation frame ---
let deltaBuffer = '';
let deltaRaf = 0;
function flushDeltas() {
  deltaRaf = 0;
  if (!deltaBuffer) return;
  const chunk = deltaBuffer;
  deltaBuffer = '';
  mutate((s) => ({ streamingText: s.streamingText + chunk, jarvisState: 'thinking' }));
}
function queueDelta(text: string) {
  deltaBuffer += text;
  if (!deltaRaf) deltaRaf = requestAnimationFrame(flushDeltas);
}

export function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  socket = new WebSocket(`${proto}://${location.host}/ws`);

  socket.onopen = () => {
    retryMs = 800;
    setState({ connected: true, connectAttempts: 0 });
  };

  socket.onclose = () => {
    mutate((s) => ({ connected: false, connectAttempts: s.connectAttempts + 1 }));
    setTimeout(connect, retryMs);
    retryMs = Math.min(retryMs * 1.6, 8000);
  };

  socket.onerror = () => {
    // onclose will follow; nothing extra to do.
  };

  socket.onmessage = (raw) => {
    let msg: { type: string; [k: string]: unknown };
    try {
      msg = JSON.parse(String(raw.data));
    } catch {
      return;
    }
    handle(msg);
  };
}

// --- health polling: drives the disk-warning chip in the topbar ---
async function pollHealth() {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    if (res.ok) setState({ health: (await res.json()) as Health });
  } catch {
    // Server down — the WS banner already covers this; leave stale health.
  }
}

export function startHealthPolling() {
  void pollHealth();
  setInterval(pollHealth, 15_000);
}

function handle(msg: { type: string; [k: string]: unknown }) {
  switch (msg.type) {
    case 'hello': {
      const s = msg.state as {
        agents: Agent[];
        escalations: Escalation[];
        plan: Plan | null;
        transcript: { role: 'adam' | 'jarvis'; text: string; ts: number }[];
        jarvisState: 'idle' | 'thinking' | 'error';
        sessionCost?: number;
      };
      setState({
        agents: s.agents,
        escalations: s.escalations,
        plan: s.plan && s.plan.project.status === 'pending_approval' ? s.plan : null,
        transcript: s.transcript,
        jarvisState: s.jarvisState,
        sessionCost: typeof s.sessionCost === 'number' ? s.sessionCost : 0,
      });
      break;
    }
    case 'jarvis.delta':
      queueDelta(String(msg.text ?? ''));
      break;
    case 'jarvis.message': {
      const role = msg.role as 'adam' | 'jarvis';
      const text = String(msg.text ?? '');
      pushChat({ role, text, ts: Number(msg.ts ?? Date.now()) });
      if (role === 'jarvis' && !getState().muted) speak(text);
      break;
    }
    case 'jarvis.status':
      setState({ jarvisState: (msg.state as 'idle' | 'thinking' | 'error') ?? 'idle' });
      break;
    case 'plan.proposed':
      setState({ plan: msg.plan as Plan, planSummary: String(msg.summary ?? '') });
      break;
    case 'plan.updated': {
      const plan = msg.plan as Plan;
      if (plan.project.status !== 'pending_approval') setState({ plan: null, planSummary: '' });
      else setState({ plan });
      break;
    }
    case 'agents.update':
      upsertAgent(msg.agent as Agent);
      break;
    case 'agent.event': {
      const event = msg.event as AgentEvent;
      pushAgentEvent(String(msg.agentId), event);
      if (event.type === 'result' && typeof event.cost === 'number' && event.cost > 0) {
        mutate((s) => ({ sessionCost: s.sessionCost + (event.cost as number) }));
      }
      break;
    }
    case 'escalation.new':
      mutate((s) => ({ escalations: [...s.escalations, normalizeEscalation(msg.escalation as Escalation)] }));
      break;
    case 'escalation.resolved':
      mutate((s) => ({ escalations: s.escalations.filter((e) => e.id !== msg.id) }));
      break;
    case 'activity':
      pushActivity({ line: String(msg.line ?? ''), ts: Number(msg.ts ?? Date.now()) });
      break;
  }
}

function normalizeEscalation(e: Escalation & { options: unknown }): Escalation {
  return {
    ...e,
    options: typeof e.options === 'string' ? (JSON.parse(e.options) as string[]) : (e.options as string[] | null),
  };
}

function send(payload: Record<string, unknown>) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}

export const api = {
  directive: (text: string) => send({ type: 'directive', text }),
  approvePlan: (projectId: string, edits: Record<string, { model?: string; cwd?: string }>) =>
    send({ type: 'plan.approve', projectId, edits }),
  rejectPlan: (projectId: string, reason: string) => send({ type: 'plan.reject', projectId, reason }),
  answerEscalation: (id: string, answer: string, approved: boolean) =>
    send({ type: 'escalation.answer', id, answer, approved }),
  steerAgent: (id: string, text: string) => send({ type: 'agent.steer', id, text }),
  stopAgent: (id: string) => send({ type: 'agent.stop', id }),
  interruptJarvis: () => send({ type: 'jarvis.interrupt' }),
  resetJarvis: () => send({ type: 'jarvis.reset' }),
};

export async function openAgent(id: string) {
  setState({ openAgentId: id });
  mutate((s) => ({ agentEvents: { ...s.agentEvents, [id]: s.agentEvents[id] ?? [] } }));
  try {
    const res = await fetch(`/api/agents/${id}/events`);
    const events = (await res.json()) as AgentEvent[];
    mutate((s) => ({ agentEvents: { ...s.agentEvents, [id]: events } }));
  } catch {
    // backfill failure is non-fatal; live events still stream
  }
}
