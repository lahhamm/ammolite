import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';
import { PORT, ROOT } from './config.js';
import { q, dbStatus, diskFreeMB, type EventRow, type EscalationRow } from './db.js';
import { setSink } from './bus.js';
import { jarvis } from './jarvis.js';
import { approvePlan, rejectPlan, pendingPlan } from './plans.js';
import { resolveEscalation, steerAgent, stopAgent, runningWorkerCount } from './workers.js';
import { log } from './logger.js';

const IS_PROD = process.env.NODE_ENV === 'production';
const DIST_DIR = path.join(ROOT, 'dist');
const BOOT_TS = Date.now();
const LOW_DISK_MB = 2048; // warn threshold (2GB)

// --- static file serving (production) ---
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): boolean {
  if (!IS_PROD) return false;
  // Resolve within DIST_DIR only (no path traversal).
  const rel = decodeURIComponent(pathname.replace(/^\/+/, ''));
  const candidate = path.resolve(DIST_DIR, rel);
  if (!candidate.startsWith(DIST_DIR)) {
    res.writeHead(403).end('forbidden');
    return true;
  }
  let filePath = candidate;
  try {
    const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    if (!stat || stat.isDirectory()) {
      // SPA fallback: any non-file, non-API route serves index.html.
      filePath = path.join(DIST_DIR, 'index.html');
      if (!fs.existsSync(filePath)) {
        res.writeHead(404).end('build missing — run npm run build');
        return true;
      }
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] ?? 'application/octet-stream';
    // Hashed asset files are immutable; index.html must not be cached.
    const isAsset = filePath.includes(`${path.sep}assets${path.sep}`);
    res.writeHead(200, {
      'content-type': type,
      'cache-control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch (err) {
    log.error('static serve failed', err, { pathname });
    res.writeHead(500).end('internal error');
    return true;
  }
}

function bootstrapState() {
  const agents = q.allAgents.all();
  const escalations = (q.pendingEscalations.all() as EscalationRow[]).map((e) => ({
    ...e,
    options: e.options ? JSON.parse(e.options) : null,
  }));
  const transcript = (q.recentEventsForAgent.all('jarvis', 200) as EventRow[])
    .map((e) => ({ type: e.type, payload: JSON.parse(e.payload) as { text?: string }, ts: e.ts }))
    .filter((e) => e.type === 'adam' || e.type === 'jarvis')
    .map((e) => ({ role: e.type, text: e.payload.text ?? '', ts: e.ts }));
  return {
    agents,
    escalations,
    plan: pendingPlan(),
    transcript,
    running: runningWorkerCount(),
    jarvisState: jarvis.state,
    sessionCost: sessionCost(),
  };
}

/** Sum of result-event costs across all agents — the running session spend. */
function sessionCost(): number {
  try {
    const row = q.totalCost.get() as { total: number | null } | undefined;
    return row?.total ?? 0;
  } catch {
    return 0;
  }
}

function healthPayload() {
  const disk = diskFreeMB();
  const db = dbStatus();
  return {
    ok: db.ok,
    uptime: Math.round((Date.now() - BOOT_TS) / 1000),
    jarvisState: jarvis.state,
    workersRunning: runningWorkerCount(),
    dbOk: db.ok,
    dbPending: db.pending,
    diskFreeMB: disk,
    diskLow: disk !== null && disk < LOW_DISK_MB,
    lowDiskThresholdMB: LOW_DISK_MB,
    mode: IS_PROD ? 'production' : 'development',
  };
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const json = (data: unknown, status = 200) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    if (url.pathname === '/api/health') return json(healthPayload());
    if (url.pathname === '/api/state') return json(bootstrapState());

    const eventsMatch = url.pathname.match(/^\/api\/agents\/([^/]+)\/events$/);
    if (eventsMatch) {
      const rows = (q.eventsForAgent.all(eventsMatch[1]) as EventRow[]).map((e) => ({
        type: e.type,
        ...(JSON.parse(e.payload) as Record<string, unknown>),
        ts: e.ts,
      }));
      return json(rows);
    }

    if (url.pathname.startsWith('/api/')) return json({ error: 'not found' }, 404);

    // Non-API: serve the built SPA in production.
    if (serveStatic(req, res, url.pathname)) return;

    json({ error: 'not found' }, 404);
  } catch (err) {
    log.error('request handler error', err, { url: req.url });
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'internal error' }));
  }
});

