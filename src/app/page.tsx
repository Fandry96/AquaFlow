'use client';

import { useMemo } from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import useLocalStorage from '@/lib/hooks/use-local-storage';
import { ContractInput } from '@/components/contract-input';
import { BountyCard } from '@/components/bounty-card';
import { CreditCounter } from '@/components/credit-counter';
import { Separator } from '@/components/ui/separator';

const sectionTitles: Record<TaskStatus, string> = {
  OPEN: 'OPEN BOUNTIES',
  IN_PROGRESS: 'IN PROGRESS',
  COMPLETED: 'CLAIMED BOUNTIES',
};

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('neon-bounties-tasks', []);

  const totalCredits = useMemo(() => {
    return tasks
      .filter((task) => task.status === 'COMPLETED')
      .reduce((sum, task) => sum + task.reward, 0);
  }, [tasks]);

  const handleAddTask = (task: Task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
  };

  const handleUpdateStatus = (id: string, status: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, status } : task))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };
  
  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      (acc[task.status] = acc[task.status] || []).push(task);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  const taskSections: TaskStatus[] = ['IN_PROGRESS', 'OPEN', 'COMPLETED'];

  return (
    <main className="container mx-auto min-h-screen p-4 md:p-8">
      <header className="mb-8 space-y-4">
        <h1 
          className="glitch-effect text-center text-4xl md:text-6xl font-bold tracking-widest text-primary" 
          data-text="NEON BOUNTIES"
        >
          NEON BOUNTIES
        </h1>
        <p className="text-center text-lg text-muted-foreground">Your cyberpunk mercenary contract board.</p>
        <div className="flex justify-center pt-4">
          <CreditCounter credits={totalCredits} />
        </div>
      </header>

      <section className="mb-12">
        <ContractInput onAddTask={handleAddTask} />
      </section>

      <div className="space-y-12">
        {taskSections.map(status => (
          (groupedTasks[status] && groupedTasks[status].length > 0) && (
            <section key={status}>
              <h2 className="mb-4 text-2xl font-bold text-accent">{sectionTitles[status]}</h2>
              <Separator className="mb-6 bg-accent/30" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedTasks[status]
                .sort((a,b) => b.reward - a.reward)
                .map((task) => (
                  <BountyCard
                    key={task.id}
                    task={task}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </section>
          )
        ))}
      </div>
      <footer className="mt-16 py-4 text-center text-sm text-muted-foreground">
        <p>// END OF TRANSMISSION //</p>
      </footer>
    </main>
  );
}
