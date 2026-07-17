import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Sphere } from '../Sphere';
import { useApp } from '../store';
import { api } from '../ws';
import { setDirectiveHandler, startListening, stopListening, stopSpeaking, sttSupported } from '../voice';
import { PlanCard } from './PlanCard';

const HISTORY_KEY = 'jos.directiveHistory';

function loadHistory(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(list: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(-50)));
  } catch {
    /* ignore */
  }
}

const MicButton = memo(function MicButton() {
  const listening = useApp((s) => s.listening);
  if (!sttSupported) {
    return (
      <button className="mic-btn disabled" title="Speech recognition needs Chrome">
        ◉
      </button>
    );
  }
  return (
    <button
      className={`mic-btn ${listening ? 'live' : ''}`}
      title="Hold to talk (or hold Space)"
      onMouseDown={startListening}
      onMouseUp={stopListening}
      onMouseLeave={() => listening && stopListening()}
      onTouchStart={(e) => {
        e.preventDefault();
        startListening();
      }}
      onTouchEnd={stopListening}
    >
      ◉
    </button>
  );
});

/** Transcript list — isolated so activity ticks don't re-render it. */
const Transcript = memo(function Transcript({ workMode }: { workMode: boolean }) {
  const transcript = useApp((s) => s.transcript);
  const streaming = useApp((s) => s.streamingText);
  const feedRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);

  // Pause autoscroll if the user scrolls up; resume when they return to bottom.
  const onScroll = () => {
    const el = feedRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  useLayoutEffect(() => {
    const el = feedRef.current;
    if (el && pinnedRef.current) el.scrollTop = el.scrollHeight;
  }, [transcript, streaming]);

  // Focus mode shows a short tail; work mode shows the full (capped) history.
  const shown = workMode ? transcript : transcript.slice(-14);

  return (
    <div className={`chat-feed ${workMode ? 'work' : ''}`} ref={feedRef} onScroll={onScroll}>
      {shown.map((m, i) => (
        <div key={`${m.ts}-${i}`} className={`chat-msg ${m.role}`}>
          <span className="chat-who">{m.role === 'adam' ? 'YOU' : 'JARVIS'}</span>
          <span className="chat-text">{m.text}</span>
        </div>
      ))}
      {streaming && (
        <div className="chat-msg jarvis">
          <span className="chat-who">JARVIS</span>
          <span className="chat-text">
            {streaming}
            <span className="caret">▍</span>
          </span>
        </div>
      )}
    </div>
  );
});

export function JarvisStage() {
  const interim = useApp((s) => s.interim);
  const jarvisState = useApp((s) => s.jarvisState);
  const speaking = useApp((s) => s.speaking);
  const layoutMode = useApp((s) => s.layoutMode);
  const messageCount = useApp((s) => s.transcript.length);
  const anyRunning = useApp((s) => s.agents.some((a) => ['running', 'waiting', 'queued'].includes(a.status)));

  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<string[]>(loadHistory());
  const histIdxRef = useRef<number>(-1); // -1 = not browsing history

  // The topbar toggle is authoritative. If the user hasn't expressed a
  // preference yet (first ever load), auto-pick work mode when there's real
  // activity so the transcript dominates without a manual switch.
  const hasPref = layoutMode !== null && layoutMode !== undefined;
  const workMode = hasPref
    ? layoutMode === 'work'
    : messageCount > 3 || anyRunning;

  const sendDirective = (text: string) => {
    const t = text.trim();
    if (!t) return;
    api.directive(t);
    const hist = historyRef.current.filter((h) => h !== t);
    hist.push(t);
    historyRef.current = hist;
    saveHistory(hist);
    histIdxRef.current = -1;
    setDraft('');
    // Keep focus for rapid-fire directives.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  useEffect(() => {
    setDirectiveHandler(sendDirective);
  }, []);

  // Auto-grow the textarea up to ~4 lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 108) + 'px';
  }, [draft, interim]);

  // Hold Space to talk when not typing.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
        return;
      e.preventDefault();
      startListening();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') stopListening();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (interim) return; // showing live speech; ignore keys
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendDirective(draft);
      return;
    }
    // Up/Down recall previous directives when the caret is at the start / draft is short.
    const hist = historyRef.current;
    if (e.key === 'ArrowUp' && hist.length && (draft === '' || histIdxRef.current >= 0)) {
      const atTop = e.currentTarget.selectionStart === 0 || histIdxRef.current >= 0;
      if (!atTop) return;
      e.preventDefault();
      const next = histIdxRef.current < 0 ? hist.length - 1 : Math.max(0, histIdxRef.current - 1);
      histIdxRef.current = next;
      setDraft(hist[next]);
    } else if (e.key === 'ArrowDown' && histIdxRef.current >= 0) {
      e.preventDefault();
      const next = histIdxRef.current + 1;
      if (next >= hist.length) {
        histIdxRef.current = -1;
        setDraft('');
      } else {
        histIdxRef.current = next;
        setDraft(hist[next]);
      }
    }
  };

  return (
    <main className={`pane stage ${workMode ? 'work-mode' : 'focus-mode'}`}>
      <div className="sphere-zone">
        <Sphere />
      </div>

      <Transcript workMode={workMode} />

      <PlanCard inline={workMode} />

      <div className="input-bar">
        <MicButton />
        <textarea
          ref={inputRef}
          rows={1}
          className="directive-input"
          placeholder={interim || 'Ask Jarvis anything — Shift+Enter for a new line, ↑ recalls…'}
          value={interim ? interim : draft}
          readOnly={Boolean(interim)}
          onChange={(e) => {
            setDraft(e.target.value);
            if (histIdxRef.current >= 0) histIdxRef.current = -1;
          }}
          onKeyDown={onKeyDown}
        />
        <button
          className={`btn small ${jarvisState === 'thinking' || speaking ? 'danger' : 'ghost'}`}
          disabled={jarvisState !== 'thinking' && !speaking}
          title="Stop Jarvis — interrupt his turn and silence him"
          onClick={() => {
            stopSpeaking();
            api.interruptJarvis();
          }}
        >
          ■
        </button>
        <button className="btn primary small" onClick={() => sendDirective(draft)}>
          ↵
        </button>
      </div>
    </main>
  );
}
