export interface Agent {
  id: string;
  task_id: string | null;
  title: string;
  model: string;
  cwd: string;
  status: string;
  session_id: string | null;
  summary: string | null;
  created_at: number;
  completed_at: number | null;
}

export interface PlanTask {
  id: string;
  project_id: string;
  title: string;
  prompt: string;
  model: string;
  cwd: string | null;
  depends_on: string[];
  status: string;
  agent_id: string | null;
}

export interface Plan {
  project: { id: string; name: string; status: string; workspace_dir: string | null };
  tasks: PlanTask[];
}

export interface Escalation {
  id: string;
  agent_id: string;
  question: string;
  context: string | null;
  options: string[] | null;
  status: string;
  created_at: number;
}

export interface ChatMessage {
  role: 'adam' | 'jarvis';
  text: string;
  ts: number;
}

export interface AgentEvent {
  type: string;
  ts: number;
  [k: string]: unknown;
}

export interface ActivityLine {
  line: string;
  ts: number;
}

export interface Health {
  ok: boolean;
  uptime: number;
  jarvisState: string;
  workersRunning: number;
  dbOk: boolean;
  dbPending: number;
  diskFreeMB: number | null;
  diskLow: boolean;
  lowDiskThresholdMB: number;
  mode: string;
}

export type JarvisState = 'idle' | 'thinking' | 'error';
export type SphereMode = 'idle' | 'listening' | 'thinking' | 'speaking' | 'alert';
export type LayoutMode = 'focus' | 'work';
