import { useSyncExternalStore } from 'react';
import type {
  ActivityLine,
  Agent,
  AgentEvent,
  ChatMessage,
  Escalation,
  Health,
  JarvisState,
  LayoutMode,
  Plan,
} from './types';

function loadLayout(): LayoutMode | null {
  try {
    const v = localStorage.getItem('jos.layout');
    return v === 'work' || v === 'focus' ? v : null;
  } catch {
    return null;
  }
}

export interface AppState {
  connected: boolean;
  connectAttempts: number;
  health: Health | null;
  jarvisState: JarvisState;
  speaking: boolean;
  listening: boolean;
  muted: boolean;
  interim: string;
  transcript: ChatMessage[];
  streamingText: string;
  agents: Agent[];
  agentLastAction: Record<string, { line: string; ts: number }>;
  plan: Plan | null;
  planSummary: string;
  escalations: Escalation[];
  activity: ActivityLine[];
  openAgentId: string | null;
  agentEvents: Record<string, AgentEvent[]>;
  sessionCost: number;
  layoutMode: LayoutMode | null;
}

let state: AppState = {
  connected: false,
  connectAttempts: 0,
  health: null,
  jarvisState: 'idle',
  speaking: false,
  listening: false,
  muted: false,
  interim: '',
  transcript: [],
  streamingText: '',
  agents: [],
  agentLastAction: {},
  plan: null,
  planSummary: '',
  escalations: [],
  activity: [],
  openAgentId: null,
  agentEvents: {},
  sessionCost: 0,
  layoutMode: loadLayout(),
};

const listeners = new Set<() => void>();

export function getState(): AppState {
  return state;
}

export function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  for (const fn of listeners) fn();
}

export function mutate(fn: (s: AppState) => Partial<AppState>) {
  setState(fn(state));
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useApp<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

// --- mutation helpers used by ws/voice ---

export function upsertAgent(agent: Agent) {
  mutate((s) => {
    const idx = s.agents.findIndex((a) => a.id === agent.id);
    const agents = [...s.agents];
    if (idx >= 0) agents[idx] = agent;
    else agents.unshift(agent);
    return { agents };
  });
}

export function pushChat(msg: ChatMessage) {
  // Keep up to 200 messages in memory; work-mode renders the recent slice.
  mutate((s) => ({ transcript: [...s.transcript.slice(-199), msg], streamingText: '' }));
}

export function pushActivity(line: ActivityLine) {
  mutate((s) => ({ activity: [line, ...s.activity.slice(0, 199)] }));
}

/** One-line human summary of an agent event, for the roster "last action" line. */
function eventSummary(event: AgentEvent): string | null {
  switch (event.type) {
    case 'text': {
      const t = String(event.text ?? '').replace(/\s+/g, ' ').trim();
      return t ? t.slice(0, 80) : null;
    }
    case 'tool':
      return `⚙ ${String(event.summary ?? event.name ?? '')}`.slice(0, 80);
    case 'steer':
      return `→ steer: ${String(event.message ?? '')}`.slice(0, 80);
    case 'guarded':
      return `⛔ ${String(event.danger ?? 'guarded')}`.slice(0, 80);
    case 'result':
      return event.ok ? '✓ done' : '✗ failed';
    case 'error':
      return `✗ ${String(event.message ?? 'error')}`.slice(0, 80);
    default:
      return null;
  }
}

export function pushAgentEvent(agentId: string, event: AgentEvent) {
  mutate((s) => {
    const patch: Partial<AppState> = {};
    // Always track the latest action for the roster card, even if the overlay
    // for this agent has never been opened (so agentEvents has no entry yet).
    const summary = eventSummary(event);
    if (summary) {
      patch.agentLastAction = { ...s.agentLastAction, [agentId]: { line: summary, ts: event.ts } };
    }
    if (agentId in s.agentEvents) {
      patch.agentEvents = {
        ...s.agentEvents,
        [agentId]: [...(s.agentEvents[agentId] ?? []), event],
      };
    }
    return patch;
  });
}

export function setLayout(mode: LayoutMode) {
  try {
    localStorage.setItem('jos.layout', mode);
  } catch {
    /* ignore */
  }
  setState({ layoutMode: mode });
}
