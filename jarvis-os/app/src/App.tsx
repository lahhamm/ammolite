import { useEffect, useState } from 'react';
import { Roster } from './panes/Roster';
import { JarvisStage } from './panes/JarvisStage';
import { NeedsYou } from './panes/NeedsYou';
import { AgentOverlay } from './panes/AgentOverlay';
import { setLayout, setState, useApp } from './store';
import { api } from './ws';
import { stopSpeaking } from './voice';

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(t);
  }, []);
  return <span className="clock">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
}

const STATE_LABEL: Record<string, string> = {
  idle: 'standing by',
  thinking: 'processing…',
  error: 'session error',
};

/** Full-width banner shown when the server/WS connection is down. */
function OfflineBanner() {
  const connected = useApp((s) => s.connected);
  const attempts = useApp((s) => s.connectAttempts);
  if (connected) return null;
  return (
    <div className="offline-banner">
      <span className="offline-dot" />
      SERVER OFFLINE — reconnecting…
      {attempts > 0 && <span className="offline-attempts">attempt {attempts}</span>}
    </div>
  );
}

/** Thin mono status strip under the topbar: workers, escalations, cost, disk. */
function StatusStrip() {
  const running = useApp((s) => s.agents.filter((a) => a.status === 'running').length);
  const queued = useApp((s) => s.agents.filter((a) => ['queued', 'starting'].includes(a.status)).length);
  const waiting = useApp((s) => s.agents.filter((a) => a.status === 'waiting').length);
  const escalations = useApp((s) => s.escalations.length);
  const cost = useApp((s) => s.sessionCost);
  const health = useApp((s) => s.health);

  return (
    <div className="status-strip">
      <span className="ss-item">
        <span className="ss-key">run</span> {running}
      </span>
      <span className="ss-item">
        <span className="ss-key">queue</span> {queued}
      </span>
      {waiting > 0 && (
        <span className="ss-item amber">
          <span className="ss-key">waiting</span> {waiting}
        </span>
      )}
      <span className={`ss-item ${escalations > 0 ? 'amber' : ''}`}>
        <span className="ss-key">needs you</span> {escalations}
      </span>
      <span className="ss-item">
        <span className="ss-key">session</span> ${cost.toFixed(2)}
      </span>
      <span className="ss-spacer" />
      {health?.diskFreeMB != null && (
        <span className={`ss-item ${health.diskLow ? 'amber' : 'dim'}`}>
          <span className="ss-key">disk</span> {(health.diskFreeMB / 1024).toFixed(1)}GB free
        </span>
      )}
      {health && (
        <span className={`ss-item dim ${health.dbOk ? '' : 'red'}`}>
          <span className="ss-key">db</span> {health.dbOk ? 'ok' : 'degraded'}
        </span>
      )}
    </div>
  );
}

export function App() {
  const connected = useApp((s) => s.connected);
  const jarvisState = useApp((s) => s.jarvisState);
  const speaking = useApp((s) => s.speaking);
  const listening = useApp((s) => s.listening);
  const muted = useApp((s) => s.muted);
  const running = useApp((s) => s.agents.filter((a) => ['running', 'waiting'].includes(a.status)).length);
  const escalationCount = useApp((s) => s.escalations.length);
  const layoutMode = useApp((s) => s.layoutMode);
  const diskLow = useApp((s) => Boolean(s.health?.diskLow));
  const diskFreeMB = useApp((s) => s.health?.diskFreeMB ?? null);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [needsOpen, setNeedsOpen] = useState(false);
  const [armReset, setArmReset] = useState(false);

  const status = listening ? 'listening' : speaking ? 'speaking' : (STATE_LABEL[jarvisState] ?? jarvisState);

  return (
    <div className="os">
      <OfflineBanner />
      <header className="topbar">
        <button className="pane-toggle" onClick={() => setRosterOpen((v) => !v)}>
          ☰ agents
        </button>
        <div className="brand">
          <span className="brand-mark">◈</span> JARVIS <span className="brand-thin">OS</span>
        </div>
        <div className={`jarvis-state state-${listening ? 'listening' : speaking ? 'speaking' : jarvisState}`}>
          {status}
        </div>
        <div className="topbar-right">
          {diskLow && diskFreeMB != null && (
            <span className="disk-chip" title="Low disk space — free some room before it bites">
              ⚠ {(diskFreeMB / 1024).toFixed(1)}GB
            </span>
          )}
          <div className="layout-toggle" role="tablist" aria-label="Layout mode">
            <button
              className={`layout-opt ${layoutMode === 'focus' ? 'active' : ''}`}
              title="Focus — large sphere"
              onClick={() => setLayout('focus')}
            >
              focus
            </button>
            <button
              className={`layout-opt ${layoutMode === 'work' ? 'active' : ''}`}
              title="Work — transcript-dominant"
              onClick={() => setLayout('work')}
            >
              work
            </button>
          </div>
          <button
            className={`btn ghost small ${armReset ? 'armed' : ''}`}
            title="Fresh Jarvis session — clears his context window; history and agents are kept"
            onClick={() => {
              if (armReset) {
                api.resetJarvis();
                setArmReset(false);
              } else {
                setArmReset(true);
                setTimeout(() => setArmReset(false), 3000);
              }
            }}
          >
            {armReset ? 'confirm reset?' : '↺ new session'}
          </button>
          <span className="workers-chip">{running} active</span>
          <button
            className={`btn ghost small ${muted ? 'muted-on' : ''}`}
            title={muted ? 'Unmute Jarvis' : 'Mute Jarvis'}
            onClick={() => {
              if (!muted) stopSpeaking();
              setState({ muted: !muted });
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <span className={`conn-dot ${connected ? 'on' : 'off'}`} title={connected ? 'connected' : 'reconnecting…'} />
          <Clock />
          <button className="pane-toggle" onClick={() => setNeedsOpen((v) => !v)}>
            feed {escalationCount > 0 && <span className="esc-badge">{escalationCount}</span>}
          </button>
        </div>
      </header>

      <StatusStrip />

      <div
        className={`columns ${rosterOpen ? 'roster-open' : ''} ${needsOpen ? 'needs-open' : ''}`}
        onClick={(e) => {
          if (e.target instanceof HTMLElement && e.target.closest('.stage')) {
            setRosterOpen(false);
            setNeedsOpen(false);
          }
        }}
      >
        <Roster />
        <JarvisStage />
        <NeedsYou />
      </div>

      <AgentOverlay />
    </div>
  );
}
