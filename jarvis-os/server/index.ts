import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { PORT } from './config.js';
import { q, type EventRow, type EscalationRow } from './db.js';
import { setSink } from './bus.js';
import { jarvis } from './jarvis.js';
import { approvePlan, rejectPlan, pendingPlan } from './plans.js';
import { resolveEscalation, steerAgent, stopAgent, runningWorkerCount } from './workers.js';

function bootstrapState() {
  const agents = q.allAgents.all();
  const escalations = (q.pendingEscalations.all() as EscalationRow[]).map((e) => ({
    ...e,
    options: e.options ? JSON.parse(e.options) : null,
  }));
  const transcript = (q.recentEventsForAgent.all('jarvis', 80) as EventRow[])
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
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const json = (data: unknown, status = 200) => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(data));
  };

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

  json({ error: 'not found' }, 404);
});

const wss = new WebSocketServer({ server, path: '/ws' });

setSink((event) => {
  const data = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  }
});

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'hello', state: bootstrapState() }));

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
      }
    } catch (err) {
      socket.send(JSON.stringify({ type: 'error', message: String(err instanceof Error ? err.message : err) }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[jarvis-os] server on http://localhost:${PORT}`);
  jarvis.start();
});
