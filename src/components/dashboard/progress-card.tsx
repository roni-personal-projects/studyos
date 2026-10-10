'use client';

import React from 'react';
import Link from 'next/link';
import { useStudyStore } from '@/lib/store/study-context';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { PieChart, ArrowRight } from 'lucide-react';

export function ProgressCard() {
  const { progress } = useStudyStore();

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <PieChart className="h-4 w-4 text-emerald-500" />
          Syllabus Progress
        </CardTitle>
        <Link
          href="/subjects"
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-0.5"
        >
          Details <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <div className="space-y-4">
        {/* Overall Percentage */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {progress.overallPercentage}%
            </span>
            <span className="text-xs text-zinc-500">
              {progress.completedChapters} of {progress.totalChapters} chapters done
            </span>
          </div>
          <Progress value={progress.overallPercentage} className="h-2" />
        </div>

        {/* Subject Breakdown */}
        <div className="space-y-2.5 pt-1">
          {progress.subjectBreakdown.map((sub) => (
            <div key={sub.subjectId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {sub.subjectName}
                </span>
                <span className="text-zinc-500 font-mono text-[11px]">
                  {sub.percentage}%
                </span>
              </div>
              <Progress value={sub.percentage} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
