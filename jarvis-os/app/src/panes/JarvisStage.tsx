import { useEffect, useRef, useState } from 'react';
import { Sphere } from '../Sphere';
import { useApp } from '../store';
import { api } from '../ws';
import { setDirectiveHandler, startListening, stopListening, stopSpeaking, sttSupported } from '../voice';
import { PlanCard } from './PlanCard';

function MicButton() {
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
}

export function JarvisStage() {
  const transcript = useApp((s) => s.transcript);
  const streaming = useApp((s) => s.streamingText);
  const interim = useApp((s) => s.interim);
  const jarvisState = useApp((s) => s.jarvisState);
  const speaking = useApp((s) => s.speaking);
  const [draft, setDraft] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendDirective = (text: string) => {
    const t = text.trim();
    if (!t) return;
    api.directive(t);
    setDraft('');
  };

  useEffect(() => {
    setDirectiveHandler(sendDirective);
  }, []);

  // Hold Space to talk when not typing
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

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript, streaming]);

  const recent = transcript.slice(-14);

  return (
    <main className="pane stage">
      <div className="sphere-zone">
        <Sphere />
        <PlanCard />
      </div>

      <div className="chat-feed" ref={feedRef}>
        {recent.map((m, i) => (
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

      <div className="input-bar">
        <MicButton />
        <input
          ref={inputRef}
          className="directive-input"
          placeholder={interim || 'Ask Jarvis anything — or hold the mic and speak…'}
          value={interim ? interim : draft}
          readOnly={Boolean(interim)}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendDirective(draft);
          }}
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
