import crypto from 'node:crypto';

/** Push-based async queue usable as the SDK's streaming prompt input. */
export class AsyncQueue<T> implements AsyncIterable<T> {
  private items: T[] = [];
  private resolvers: ((r: IteratorResult<T>) => void)[] = [];
  private closed = false;

  push(item: T) {
    if (this.closed) return;
    const resolve = this.resolvers.shift();
    if (resolve) resolve({ value: item, done: false });
    else this.items.push(item);
  }

  close() {
    this.closed = true;
    for (const resolve of this.resolvers.splice(0)) {
      resolve({ value: undefined as never, done: true });
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: (): Promise<IteratorResult<T>> => {
        if (this.items.length > 0) {
          return Promise.resolve({ value: this.items.shift()!, done: false });
        }
        if (this.closed) {
          return Promise.resolve({ value: undefined as never, done: true });
        }
        return new Promise((resolve) => this.resolvers.push(resolve));
      },
    };
  }
}

export function shortId(prefix: string): string {
  return `${prefix}-${crypto.randomBytes(3).toString('hex')}`;
}

export function now(): number {
  return Date.now();
}

export function trim(text: string, max = 800): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + ` … [${text.length - max} more chars]`;
}

/** One-line human summary of a tool call for activity feeds. */
export function summarizeToolCall(name: string, input: Record<string, unknown>): string {
  const p = (k: string) => (typeof input[k] === 'string' ? (input[k] as string) : '');
  switch (name) {
    case 'Bash':
      return `$ ${trim(p('command'), 120)}`;
    case 'Read':
      return `read ${p('file_path')}`;
    case 'Write':
      return `write ${p('file_path')}`;
    case 'Edit':
      return `edit ${p('file_path')}`;
    case 'Glob':
      return `glob ${p('pattern')}`;
    case 'Grep':
      return `grep ${trim(p('pattern'), 60)}`;
    case 'WebSearch':
      return `search: ${trim(p('query'), 80)}`;
    case 'WebFetch':
      return `fetch ${trim(p('url'), 80)}`;
    case 'TodoWrite':
      return `updated todo list`;
    case 'Task':
      return `subagent: ${trim(p('description'), 80)}`;
    default: {
      const json = JSON.stringify(input ?? {});
      return `${name} ${trim(json, 100)}`;
    }
  }
}
