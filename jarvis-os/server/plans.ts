import { q, type ProjectRow, type TaskRow } from './db.js';
import { broadcast, activity } from './bus.js';
import { notifyJarvis } from './jarvisLink.js';

export interface TaskEdit {
  title?: string;
  prompt?: string;
  model?: string;
  cwd?: string;
}

export function getPlanPayload(projectId: string) {
  const project = q.getProject.get(projectId) as ProjectRow | undefined;
  if (!project) return null;
  const tasks = (q.tasksForProject.all(projectId) as TaskRow[]).map((t) => ({
    ...t,
    depends_on: JSON.parse(t.depends_on) as string[],
  }));
  return { project, tasks };
}

export function approvePlan(projectId: string, edits: Record<string, TaskEdit> = {}) {
  const plan = getPlanPayload(projectId);
  if (!plan || plan.project.status !== 'pending_approval') return false;

  for (const task of plan.tasks) {
    const edit = edits[task.id];
    if (edit) {
      q.updateTask.run(
        edit.title ?? task.title,
        edit.prompt ?? task.prompt,
        edit.model ?? task.model,
        edit.cwd ?? task.cwd,
        task.id
      );
    }
    q.updateTaskStatus.run('approved', null, task.id);
  }
  q.updateProjectStatus.run('active', projectId);
  const updated = getPlanPayload(projectId)!;
  broadcast('plan.updated', { plan: updated });
  activity(`plan approved: ${updated.project.name}`);

  const taskLines = updated.tasks
    .map(
      (t) =>
        `- ${t.id} "${t.title}" [${t.model}] cwd=${t.cwd ?? 'default'} depends_on=[${(t.depends_on as string[]).join(', ') || 'none'}]`
    )
    .join('\n');
  notifyJarvis(
    `Adam APPROVED plan ${projectId} ("${updated.project.name}")${Object.keys(edits).length ? ' with edits' : ''}. Begin execution now: call spawn_agent (task_id) for every task whose dependencies are met, respecting the concurrency cap. As completion notes arrive, spawn dependent tasks. Tasks:\n${taskLines}`
  );
  return true;
}

export function rejectPlan(projectId: string, reason: string) {
  const plan = getPlanPayload(projectId);
  if (!plan || plan.project.status !== 'pending_approval') return false;
  q.updateProjectStatus.run('rejected', projectId);
  for (const task of plan.tasks) q.updateTaskStatus.run('rejected', null, task.id);
  broadcast('plan.updated', { plan: getPlanPayload(projectId) });
  activity(`plan rejected: ${plan.project.name}`);
  notifyJarvis(
    `Adam REJECTED plan ${projectId} ("${plan.project.name}")${reason ? ` — reason: "${reason}"` : ''}. Revise the plan or ask him what he'd prefer.`
  );
  return true;
}

export function pendingPlan() {
  const project = q.latestPendingProject.get() as ProjectRow | undefined;
  if (!project) return null;
  return getPlanPayload(project.id);
}
