import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './config.js';
import { log } from './logger.js';

fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'jarvis.db'));
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');

db.exec(`
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed',
  workspace_dir TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'sonnet',
  cwd TEXT,
  depends_on TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'proposed',
  agent_id TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  title TEXT NOT NULL,
  model TEXT NOT NULL,
  cwd TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'starting',
  session_id TEXT,
  summary TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_agent ON events(agent_id, id);
CREATE TABLE IF NOT EXISTS escalations (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  question TEXT NOT NULL,
  context TEXT,
  options TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  answer TEXT,
  created_at INTEGER NOT NULL,
  resolved_at INTEGER
);
`);

// --- typed rows ---
export interface AgentRow {
  id: string;
  task_id: string | null;
  title: string;
  model: string;
  cwd: string;
  status: string;
  session_id: string | null;
  summary: string | null;
  created_at: number;
  completed_at: number | null;
}
export interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  prompt: string;
  model: string;
  cwd: string | null;
  depends_on: string;
  status: string;
  agent_id: string | null;
  created_at: number;
}
export interface ProjectRow {
  id: string;
  name: string;
  status: string;
  workspace_dir: string | null;
  created_at: number;
}
export interface EscalationRow {
  id: string;
  agent_id: string;
  question: string;
  context: string | null;
  options: string | null;
  status: string;
  answer: string | null;
  created_at: number;
  resolved_at: number | null;
}
export interface EventRow {
  id: number;
  agent_id: string;
  type: string;
  payload: string;
  ts: number;
}

