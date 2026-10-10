'use client';

import React, { useState } from 'react';
import { useStudyStore } from '@/lib/store/study-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Calendar, CheckCircle2 } from 'lucide-react';
import { ReviewRevisionModal } from '@/components/modals/review-revision-modal';
import { Revision } from '@/types';

export default function RevisionsPage() {
  const { revisions, chapters, subjects, todayStr } = useStudyStore();
  const [selectedRevision, setSelectedRevision] = useState<{
    rev: Revision;
    chapterName: string;
  } | null>(null);
  const [filter, setFilter] = useState<'Due' | 'Upcoming' | 'Completed'>('Due');

  const chapterMap = new Map(chapters.map((c) => [c.id, c]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const dueRevisions = revisions.filter(
    (r) => !r.completed_at && r.scheduled_for <= todayStr
  );
  const upcomingRevisions = revisions.filter(
    (r) => !r.completed_at && r.scheduled_for > todayStr
  );
  const completedRevisions = revisions.filter((r) => r.completed_at);

  const displayedList =
    filter === 'Due'
      ? dueRevisions
      : filter === 'Upcoming'
      ? upcomingRevisions
      : completedRevisions;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
            Spaced Repetition Queue
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Automatic recall testing scheduled at +1, +3, +7, +14, and +30 days after chapter completion.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('Due')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'Due'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span>Due Today &amp; Overdue</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 dark:bg-black/20 font-mono">
            {dueRevisions.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('Upcoming')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'Upcoming'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span>Upcoming</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-700 font-mono">
            {upcomingRevisions.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('Completed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'Completed'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          <span>Completed History</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-700 font-mono">
            {completedRevisions.length}
          </span>
        </button>
      </div>

      {displayedList.length === 0 ? (
        <Card className="text-center py-16">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {filter === 'Due'
              ? 'No revisions due today!'
              : filter === 'Upcoming'
              ? 'No upcoming revisions scheduled'
              : 'No revision history recorded yet'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
            Complete syllabus chapters to automatically populate spaced repetition revisions.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {displayedList.map((rev) => {
            const chapter = chapterMap.get(rev.chapter_id);
            const subject = chapter ? subjectMap.get(chapter.subject_id) : null;
            const isCompleted = !!rev.completed_at;
            const isOverdue = !isCompleted && rev.scheduled_for < todayStr;

            return (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 mt-0.5">
                    <RotateCcw className="h-4 w-4 text-indigo-500" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-500">
                        {subject?.name}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <Badge variant="outline" className="text-[10px]">
                        +{rev.interval_days} day interval
                      </Badge>
                      {rev.difficulty && (
                        <Badge
                          variant={
                            rev.difficulty === 'Hard'
                              ? 'error'
                              : rev.difficulty === 'Easy'
                              ? 'success'
                              : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          Rated: {rev.difficulty}
                        </Badge>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {chapter?.name || 'Unknown Chapter'}
                    </h4>

                    <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {isCompleted ? (
                        <span>Completed on {rev.completed_at?.split('T')[0]}</span>
                      ) : (
                        <span className={isOverdue ? 'text-rose-500 font-semibold' : ''}>
                          Scheduled for {rev.scheduled_for} {isOverdue ? '(Overdue)' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {!isCompleted && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setSelectedRevision({
                        rev,
                        chapterName: chapter?.name || 'Chapter',
                      })
                    }
                    className="self-end sm:self-center text-xs"
                  >
                    Rate &amp; Complete
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedRevision && (
        <ReviewRevisionModal
          isOpen={true}
          onClose={() => setSelectedRevision(null)}
          revisionId={selectedRevision.rev.id}
          chapterName={selectedRevision.chapterName}
          intervalDays={selectedRevision.rev.interval_days}
        />
      )}
    </div>
  );
}
