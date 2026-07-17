# Jarvis OS

Local agentic mission control — a long-lived Claude Agent SDK orchestrator (JARVIS, `claude-fable-5`) that plans work, spawns worker agents, and reports to you through a dark-HUD cockpit. Single Node process, SQLite for state, React + Three.js frontend.

- **Server**: `server/` (Node + TS via `tsx`) — HTTP + WebSocket on port **4780**.
- **App**: `app/` (Vite + React + TS) — dev server on **5273** (proxies `/api` and `/ws` to 4780). In production it's built to `dist/` and served by the Node process itself.

---

## Running it

### Development

```bash
npm run dev
```

Runs the server (tsx) and the Vite dev server together. Open **http://localhost:5273**. Hot-reload for the UI; the server restarts on file changes via tsx.

### Production (one process, survives its parent)

Production mode builds the UI once and serves it from the **same** Node process on port 4780 — nothing depends on Vite or an IDE preview being open.

```bash
npm run start:fresh   # build the UI, then start in production mode
# or, if dist/ is already built:
npm start             # NODE_ENV=production tsx server/index.ts
```

Open **http://localhost:4780**. `npm start` will warn (but still boot) if `dist/` is missing.

### Supervised (recommended for real work)

`npm run up` launches a **supervisor** (`scripts/supervise.sh`) that restarts the server whenever it exits, detached from your shell, logging to files:

```bash
npm run up
# → prints the supervisor PID (saved to logs/jarvisos.pid) and the URLs

# stop it:
kill "$(cat logs/jarvisos.pid)"
# if a server child lingers:
pkill -f 'tsx server/index.ts'
```

The supervisor:
- Rebuilds `dist/` if it's missing.
- Restarts the server after any exit (2s pause), logging each exit code to `logs/supervisor.log`.
- Detects **restart storms** — 10 restarts within 60s triggers a 30s back-off so a crash loop can't pin the CPU.

### Always-on with launchd (optional)

A ready-to-use LaunchAgent plist lives at `scripts/com.adam.jarvisos.plist`. It runs the supervisor at login and relaunches it if it ever dies (belt-and-suspenders on top of the supervisor's own loop).

```bash
# 1. Confirm the node path baked into the plist matches yours:
which node        # if not under /opt/homebrew/bin or /usr/local/bin, edit PATH in the plist

# 2. Install & load:
cp "scripts/com.adam.jarvisos.plist" ~/Library/LaunchAgents/
launchctl load  ~/Library/LaunchAgents/com.adam.jarvisos.plist   # starts it now + at every login

# status / logs:
launchctl list | grep jarvisos
tail -f logs/launchd.err.log logs/server.log

# stop & uninstall:
launchctl unload ~/Library/LaunchAgents/com.adam.jarvisos.plist
rm ~/Library/LaunchAgents/com.adam.jarvisos.plist
```

---

## Health, logs, and monitoring

- **Health**: `curl -s http://localhost:4780/api/health | jq` returns
  `{ ok, uptime, jarvisState, workersRunning, dbOk, dbPending, diskFreeMB, diskLow, mode }`.
  The UI polls this and shows an amber disk-warning chip in the topbar when free space drops below 2GB.
- **State**: `curl -s http://localhost:4780/api/state` — full bootstrap snapshot (agents, escalations, plan, transcript, running workers, session cost).
- **Logs** (`logs/`, git-ignored):
  - `server.log` — structured JSON-lines from the server (boot, WS connects, session lifecycle, worker spawn/finish/fail, escalations, errors with stack). Rotates at ~5MB, keeps 2 files.
  - `supervisor.log` — supervisor restart history and exit codes.
  - `launchd.out.log` / `launchd.err.log` — only when running under launchd.

### Resilience built in

- Every SQLite write on a hot path is wrapped so an `ENOSPC` / `SQLITE_BUSY` failure **degrades** (buffers events in memory, retry-flushes on a timer) instead of throwing through the process. `PRAGMA busy_timeout=5000`.
- `uncaughtException` / `unhandledRejection` are logged with stacks and **kept alive** unless the error is fatal (port in use / permission), in which case the process exits for the supervisor to relaunch.
- WebSocket heartbeat pings every 30s and terminates dead sockets.
- On boot the server reaps agents left `running` in the DB by a previous (dead) process.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev: server + Vite with hot reload (ports 4780 + 5273). |
| `npm run build` | Build the UI to `dist/`. |
| `npm start` | Production: serve the built UI from the Node process (port 4780). |
| `npm run start:fresh` | Build, then `npm start`. |
| `npm run up` | Supervised + detached; writes `logs/jarvisos.pid`. |
| `npm run typecheck` | `tsc --noEmit`. |
