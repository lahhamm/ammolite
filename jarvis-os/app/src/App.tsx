import { useEffect, useState } from 'react';
import { Roster } from './panes/Roster';
import { JarvisStage } from './panes/JarvisStage';
import { NeedsYou } from './panes/NeedsYou';
import { AgentOverlay } from './panes/AgentOverlay';
import { setState, useApp } from './store';
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

export function App() {
  const connected = useApp((s) => s.connected);
  const jarvisState = useApp((s) => s.jarvisState);
  const speaking = useApp((s) => s.speaking);
  const listening = useApp((s) => s.listening);
  const muted = useApp((s) => s.muted);
  const running = useApp((s) => s.agents.filter((a) => ['running', 'waiting'].includes(a.status)).length);
  const escalationCount = useApp((s) => s.escalations.length);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [needsOpen, setNeedsOpen] = useState(false);
  const [armReset, setArmReset] = useState(false);

  const status = listening ? 'listening' : speaking ? 'speaking' : (STATE_LABEL[jarvisState] ?? jarvisState);

  return (
    <div className="os">
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
