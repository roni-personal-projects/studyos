'use client';

import React, { useState, useEffect } from 'react';
import { useStudyStore } from '@/lib/store/study-context';
import { TodaysPlan } from '@/components/dashboard/todays-plan';
import { NearestExamCard } from '@/components/dashboard/nearest-exam-card';
import { RevisionsDueCard } from '@/components/dashboard/revisions-due-card';
import { ProgressCard } from '@/components/dashboard/progress-card';
import { WeakAreasCard } from '@/components/dashboard/weak-areas-card';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { isLoaded, resetToSampleData } = useStudyStore();

  const [dateFormatted, setDateFormatted] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateFormatted(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-zinc-500 text-xs">
        Loading StudyOS plan...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Top Header / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {dateFormatted}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Study Operating System
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToSampleData}
            className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            title="Reset to sample subjects & exams"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Demo
          </Button>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dominant Left Column: Today's Plan (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <TodaysPlan />
        </div>

        {/* Right Column: Context & Overview Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <NearestExamCard />
          <RevisionsDueCard />
          <ProgressCard />
          <WeakAreasCard />
        </div>
      </div>
    </div>
  );
}
