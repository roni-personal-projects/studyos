'use client';

import React from 'react';
import Link from 'next/link';
import { useStudyStore } from '@/lib/store/study-context';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowRight, ShieldAlert } from 'lucide-react';

export function WeakAreasCard() {
  const { errors, chapters, subjects } = useStudyStore();

  const chapterMap = new Map(chapters.map((c) => [c.id, c]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const unreviewedErrors = errors.filter((e) => !e.reviewed_at);
  const lowConfidenceChapters = chapters.filter((c) => c.confidence <= 2);

  return (
    <Card className="border-zinc-200/80 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          Weak Areas &amp; Errors
        </CardTitle>
        <Link
          href="/errors"
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-0.5"
        >
          Journal <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={unreviewedErrors.length > 0 ? 'error' : 'secondary'}>
            {unreviewedErrors.length} unreviewed mistakes
          </Badge>
          <Badge variant={lowConfidenceChapters.length > 0 ? 'warning' : 'secondary'}>
            {lowConfidenceChapters.length} low-confidence topics
          </Badge>
        </div>

        {unreviewedErrors.length > 0 ? (
          <div className="space-y-2">
            {unreviewedErrors.slice(0, 2).map((err) => {
              const chapter = chapterMap.get(err.chapter_id);
              const subject = chapter ? subjectMap.get(chapter.subject_id) : null;

              return (
                <div
                  key={err.id}
                  className="p-2.5 rounded-lg border border-rose-100 dark:border-rose-950/50 bg-rose-50/30 dark:bg-rose-950/10 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {subject?.name ? `${subject.name} · ` : ''}{chapter?.name}
                    </span>
                    <Badge variant="error" className="text-[10px] py-0">
                      {err.mistake_type}
                    </Badge>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                    {err.what_went_wrong}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">
            No unresolved mistakes logged. Record tricky questions to reinforce them before tests.
          </p>
        )}
      </div>
    </Card>
  );
}
