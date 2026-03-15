'use client';

import { useState } from 'react';
import { CircleDollarSign, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skull } from '@/components/icons';

interface BountyCardProps {
  task: Task;
  onUpdateStatus: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}

export function BountyCard({ task, onUpdateStatus, onDelete }: BountyCardProps) {
  const [isClaimed, setIsClaimed] = useState(false);

  const handleClaim = () => {
    setIsClaimed(true);
    setTimeout(() => {
      onUpdateStatus(task.id, 'COMPLETED');
      setIsClaimed(false);
    }, 500);
  };

  const statusColors: Record<Task['status'], string> = {
    OPEN: 'bg-accent/80 text-accent-foreground',
    IN_PROGRESS: 'bg-blue-500/80 text-white',
    COMPLETED: 'bg-primary/80 text-primary-foreground',
  };

  return (
    <Card
      className={cn(
        'flex flex-col justify-between transition-all duration-300 hover:border-primary hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]',
        isClaimed && 'claim-animation'
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-primary">{task.title}</CardTitle>
          <Badge className={cn('whitespace-nowrap', statusColors[task.status])}>{task.status.replace('_', ' ')}</Badge>
        </div>
        <CardDescription>Bounty ID: {task.id.slice(0, 8)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reward</span>
          <div className="flex items-center gap-2 font-bold text-primary">
            <CircleDollarSign className="h-4 w-4" />
            {task.reward}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Difficulty</span>
          <div className="flex items-center gap-1 text-primary">
            {Array.from({ length: task.difficulty }).map((_, i) => (
              <Skull key={i} className="h-5 w-5 fill-primary" />
            ))}
            {Array.from({ length: 5 - task.difficulty }).map((_, i) => (
              <Skull key={i} className="h-5 w-5 opacity-30" />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {task.status === 'OPEN' && (
            <Button size="sm" onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}>
              Start Mission
            </Button>
          )}
          {task.status === 'IN_PROGRESS' && (
            <Button size="sm" onClick={handleClaim}>
              Claim Bounty
            </Button>
          )}
        </div>
        {task.status !== 'COMPLETED' && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Bounty</span>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
