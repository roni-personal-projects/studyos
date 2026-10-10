'use client';

import React, { useState } from 'react';
import { useStudyStore } from '@/lib/store/study-context';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, CheckCircle, Plus, AlertCircle } from 'lucide-react';
import { getDaysUntilExam } from '@/lib/engine/planner';
import { AddExamModal } from '../modals/add-exam-modal';

export function NearestExamCard() {
  const { exams, subjects, todayStr, markExamCompleted } = useStudyStore();
  const [showAddModal, setShowAddModal] = useState(false);

  // Active upcoming exams sorted by date
  const upcomingExams = exams
    .filter((e) => e.status === 'Upcoming')
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date));

  const nearestExam = upcomingExams[0];

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  return (
    <>
      <Card className="relative overflow-hidden border-zinc-200/80 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-500" />
            Nearest Exam
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Exam
          </Button>
        </CardHeader>

        {nearestExam ? (
          <div>
            {(() => {
              const daysLeft = getDaysUntilExam(todayStr, nearestExam.exam_date);
              const isUrgent = daysLeft <= 2;
              const subjectNames = (nearestExam.subject_ids || [])
                .map((id) => subjectMap.get(id))
                .filter(Boolean)
                .join(', ');

              return (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {nearestExam.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {nearestExam.exam_date} {subjectNames ? `· ${subjectNames}` : ''}
                      </p>
                    </div>

                    <Badge
                      variant={isUrgent ? 'error' : daysLeft <= 7 ? 'warning' : 'secondary'}
                      className="font-semibold px-2.5 py-1 text-xs"
                    >
                      {daysLeft === 0
                        ? 'Today!'
                        : daysLeft === 1
                        ? 'Tomorrow!'
                        : `In ${daysLeft} days`}
                    </Badge>
                  </div>

                  {nearestExam.notes && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      {nearestExam.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs text-zinc-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      Dominates today&apos;s study allocation
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markExamCompleted(nearestExam.id)}
                      className="h-7 text-xs"
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      Mark Completed
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-zinc-500">No active upcoming exams scheduled.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Schedule Exam
            </Button>
          </div>
        )}
      </Card>

      <AddExamModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  );
}