// --- statements ---
const stmts = {
  insertProject: db.prepare(
    `INSERT INTO projects (id, name, status, workspace_dir, created_at) VALUES (?, ?, ?, ?, ?)`
  ),
  updateProjectStatus: db.prepare(`UPDATE projects SET status = ? WHERE id = ?`),
  getProject: db.prepare(`SELECT * FROM projects WHERE id = ?`),
  latestPendingProject: db.prepare(
    `SELECT * FROM projects WHERE status = 'pending_approval' ORDER BY created_at DESC LIMIT 1`
  ),
  insertTask: db.prepare(
    `INSERT INTO tasks (id, project_id, title, prompt, model, cwd, depends_on, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ),
  tasksForProject: db.prepare(`SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at`),
  getTask: db.prepare(`SELECT * FROM tasks WHERE id = ?`),
  updateTask: db.prepare(`UPDATE tasks SET title = ?, prompt = ?, model = ?, cwd = ? WHERE id = ?`),
  updateTaskStatus: db.prepare(`UPDATE tasks SET status = ?, agent_id = COALESCE(?, agent_id) WHERE id = ?`),
  insertAgent: db.prepare(
    `INSERT INTO agents (id, task_id, title, model, cwd, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ),
  updateAgentStatus: db.prepare(
    `UPDATE agents SET status = ?, summary = COALESCE(?, summary), completed_at = COALESCE(?, completed_at) WHERE id = ?`
  ),
  setAgentSession: db.prepare(`UPDATE agents SET session_id = ? WHERE id = ?`),
  getAgent: db.prepare(`SELECT * FROM agents WHERE id = ?`),
  allAgents: db.prepare(`SELECT * FROM agents ORDER BY created_at DESC LIMIT 100`),
  insertEvent: db.prepare(`INSERT INTO events (agent_id, type, payload, ts) VALUES (?, ?, ?, ?)`),
  eventsForAgent: db.prepare(`SELECT * FROM events WHERE agent_id = ? ORDER BY id LIMIT 2000`),
  recentEventsForAgent: db.prepare(
    `SELECT * FROM (SELECT * FROM events WHERE agent_id = ? ORDER BY id DESC LIMIT ?) ORDER BY id`
  ),
  insertEscalation: db.prepare(
    `INSERT INTO escalations (id, agent_id, question, context, options, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ),
  resolveEscalation: db.prepare(
    `UPDATE escalations SET status = ?, answer = ?, resolved_at = ? WHERE id = ?`
  ),
  getEscalation: db.prepare(`SELECT * FROM escalations WHERE id = ?`),
  pendingEscalations: db.prepare(`SELECT * FROM escalations WHERE status = 'pending' ORDER BY created_at`),
  totalCost: db.prepare(
    `SELECT COALESCE(SUM(CAST(json_extract(payload, '$.cost') AS REAL)), 0) AS total
     FROM events WHERE type = 'result'`
  ),
};

export const q = stmts;

// --- crash-proof event writes ---
// Every SQLite failure (ENOSPC, SQLITE_BUSY, etc.) must degrade gracefully
// instead of throwing through the hot paths in workers/jarvis/tools. We buffer
// failed events in memory and retry-flush them on a timer.

interface QueuedEvent {
  agentId: string;
  type: string;
  payload: string;
  ts: number;
}

let dbHealthy = true;
let lastDbError: string | null = null;
const pending: QueuedEvent[] = [];
const MAX_PENDING = 5000; // cap memory: drop oldest beyond this
let flushTimer: NodeJS.Timeout | null = null;

function markDbState(ok: boolean, err?: unknown) {
  if (ok && !dbHealthy) {
    log.warn('db recovered — write path healthy again', { pendingDrained: pending.length });
  }
  if (!ok) {
    lastDbError = err instanceof Error ? err.message : String(err);
  }
  dbHealthy = ok;
}

function tryInsert(ev: QueuedEvent): boolean {
  try {
    stmts.insertEvent.run(ev.agentId, ev.type, ev.payload, ev.ts);
    return true;
  } catch (err) {
    markDbState(false, err);
    return false;
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    if (pending.length === 0) {
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
      return;
    }
    // Attempt to drain in order; stop on first failure and retry next tick.
    let drained = 0;
    while (pending.length > 0) {
      const ev = pending[0];
      if (tryInsert(ev)) {
        pending.shift();
        drained += 1;
      } else {
        break; // still unhealthy — wait for next tick
      }
    }
    if (drained > 0 && pending.length === 0) {
      markDbState(true);
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
    }
  }, 3000);
  // Do not keep the process alive solely for the flush timer.
  flushTimer.unref?.();
}

export function logEvent(agentId: string, type: string, payload: Record<string, unknown>) {
  let serialized: string;
  try {
    serialized = JSON.stringify(payload);
  } catch {
    serialized = JSON.stringify({ error: 'unserializable payload' });
  }
  const ev: QueuedEvent = { agentId, type, payload: serialized, ts: Date.now() };

  // Fast path: if we have a backlog, don't jump the queue — preserve order.
  if (pending.length === 0 && tryInsert(ev)) {
    if (!dbHealthy) markDbState(true);
    return;
  }

  // Degrade: buffer in memory and retry on a timer.
  pending.push(ev);
  if (pending.length > MAX_PENDING) {
    pending.splice(0, pending.length - MAX_PENDING);
  }
  if (dbHealthy) {
    // First failure — log it loudly (once) with the reason.
    log.error('db write failed — buffering events in memory and degrading', lastDbError ?? 'unknown', {
      pending: pending.length,
    });
  }
  scheduleFlush();
}

/**
 * Run a DB write that must never throw through a hot path. On failure it logs,
 * flips db health, and returns undefined instead of propagating. Use for
 * non-event writes (status/task/agent mutations) that would otherwise crash the
 * process on ENOSPC/SQLITE_BUSY. Reads should stay direct so callers still see
 * real errors where they can handle them.
 */
export function safeRun<T>(label: string, fn: () => T): T | undefined {
  try {
    const out = fn();
    if (!dbHealthy) markDbState(true);
    return out;
  } catch (err) {
    if (dbHealthy) log.error(`db write failed (${label}) — degrading`, err);
    markDbState(false, err);
    return undefined;
  }
}

/** Health snapshot for /api/health. Runs a trivial read to confirm the DB responds. */
export function dbStatus(): { ok: boolean; pending: number; lastError: string | null } {
  let ok = dbHealthy;
  try {
    db.prepare('SELECT 1').get();
  } catch (err) {
    ok = false;
    lastDbError = err instanceof Error ? err.message : String(err);
  }
  return { ok: ok && pending.length < MAX_PENDING, pending: pending.length, lastError: ok ? null : lastDbError };
}

/** Free space (MB) on the data-dir filesystem. Returns null if unavailable. */
export function diskFreeMB(): number | null {
  try {
    // statfsSync available on Node 18.15+/20+. bavail * bsize = free bytes for non-root.
    const st = (fs as unknown as { statfsSync?: (p: string) => { bsize: number; bavail: number } }).statfsSync?.(
      DATA_DIR
    );
    if (!st) return null;
    return Math.round((st.bsize * st.bavail) / (1024 * 1024));
  } catch {
    return null;
  }
}
