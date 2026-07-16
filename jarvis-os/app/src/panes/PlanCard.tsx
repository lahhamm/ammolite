import { useState } from 'react';
import { useApp } from '../store';
import { api } from '../ws';

export function PlanCard() {
  const plan = useApp((s) => s.plan);
  const summary = useApp((s) => s.planSummary);
  const [edits, setEdits] = useState<Record<string, { model?: string; cwd?: string }>>({});
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!plan) return null;

  const edit = (taskId: string, patch: { model?: string; cwd?: string }) =>
    setEdits((e) => ({ ...e, [taskId]: { ...e[taskId], ...patch } }));

  return (
    <div className="plan-card">
      <div className="plan-head">
        <div>
          <div className="pane-label accent">Plan · awaiting your approval</div>
          <div className="plan-name">{plan.project.name}</div>
          {summary && <div className="plan-summary">{summary}</div>}
        </div>
      </div>

      <div className="plan-tasks">
        {plan.tasks.map((t) => (
          <div key={t.id} className="plan-task">
            <div className="plan-task-row">
              <span className="plan-task-id">{t.id.split('.').pop()}</span>
              <span className="plan-task-title" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                {t.title}
              </span>
              <select
                className="model-select"
                value={edits[t.id]?.model ?? t.model}
                onChange={(e) => edit(t.id, { model: e.target.value })}
              >
                <option value="sonnet">Sonnet</option>
                <option value="opus">Opus</option>
                <option value="fable">Fable</option>
              </select>
            </div>
            <div className="plan-task-meta">
              <input
                className="cwd-input"
                value={edits[t.id]?.cwd ?? t.cwd ?? ''}
                onChange={(e) => edit(t.id, { cwd: e.target.value })}
                spellCheck={false}
              />
              {t.depends_on.length > 0 && (
                <span className="dep-chips">
                  needs {t.depends_on.map((d) => d.split('.').pop()).join(', ')}
                </span>
              )}
            </div>
            {expanded === t.id && <pre className="plan-task-prompt">{t.prompt}</pre>}
          </div>
        ))}
      </div>

      {!rejecting ? (
        <div className="plan-actions">
          <button className="btn primary" onClick={() => api.approvePlan(plan.project.id, edits)}>
            Approve &amp; run
          </button>
          <button className="btn ghost" onClick={() => setRejecting(true)}>
            Reject
          </button>
        </div>
      ) : (
        <div className="plan-actions">
          <input
            className="reject-input"
            autoFocus
            placeholder="Why? Jarvis will revise…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                api.rejectPlan(plan.project.id, reason);
                setRejecting(false);
              }
              if (e.key === 'Escape') setRejecting(false);
            }}
          />
          <button
            className="btn danger"
            onClick={() => {
              api.rejectPlan(plan.project.id, reason);
              setRejecting(false);
            }}
          >
            Confirm reject
          </button>
        </div>
      )}
    </div>
  );
}
