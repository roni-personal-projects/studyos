'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStudyStore } from '@/lib/store/study-context';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ReviewRevisionModal } from '../modals/review-revision-modal';
import { Revision } from '@/types';

export function RevisionsDueCard() {
  const { revisions, chapters, subjects, todayStr } = useStudyStore();
  const [selectedRevision, setSelectedRevision] = useState<{
    rev: Revision;
    chapterName: string;
  } | null>(null);

  const chapterMap = new Map(chapters.map((c) => [c.id, c]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Revisions due on or before today
  const dueRevisions = revisions
    .filter((r) => !r.completed_at && r.scheduled_for <= todayStr)
    .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for));

  return (
    <>
      <Card className="border-zinc-200/80 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-indigo-500" />
            Spaced Revisions Due
          </CardTitle>
          <Link
            href="/revisions"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-0.5"
          >
            All <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        {dueRevisions.length > 0 ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {dueRevisions.length} revision{dueRevisions.length > 1 ? 's' : ''} ready for recall test
              </span>
              <Badge variant="warning" className="text-[11px]">
                {dueRevisions.length} Due
              </Badge>
            </div>

            <div className="space-y-2">
              {dueRevisions.slice(0, 3).map((rev) => {
                const chapter = chapterMap.get(rev.chapter_id);
                const subject = chapter ? subjectMap.get(chapter.subject_id) : null;
                const isOverdue = rev.scheduled_for < todayStr;

                return (
                  <div
                    key={rev.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {chapter?.name || 'Unknown Chapter'}
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span>{subject?.name}</span>
                        <span>•</span>
                        <span className={isOverdue ? 'text-rose-500 font-medium' : ''}>
                          {isOverdue ? 'Overdue' : 'Due Today'} (+{rev.interval_days}d)
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedRevision({
                          rev,
                          chapterName: chapter?.name || 'Chapter',
                        })
                      }
                      className="h-7 text-xs flex-shrink-0"
                    >
                      Rate &amp; Complete
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Zero revisions overdue!
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Completing syllabus chapters automatically schedules spaced revisions.
            </p>
          </div>
        )}
      </Card>

      {selectedRevision && (
        <ReviewRevisionModal
          isOpen={true}
          onClose={() => setSelectedRevision(null)}
          revisionId={selectedRevision.rev.id}
          chapterName={selectedRevision.chapterName}
          intervalDays={selectedRevision.rev.interval_days}
        />
      )}
    </>
  );
}
