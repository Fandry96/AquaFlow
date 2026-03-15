'use server';

import { rewriteBoringTask } from '@/ai/flows/rewrite-boring-task';

export async function rewriteTaskAction(taskDescription: string): Promise<{ rewrittenTask?: string; error?: string }> {
  if (!taskDescription) {
    return { error: 'Task description cannot be empty.' };
  }

  try {
    const result = await rewriteBoringTask({ taskDescription });
    return { rewrittenTask: result.rewrittenTaskDescription };
  } catch (error) {
    console.error('AI task rewrite failed:', error);
    return { error: 'Failed to connect to the Fixer. Please try again.' };
  }
}