const wss = new WebSocketServer({ server, path: '/ws' });

setSink((event) => {
  const data = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch (err) {
        log.warn('ws send failed', { err: String(err) });
      }
    }
  }
});

// --- WS heartbeat: drop dead sockets so they don't leak ---
const ALIVE = new WeakMap<WebSocket, boolean>();

wss.on('connection', (socket, req) => {
  ALIVE.set(socket, true);
  socket.on('pong', () => ALIVE.set(socket, true));
  log.info('ws client connected', { peers: wss.clients.size, ip: req.socket.remoteAddress });

  try {
    socket.send(JSON.stringify({ type: 'hello', state: bootstrapState() }));
  } catch (err) {
    log.warn('ws hello failed', { err: String(err) });
  }

  socket.on('close', () => log.info('ws client disconnected', { peers: wss.clients.size - 1 }));
  socket.on('error', (err) => log.warn('ws socket error', { err: String(err) }));

  socket.on('message', (raw) => {
    let msg: { type: string; [k: string]: unknown };
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    try {
      switch (msg.type) {
        case 'directive':
          if (typeof msg.text === 'string' && msg.text.trim()) jarvis.sendUser(msg.text.trim());
          break;
        case 'plan.approve':
          approvePlan(String(msg.projectId), (msg.edits as Record<string, never>) ?? {});
          break;
        case 'plan.reject':
          rejectPlan(String(msg.projectId), String(msg.reason ?? ''));
          break;
        case 'escalation.answer':
          resolveEscalation(String(msg.id), String(msg.answer ?? ''), Boolean(msg.approved));
          break;
        case 'agent.steer':
          steerAgent(String(msg.id), String(msg.text ?? ''), 'adam');
          break;
        case 'agent.stop':
          stopAgent(String(msg.id));
          break;
        case 'jarvis.interrupt':
          void jarvis.interrupt();
          break;
        case 'jarvis.reset':
          void jarvis.reset();
          break;
        case 'ping':
          try {
            socket.send(JSON.stringify({ type: 'pong' }));
          } catch {
            /* ignore */
          }
          break;
      }
    } catch (err) {
      log.error('ws message handler error', err, { msgType: msg.type });
      try {
        socket.send(
          JSON.stringify({ type: 'error', message: String(err instanceof Error ? err.message : err) })
        );
      } catch {
        /* ignore */
      }
    }
  });
});

const heartbeat = setInterval(() => {
  for (const client of wss.clients) {
    if (ALIVE.get(client) === false) {
      log.warn('terminating dead ws socket');
      client.terminate();
      continue;
    }
    ALIVE.set(client, false);
    try {
      client.ping();
    } catch {
      /* ignore */
    }
  }
}, 30_000);
heartbeat.unref?.();

// --- process-level crash guards: log, keep alive unless fatal ---
function isFatal(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === 'EADDRINUSE' || code === 'EACCES';
}

process.on('uncaughtException', (err) => {
  log.error('uncaughtException', err);
  if (isFatal(err)) {
    log.error('fatal error — exiting for supervisor to handle', err);
    process.exit(1);
  }
  // otherwise: stay alive; the session/worker layer recovers on its own.
});

process.on('unhandledRejection', (reason) => {
  log.error('unhandledRejection', reason);
  // Keep the process alive — a rejected promise should not kill mission control.
});

server.on('error', (err) => {
  log.error('http server error', err);
  if (isFatal(err)) process.exit(1);
});

function shutdown(signal: string) {
  log.info('shutdown signal received', { signal });
  clearInterval(heartbeat);
  try {
    for (const c of wss.clients) c.terminate();
    server.close();
  } catch {
    /* ignore */
  }
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server.listen(PORT, () => {
  const disk = diskFreeMB();
  log.info('jarvis-os server booted', {
    port: PORT,
    mode: IS_PROD ? 'production' : 'development',
    diskFreeMB: disk,
    dist: IS_PROD ? DIST_DIR : undefined,
  });
  // eslint-disable-next-line no-console
  console.log(`[jarvis-os] server on http://localhost:${PORT} (${IS_PROD ? 'production' : 'development'})`);
  if (IS_PROD && !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    log.warn('production mode but dist/index.html is missing — run npm run build first');
  }
  if (disk !== null && disk < LOW_DISK_MB) {
    log.warn('low disk space at boot', { diskFreeMB: disk, thresholdMB: LOW_DISK_MB });
  }
  jarvis.start();
});
