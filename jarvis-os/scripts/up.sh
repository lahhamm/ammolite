#!/usr/bin/env bash
#
# up.sh — start the supervised Jarvis OS server detached, log to file, echo PID.
#
# The supervisor (which owns the restart loop) is launched with nohup so it
# survives this shell closing. Its PID is written to logs/jarvisos.pid so you
# can stop the whole thing later with:  kill "$(cat logs/jarvisos.pid)"
#
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT" || exit 1

LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"
PID_FILE="$LOG_DIR/jarvisos.pid"

# Refuse to double-start.
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE" 2>/dev/null)" 2>/dev/null; then
  echo "Jarvis OS already running (supervisor PID $(cat "$PID_FILE")). Stop it with: kill \$(cat $PID_FILE)"
  exit 0
fi

# supervise.sh writes its own structured lines to supervisor.log; send the raw
# nohup stream (server stdout/stderr passthrough) to a separate file so
# supervisor.log stays clean and un-duplicated.
nohup bash "$SCRIPT_DIR/supervise.sh" >>"$LOG_DIR/supervisor.nohup.log" 2>&1 &
SUP_PID=$!
echo "$SUP_PID" >"$PID_FILE"

echo "Jarvis OS supervised and detached."
echo "  supervisor PID : $SUP_PID  (saved to $PID_FILE)"
echo "  server         : http://localhost:4780"
echo "  logs           : $LOG_DIR/server.log  and  $LOG_DIR/supervisor.log"
echo "  stop           : kill \$(cat $PID_FILE)   # then pkill -f 'tsx server/index.ts' if needed"
