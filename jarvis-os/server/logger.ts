/**
 * Zero-dependency JSON-lines logger with size-based rotation.
 * - Writes structured JSON lines to logs/server.log.
 * - Rotates at ~5MB, keeps 2 rotated files (server.log.1, server.log.2).
 * - In dev (NODE_ENV !== 'production') also prints pretty coloured lines to the console.
 * Never throws: a logging failure must never take down a hot path.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './config.js';

const LOG_DIR = path.join(ROOT, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'server.log');
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const KEEP = 2;

const IS_PROD = process.env.NODE_ENV === 'production';

type Level = 'debug' | 'info' | 'warn' | 'error';

let stream: fs.WriteStream | null = null;
let bytesWritten = 0;

function ensureDir() {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch {
    /* ignore — falls back to console only */
  }
}

function openStream() {
  ensureDir();
  try {
    let size = 0;
    try {
      size = fs.statSync(LOG_FILE).size;
    } catch {
      size = 0;
    }
    bytesWritten = size;
    stream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
    stream.on('error', () => {
      // Disk full / permission — drop the file sink, keep console.
      stream = null;
    });
  } catch {
    stream = null;
  }
}

function rotate() {
  try {
    stream?.end();
  } catch {
    /* ignore */
  }
  stream = null;
  try {
    // shift server.log.1 -> .2, drop the oldest
    for (let i = KEEP; i >= 1; i--) {
      const src = i === 1 ? LOG_FILE : `${LOG_FILE}.${i - 1}`;
      const dst = `${LOG_FILE}.${i}`;
      if (fs.existsSync(src)) {
        try {
          fs.renameSync(src, dst);
        } catch {
          /* ignore individual rotation failures */
        }
      }
    }
  } catch {
    /* ignore */
  }
  openStream();
}

openStream();

const COLORS: Record<Level, string> = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';

function write(level: Level, msg: string, fields?: Record<string, unknown>) {
  const ts = Date.now();
  const record = { ts, level, msg, ...(fields ?? {}) };

  // File sink (JSON lines) — best effort.
  try {
    if (!stream) openStream();
    if (stream) {
      const line = JSON.stringify(record) + '\n';
      const bytes = Buffer.byteLength(line);
      if (bytesWritten + bytes > MAX_BYTES) rotate();
      if (stream) {
        stream.write(line);
        bytesWritten += bytes;
      }
    }
  } catch {
    /* never throw from logging */
  }

  // Console sink.
  try {
    const time = new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    if (IS_PROD) {
      // Structured, one line per record for supervisor capture.
      // eslint-disable-next-line no-console
      (level === 'error' ? console.error : console.log)(JSON.stringify(record));
    } else {
      const extra = fields && Object.keys(fields).length ? ' ' + JSON.stringify(fields) : '';
      const c = COLORS[level] ?? '';
      // eslint-disable-next-line no-console
      (level === 'error' ? console.error : console.log)(
        `${c}${time} ${level.toUpperCase().padEnd(5)}${RESET} ${msg}${extra}`
      );
    }
  } catch {
    /* ignore */
  }
}

function errFields(err: unknown, extra?: Record<string, unknown>): Record<string, unknown> {
  if (err instanceof Error) {
    return { err: err.message, stack: err.stack, ...(extra ?? {}) };
  }
  return { err: String(err), ...(extra ?? {}) };
}

export const log = {
  debug: (msg: string, fields?: Record<string, unknown>) => write('debug', msg, fields),
  info: (msg: string, fields?: Record<string, unknown>) => write('info', msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) => write('warn', msg, fields),
  error: (msg: string, err?: unknown, extra?: Record<string, unknown>) =>
    write('error', msg, err === undefined ? extra : errFields(err, extra)),
};

export const LOG_PATHS = { LOG_DIR, LOG_FILE };
