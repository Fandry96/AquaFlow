'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Plus, WandSparkles, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { Task } from '@/lib/types';
import { rewriteTaskAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skull } from '@/components/icons';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(3, 'Bounty title must be at least 3 characters.'),
  reward: z.coerce.number().min(1, 'Reward must be at least 1 credit.'),
  difficulty: z.number().min(1).max(5),
});

type ContractInputFormValues = z.infer<typeof formSchema>;

interface ContractInputProps {
  onAddTask: (task: Task) => void;
}

export function ContractInput({ onAddTask }: ContractInputProps) {
  const [isRewriting, setIsRewriting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContractInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      reward: 100,
      difficulty: 3,
    },
  });

  const handleRewrite = async () => {
    const title = form.getValues('title');
    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Enter a task description to rewrite.',
      });
      return;
    }
    setIsRewriting(true);
    const { rewrittenTask, error } = await rewriteTaskAction(title);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Rewrite Failed',
        description: error,
      });
    } else if (rewrittenTask) {
      form.setValue('title', rewrittenTask);
      toast({
        title: 'Fixer Uplink Successful',
        description: 'Bounty description has been enhanced.',
      });
    }
    setIsRewriting(false);
  };

  function onSubmit(values: ContractInputFormValues) {
    const newTask: Task = {
      id: uuidv4(),
      title: values.title,
      reward: values.reward,
      difficulty: values.difficulty,
      status: 'OPEN',
    };
    onAddTask(newTask);
    form.reset();
  }

  return (
    <Card className="border-accent/50 bg-card/80 shadow-[0_0_15px_rgba(255,0,255,0.3)]">
      <CardHeader>
        <CardTitle className="text-accent">NEW CONTRACT</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bounty Details</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="e.g., Decontaminate the Ceramic Sector" {...field} />
                    </FormControl>
                    <Button type="button" size="icon" variant="ghost" onClick={handleRewrite} disabled={isRewriting}>
                      {isRewriting ? <LoaderCircle className="animate-spin" /> : <WandSparkles className="text-accent" />}
                      <span className="sr-only">Rewrite Task</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="reward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward (Credits)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level: {field.value}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4 pt-2">
                         <div className="flex items-center gap-1 text-primary">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Skull key={i} className={cn('h-5 w-5', i < field.value ? 'fill-primary' : 'fill-none opacity-30')} />
                          ))}
                        </div>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="mr-2" />
              Accept Contract
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
