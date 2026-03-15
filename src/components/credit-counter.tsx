'use client';

import { CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditCounterProps {
  credits: number;
}

export function CreditCounter({ credits }: CreditCounterProps) {
  return (
    <div
      className="glitch-effect group flex items-center gap-4 rounded-lg border-2 border-primary/50 bg-card p-4 shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-shadow hover:shadow-[0_0_25px_rgba(57,255,20,0.8)]"
      data-text={`CREDITS: ${credits}`}
    >
      <CircleDollarSign className="h-8 w-8 text-primary transition-colors group-hover:text-accent" />
      <div>
        <div className="text-sm font-medium text-muted-foreground">TOTAL CREDITS</div>
        <div className="text-3xl font-bold text-primary">{credits}</div>
      </div>
    </div>
  );
}
