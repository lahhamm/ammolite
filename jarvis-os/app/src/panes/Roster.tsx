import { memo, useEffect, useState } from 'react';
import { useApp } from '../store';
import { openAgent } from '../ws';
import type { Agent } from '../types';

const MODEL_BADGE: Record<string, string> = { sonnet: 'S', opus: 'O', fable: 'F' };
const ACTIVE = ['running', 'waiting', 'queued', 'starting'];

function elapsed(fromTs: number, toTs: number): string {
  const s = Math.max(0, Math.floor((toTs - fromTs) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/** Ticks every second so running-agent elapsed times stay live. */
function useTick(active: boolean) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
}

const AgentCard = memo(function AgentCard({ agent }: { agent: Agent }) {
  const lastAction = useApp((s) => s.agentLastAction[agent.id]?.line);
  const isRunning = agent.status === 'running';

  const end = isRunning || agent.status === 'waiting' ? Date.now() : (agent.completed_at ?? Date.now());
  const time = elapsed(agent.created_at, end);

  return (
    <button className={`agent-card status-${agent.status}`} onClick={() => void openAgent(agent.id)}>
      <span className="status-dot" />
      <span className="agent-card-main">
        <span className="agent-card-title">{agent.title}</span>
        <span className="agent-card-sub">
          {agent.status}
          {ACTIVE.includes(agent.status) || agent.completed_at ? ` · ${time}` : ''}
        </span>
        {lastAction && ACTIVE.includes(agent.status) && (
          <span className="agent-card-action">{lastAction}</span>
        )}
      </span>
      <span className={`model-badge model-${agent.model}`}>{MODEL_BADGE[agent.model] ?? '?'}</span>
    </button>
  );
});

/** Derive a project group key from a task id like "p-ab12cd.t3" -> "p-ab12cd". */
function projectOf(agent: Agent): string | null {
  if (!agent.task_id) return null;
  const dot = agent.task_id.indexOf('.');
  return dot > 0 ? agent.task_id.slice(0, dot) : agent.task_id;
}

export function Roster() {
  const agents = useApp((s) => s.agents);
  const active = agents.filter((a) => ACTIVE.includes(a.status));
  const done = agents.filter((a) => !ACTIVE.includes(a.status)).slice(0, 30);

  useTick(active.length > 0);

  // Group active agents by project; ad-hoc (no task_id) agents render loose.
  const groups = new Map<string, Agent[]>();
  const loose: Agent[] = [];
  for (const a of active) {
    const key = projectOf(a);
    if (!key) {
      loose.push(a);
      continue;
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }

  // Plan progress per project: count completed vs. all agents ever seen for it.
  const progressFor = (key: string) => {
    const all = agents.filter((a) => projectOf(a) === key);
    const completed = all.filter((a) => a.status === 'completed').length;
    return { completed, total: all.length };
  };

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

      {[...groups.entries()].map(([key, list]) => {
        const { completed, total } = progressFor(key);
        return (
          <div key={key} className="agent-group">
            <div className="agent-group-head">
              <span className="agent-group-name">{key}</span>
              <span className="agent-group-progress">
                {completed}/{total} done
              </span>
            </div>
            {list.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        );
      })}

      {loose.map((a) => (
        <AgentCard key={a.id} agent={a} />
      ))}

      {done.length > 0 && <div className="pane-label dim spaced">History</div>}
      {done.map((a) => (
        <AgentCard key={a.id} agent={a} />
      ))}
    </aside>
  );
}
