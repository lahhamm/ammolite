import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { setState, useApp } from '../store';
import { api } from '../ws';
import type { AgentEvent } from '../types';

const WINDOW = 300; // render only the most recent N events by default

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

const MemoEventLine = memo(EventLine);

const NO_EVENTS: AgentEvent[] = [];

function transcriptText(events: AgentEvent[]): string {
  return events
    .map((e) => {
      switch (e.type) {
        case 'text':
          return String(e.text ?? '');
        case 'tool':
          return `[tool] ${String(e.summary ?? e.name ?? '')}`;
        case 'steer':
          return `[steer ${String(e.from ?? '')}] ${String(e.message ?? '')}`;
        case 'guarded':
          return `[guarded] ${String(e.danger ?? '')}`;
        case 'result':
          return `[${e.ok ? 'done' : 'failed'}] ${String(e.summary ?? '')}`;
        case 'error':
          return `[error] ${String(e.message ?? '')}`;
        case 'spawned':
          return `[spawned] model ${String(e.model ?? '')} cwd ${String(e.cwd ?? '')}`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n');
}

export function AgentOverlay() {
  const openId = useApp((s) => s.openAgentId);
  const agent = useApp((s) => s.agents.find((a) => a.id === s.openAgentId));
  const events = useApp((s) => (s.openAgentId ? (s.agentEvents[s.openAgentId] ?? NO_EVENTS) : NO_EVENTS));
  const [steer, setSteer] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);

  // Reset the window + copied flag when switching agents.
  useEffect(() => {
    setShowAll(false);
    setCopied(false);
    pinnedRef.current = true;
  }, [openId]);

  const onScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (el && pinnedRef.current) el.scrollTop = el.scrollHeight;
  }, [events.length, openId, showAll]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setState({ openAgentId: null });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!openId || !agent) return null;

  const running = ['running', 'waiting', 'queued'].includes(agent.status);
  const hidden = Math.max(0, events.length - WINDOW);
  const shown = showAll ? events : events.slice(-WINDOW);

  const copyTranscript = () => {
    const text = transcriptText(events);
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  };

  return (
    <div className="overlay-backdrop side" onClick={() => setState({ openAgentId: null })}>
      <div className="overlay-panel side" onClick={(e) => e.stopPropagation()}>
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
            <button className="btn ghost small" onClick={copyTranscript} title="Copy full transcript">
              {copied ? 'copied' : 'copy'}
            </button>
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

        <div className="overlay-body" ref={bodyRef} onScroll={onScroll}>
          {events.length === 0 && <div className="empty-hint">No events yet…</div>}
          {hidden > 0 && !showAll && (
            <button className="load-earlier" onClick={() => setShowAll(true)}>
              load {hidden} earlier event{hidden === 1 ? '' : 's'}
            </button>
          )}
          {shown.map((e, i) => (
            <MemoEventLine key={(showAll ? 0 : hidden) + i} event={e} />
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
