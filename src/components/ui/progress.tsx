import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

export function Progress({ value, className, indicatorColor = 'bg-zinc-900 dark:bg-zinc-100', ...props }: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800', className)}
      {...props}
    >
      <div
        className={cn('h-full w-full flex-1 transition-all duration-300', indicatorColor)}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}
