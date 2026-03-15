export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  rewrittenTitle?: string;
  reward: number;
  difficulty: number;
  status: TaskStatus;
}
