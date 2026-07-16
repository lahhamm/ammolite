import { useEffect, useRef, useState } from 'react';
import { setState, useApp } from '../store';
import { api } from '../ws';
import type { AgentEvent } from '../types';

function EventLine({ event }: { event: AgentEvent }) {
  switch (event.type) {
    case 'text':
      return <div className="ev ev-text">{String(event.text ?? '')}</div>;
    case 'tool':
      return <div className="ev ev-tool">⚙ {String(event.summary ?? event.name ?? '')}</div>;
    case 'steer':
      return (
        <div className="ev ev-steer">
          → steer ({String(event.from ?? '')}): {String(event.message ?? '')}
        </div>
      );
    case 'guarded':
      return <div className="ev ev-guarded">⛔ guarded action: {String(event.danger ?? '')}</div>;
    case 'result': {
      const ok = Boolean(event.ok);
      const cost = typeof event.cost === 'number' && event.cost > 0 ? ` · $${(event.cost as number).toFixed(2)}` : '';
      return (
        <div className={`ev ev-result ${ok ? 'ok' : 'bad'}`}>
          {ok ? '✓ done' : '✗ failed'}
          {cost} — {String(event.summary ?? '')}
        </div>
      );
    }
    case 'error':
      return <div className="ev ev-error">✗ {String(event.message ?? '')}</div>;
    case 'spawned':
      return <div className="ev ev-tool">spawned · model {String(event.model ?? '')} · {String(event.cwd ?? '')}</div>;
    default:
      return null;
  }
}

const NO_EVENTS: AgentEvent[] = [];

export function AgentOverlay() {
  const openId = useApp((s) => s.openAgentId);
  const agent = useApp((s) => s.agents.find((a) => a.id === s.openAgentId));
  const events = useApp((s) => (s.openAgentId ? (s.agentEvents[s.openAgentId] ?? NO_EVENTS) : NO_EVENTS));
  const [steer, setSteer] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [events.length, openId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setState({ openAgentId: null });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!openId || !agent) return null;

  const running = ['running', 'waiting', 'queued'].includes(agent.status);

  return (
    <div className="overlay-backdrop" onClick={() => setState({ openAgentId: null })}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <div>
            <div className="overlay-title">
              {agent.title}
              <span className={`model-badge model-${agent.model}`}>{agent.model}</span>
              <span className={`status-chip status-${agent.status}`}>{agent.status}</span>
            </div>
            <div className="overlay-sub">
              {agent.id} · <span className="mono">{agent.cwd}</span>
            </div>
          </div>
          <div className="overlay-controls">
            {running && (
              <button className="btn danger small" onClick={() => api.stopAgent(agent.id)}>
                Stop
              </button>
            )}
            <button className="btn ghost small" onClick={() => setState({ openAgentId: null })}>
              ✕
            </button>
          </div>
        </div>

        <div className="overlay-body" ref={bodyRef}>
          {events.length === 0 && <div className="empty-hint">No events yet…</div>}
          {events.map((e, i) => (
            <EventLine key={i} event={e} />
          ))}
        </div>

        {running && (
          <div className="overlay-steer">
            <input
              placeholder="Steer this agent…"
              value={steer}
              onChange={(e) => setSteer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && steer.trim()) {
                  api.steerAgent(agent.id, steer.trim());
                  setSteer('');
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
