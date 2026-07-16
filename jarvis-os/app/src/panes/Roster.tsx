import { useApp } from '../store';
import { openAgent } from '../ws';
import type { Agent } from '../types';

const MODEL_BADGE: Record<string, string> = { sonnet: 'S', opus: 'O', fable: 'F' };

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <button className={`agent-card status-${agent.status}`} onClick={() => void openAgent(agent.id)}>
      <span className="status-dot" />
      <span className="agent-card-main">
        <span className="agent-card-title">{agent.title}</span>
        <span className="agent-card-sub">
          {agent.status}
          {agent.status === 'running' ? ` · ${timeAgo(agent.created_at)}` : ''}
        </span>
      </span>
      <span className={`model-badge model-${agent.model}`}>{MODEL_BADGE[agent.model] ?? '?'}</span>
    </button>
  );
}

export function Roster() {
  const agents = useApp((s) => s.agents);
  const active = agents.filter((a) => ['running', 'waiting', 'queued', 'starting'].includes(a.status));
  const done = agents.filter((a) => !['running', 'waiting', 'queued', 'starting'].includes(a.status)).slice(0, 30);

  return (
    <aside className="pane roster">
      <div className="pane-label">Agents</div>
      {active.length === 0 && done.length === 0 && (
        <div className="empty-hint">
          No agents yet.
          <br />
          Give Jarvis something big.
        </div>
      )}
      {active.map((a) => (
        <AgentCard key={a.id} agent={a} />
      ))}
      {done.length > 0 && <div className="pane-label dim">History</div>}
      {done.map((a) => (
        <AgentCard key={a.id} agent={a} />
      ))}
    </aside>
  );
}
