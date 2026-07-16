# Jarvis OS — Local Agentic Visual OS

**Date:** 2026-07-16 · **Status:** Approved (architecture approved explicitly; remaining sections approved via "just build")

## What it is

A local, browser-based mission control for AI agents. A Three.js particle sphere — Jarvis — sits center screen; Adam talks or types to it. Jarvis (Fable 5) orchestrates: small asks are handled directly or via one worker; big multi-software projects are decomposed into a plan card (tasks, dependencies, per-task model, per-task working directory) that Adam approves once. Then autopilot: workers (Claude Code sessions via the Agent SDK) execute, Jarvis supervises, and only irreversible actions or hard blockers surface to Adam.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Core concept | Mission control for agents (not a showpiece) |
| Workloads | Huge multi-software projects, coding/site builds, personal automation, general spawner |
| Engine | Claude Agent SDK sessions (inherit Claude Code login, MCPs, skills) |
| UI metaphor | Command Center (3-pane) + central Jarvis particle sphere, Iron-Man HUD feel |
| Jarvis model | claude-fable-5 (long-lived orchestrator session) |
| Worker models | Sonnet (claude-sonnet-5) default, Opus (claude-opus-4-8) for hard tasks, Fable only when necessary |
| Voice | Full loop, free stack: Web Speech API STT + speechSynthesis TTS, behind a VoiceIO abstraction (premium voice can slot in later) |
| Platform | Browser app on localhost (Node server + Chrome tab) |
| Autonomy | Plan gate, then autopilot; escalations triaged by Jarvis first |

## Architecture

```
jarvis-os/
├── server/            Node 20+, TypeScript (tsx)
│   ├── index.ts       HTTP + WebSocket server (port 4780)
│   ├── jarvis.ts      Jarvis session: Agent SDK query() with streaming input,
│   │                  model claude-fable-5, orchestration system prompt
│   ├── workers.ts     Worker pool: one SDK session per task, per-task model/cwd,
│   │                  concurrency cap (3), canUseTool guardrails
│   ├── tools.ts       In-process MCP server exposing Jarvis's tools
│   ├── db.ts          better-sqlite3: projects, tasks, agents, events, escalations
│   └── config.ts      ports, caps, model ids, workspace root
└── app/               Vite + React + TS
    ├── Sphere.tsx     Three.js particle sphere (idle/listening/thinking/speaking/alert)
    ├── panes/         Roster (left), JarvisStage (center), NeedsYou+Activity (right),
    │                  AgentOverlay (transcript window), PlanCard
    └── voice.ts       VoiceIO abstraction over webkitSpeechRecognition + speechSynthesis
```

## Data flow

1. Directive (voice→text or typed) → WS → pushed into Jarvis's streaming input.
2. Jarvis streams text back (rendered under sphere + spoken via TTS). Tool calls run through his MCP toolset.
3. `propose_plan` stores a plan (status `pending_approval`) and renders a plan card. Adam can edit models/tasks inline, then approves → approval message is pushed back into Jarvis's input → Jarvis calls `spawn_agent` for dependency-free tasks.
4. Worker events stream to SQLite + WS (roster status, transcript overlay). On worker completion, a system note is pushed into Jarvis's input so he schedules dependents, steers, or reports.
5. Worker `canUseTool` callback auto-approves routine actions; dangerous patterns (deploy, destructive rm, git push, payments, sudo) create an escalation → Jarvis triages → unresolvable ones land in Needs You (and are spoken aloud).

## Jarvis toolset

`propose_plan`, `spawn_agent`, `list_agents`, `agent_status`, `steer_agent`, `stop_agent`, `ask_adam`. Jarvis also has Read/Glob/Grep and light Bash for inspection — heavy execution always goes to workers.

## DB schema (SQLite)

- `projects(id, name, status, workspace_dir, created_at)`
- `tasks(id, project_id, title, prompt, model, cwd, depends_on, status, agent_id, created_at)`
- `agents(id, task_id, title, model, cwd, status, session_id, summary, created_at, completed_at)`
- `events(id, agent_id, seq, type, payload, ts)` — Jarvis logs under agent id `jarvis`
- `escalations(id, agent_id, question, options, status, answer, created_at)`

## WS protocol

Server→client: `hello`(full state), `jarvis.delta`, `jarvis.message`, `jarvis.status`, `plan.proposed`, `agents.update`, `agent.event`, `escalation.new`, `escalation.resolved`, `activity`.
Client→server: `directive`, `plan.approve`, `plan.reject`, `escalation.answer`, `agent.steer`, `agent.stop`.

## Sphere states

idle (dim blue, slow drift) · listening (cyan, contracted, bright) · thinking (indigo swirl while Jarvis streams/calls tools) · speaking (pulses on TTS word boundaries) · alert (amber breathing while Needs You is non-empty).

## Error handling

- Server restart: sessions die but SQLite persists; UI replays transcripts; Jarvis restarts fresh with a state summary injected.
- Worker failure: status `failed` + summary pushed to Jarvis; he retries, reassigns (possibly up a model tier), or escalates.
- Speech recognition unavailable (non-Chrome): mic button disabled with hint; typing always works.
- WS drop: client auto-reconnects with backoff; `hello` resyncs state.

## Out of scope (v1)

Wake word ("Hey Jarvis"), premium TTS voice, Electron wrap, multi-machine access, cost dashboards.

## Verification plan

Boot via preview tools → typed directive gets a Jarvis reply → tiny 1-worker plan proposes, approves, executes in a sandbox dir → transcript streams live → screenshot proof. Voice loop verified by code-path (mic requires a human gesture + OS permission).
