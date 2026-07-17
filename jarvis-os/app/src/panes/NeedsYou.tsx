import { memo, useState } from 'react';
import { useApp } from '../store';
import { api } from '../ws';
import type { Escalation } from '../types';

function EscalationCard({ escalation }: { escalation: Escalation }) {
  const [answer, setAnswer] = useState('');
  const [showContext, setShowContext] = useState(false);

  const respond = (text: string, approved: boolean) => api.answerEscalation(escalation.id, text, approved);

  const when = new Date(escalation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="escalation-card">
      <div className="escalation-from">
        <span>{escalation.agent_id === 'jarvis' ? 'JARVIS asks' : `agent ${escalation.agent_id}`}</span>
        <span className="escalation-time">{when}</span>
      </div>
      <div className="escalation-q">{escalation.question}</div>
      {escalation.context && (
        <>
          <button className="link-btn" onClick={() => setShowContext(!showContext)}>
            {showContext ? 'hide details' : 'details'}
          </button>
          {showContext && <pre className="escalation-ctx">{escalation.context}</pre>}
        </>
      )}
      <div className="escalation-actions">
        {(escalation.options ?? []).map((opt) => (
          <button
            key={opt}
            className={`btn small ${opt.toLowerCase() === 'deny' ? 'danger' : 'primary'}`}
            onClick={() => respond(opt, opt.toLowerCase() !== 'deny')}
          >
            {opt}
          </button>
        ))}
      </div>
      <input
        className="escalation-input"
        placeholder="…or answer in words"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && answer.trim()) respond(answer.trim(), true);
        }}
      />
    </div>
  );
}

const Escalations = memo(function Escalations() {
  const escalations = useApp((s) => s.escalations);
  return (
    <>
      <div className="pane-label amber">Needs you {escalations.length > 0 && `· ${escalations.length}`}</div>
      {escalations.length === 0 && <div className="empty-hint small">Nothing needs you. Autopilot.</div>}
      {escalations.map((e) => (
        <EscalationCard key={e.id} escalation={e} />
      ))}
    </>
  );
});

const ActivityFeed = memo(function ActivityFeed() {
  const activity = useApp((s) => s.activity);
  return (
    <>
      <div className="pane-label dim spaced">Activity</div>
      <div className="activity-feed">
        {activity.map((a, i) => (
          <div key={`${a.ts}-${i}`} className="activity-line">
            <span className="activity-time">
              {new Date(a.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {a.line}
          </div>
        ))}
      </div>
    </>
  );
});

export function NeedsYou() {
  return (
    <aside className="pane needs-you">
      <Escalations />
      <ActivityFeed />
    </aside>
  );
}
