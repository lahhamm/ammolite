/** Late-bound handle to Jarvis so workers/tools can notify him without circular imports. */

type Notify = (text: string) => void;

let notifyFn: Notify = () => {};

export function registerJarvisNotify(fn: Notify) {
  notifyFn = fn;
}

/** Send a system note into Jarvis's conversation (agent completions, approvals, escalation answers). */
export function notifyJarvis(text: string) {
  notifyFn(`[SYSTEM NOTE] ${text}`);
}
