import { useSyncExternalStore } from 'react';
import type {
  ActivityLine,
  Agent,
  AgentEvent,
  ChatMessage,
  Escalation,
  JarvisState,
  Plan,
} from './types';

export interface AppState {
  connected: boolean;
  jarvisState: JarvisState;
  speaking: boolean;
  listening: boolean;
  muted: boolean;
  interim: string;
  transcript: ChatMessage[];
  streamingText: string;
  agents: Agent[];
  plan: Plan | null;
  planSummary: string;
  escalations: Escalation[];
  activity: ActivityLine[];
  openAgentId: string | null;
  agentEvents: Record<string, AgentEvent[]>;
}

let state: AppState = {
  connected: false,
  jarvisState: 'idle',
  speaking: false,
  listening: false,
  muted: false,
  interim: '',
  transcript: [],
  streamingText: '',
  agents: [],
  plan: null,
  planSummary: '',
  escalations: [],
  activity: [],
  openAgentId: null,
  agentEvents: {},
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
  mutate((s) => ({ transcript: [...s.transcript.slice(-120), msg], streamingText: '' }));
}

export function pushActivity(line: ActivityLine) {
  mutate((s) => ({ activity: [line, ...s.activity.slice(0, 199)] }));
}

export function pushAgentEvent(agentId: string, event: AgentEvent) {
  mutate((s) => {
    if (!(agentId in s.agentEvents)) return {};
    return {
      agentEvents: {
        ...s.agentEvents,
        [agentId]: [...(s.agentEvents[agentId] ?? []), event],
      },
    };
  });
}
