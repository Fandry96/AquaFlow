'use server';

/**
 * @fileOverview Rewrites a mundane task description into cyberpunk-themed flavor text.
 *
 * - rewriteBoringTask - A function that rewrites the task description.
 * - RewriteBoringTaskInput - The input type for the rewriteBoringTask function.
 * - RewriteBoringTaskOutput - The return type for the rewriteBoringTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteBoringTaskInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The mundane task description to rewrite.'),
});
export type RewriteBoringTaskInput = z.infer<typeof RewriteBoringTaskInputSchema>;

const RewriteBoringTaskOutputSchema = z.object({
  rewrittenTaskDescription: z
    .string()
    .describe('The cyberpunk-themed rewritten task description.'),
});
export type RewriteBoringTaskOutput = z.infer<typeof RewriteBoringTaskOutputSchema>;

export async function rewriteBoringTask(input: RewriteBoringTaskInput): Promise<RewriteBoringTaskOutput> {
  return rewriteBoringTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rewriteBoringTaskPrompt',
  input: {schema: RewriteBoringTaskInputSchema},
  output: {schema: RewriteBoringTaskOutputSchema},
  prompt: `Rewrite the following mundane task description into cyberpunk-themed flavor text:

{{taskDescription}}

Consider the context of a cyberpunk mercenary managing their daily contracts.
Use neon green and hot pink accents in your description.
Focus on making the task sound more engaging and dangerous.`,
});

const rewriteBoringTaskFlow = ai.defineFlow(
  {
    name: 'rewriteBoringTaskFlow',
    inputSchema: RewriteBoringTaskInputSchema,
    outputSchema: RewriteBoringTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
