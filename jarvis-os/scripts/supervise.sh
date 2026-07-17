#!/usr/bin/env bash
#
# supervise.sh — keep the Jarvis OS server alive.
#
# Restarts the server whenever it exits. Logs every exit code with a timestamp.
# Guards against restart storms: if the server dies 10 times within 60s it backs
# off for 30s before trying again (prevents a tight crash loop from pinning the CPU).
#
# Usage:
#   bash scripts/supervise.sh          # run in foreground
#   npm run up                          # detached-friendly wrapper (logs + PID)
#
set -u

# Resolve repo root regardless of where this is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT" || exit 1

LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"
SUP_LOG="$LOG_DIR/supervisor.log"

log() {
  # Append to the supervisor log; mirror to stderr for foreground runs.
  # (up.sh redirects our stdout to the same file, so we must not also echo to
  # stdout or every line would be duplicated.)
  local line
  line="$(date '+%Y-%m-%dT%H:%M:%S') [supervisor] $*"
  echo "$line" >>"$SUP_LOG"
  echo "$line" >&2
}

# Restart-storm tracking.
WINDOW=60          # seconds
STORM_LIMIT=10     # restarts within WINDOW triggers backoff
BACKOFF=30         # seconds to sleep after a storm
declare -a STAMPS=()

log "starting Jarvis OS supervisor (root: $ROOT)"

# Build once if the production bundle is missing.
if [ ! -f "$ROOT/dist/index.html" ]; then
  log "dist/ missing — building production bundle"
  npm run build >>"$SUP_LOG" 2>&1 || log "build failed (continuing; server will warn)"
fi

while true; do
  log "launching server (NODE_ENV=production)"
  NODE_ENV=production node_modules/.bin/tsx server/index.ts
  CODE=$?
  log "server exited with code $CODE"

  # Record this restart and prune stamps outside the window.
  NOW=$(date +%s)
  STAMPS+=("$NOW")
  PRUNED=()
  for t in "${STAMPS[@]}"; do
    if [ $((NOW - t)) -lt "$WINDOW" ]; then
      PRUNED+=("$t")
    fi
  done
  STAMPS=("${PRUNED[@]}")

  if [ "${#STAMPS[@]}" -ge "$STORM_LIMIT" ]; then
    log "restart storm detected (${#STAMPS[@]} restarts in ${WINDOW}s) — backing off ${BACKOFF}s"
    sleep "$BACKOFF"
    STAMPS=()
  else
    sleep 2
  fi
done
