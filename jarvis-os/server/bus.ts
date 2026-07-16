/** Broadcast hub. index.ts registers the WS send function; everyone else just emits. */

export type ServerEvent = { type: string; [k: string]: unknown };

type Sink = (event: ServerEvent) => void;

let sink: Sink = () => {};

export function setSink(fn: Sink) {
  sink = fn;
}

export function broadcast(type: string, payload: Record<string, unknown> = {}) {
  sink({ type, ...payload });
}

export function activity(line: string) {
  broadcast('activity', { line, ts: Date.now() });
}
