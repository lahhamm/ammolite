/** Tiny channel so voice.ts can pulse the sphere without importing the Three.js component. */

type Listener = () => void;
const listeners = new Set<Listener>();

export function onPulse(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function pulse() {
  for (const fn of listeners) fn();
}
