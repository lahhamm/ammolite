import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, '..');
export const DATA_DIR = path.join(ROOT, 'data');
export const WORKSPACE_ROOT = path.join(ROOT, 'workspace');
export const PROJECTS_ROOT = path.resolve(ROOT, '..');

export const VAULT_PATH = '/Users/adamlahham/Downloads/Obsidian/Notebook';

export const PORT = 4780;
export const MAX_CONCURRENT_WORKERS = 3;
export const WORKER_MAX_TURNS = 200;

export const MODELS = {
  jarvis: 'claude-fable-5',
  fable: 'claude-fable-5',
  opus: 'claude-opus-4-8',
  sonnet: 'claude-sonnet-5',
} as const;

export type ModelTier = 'sonnet' | 'opus' | 'fable';

export function resolveModel(tier: string): string {
  const t = tier.toLowerCase().trim() as ModelTier;
  return MODELS[t] ?? MODELS.sonnet;
}
