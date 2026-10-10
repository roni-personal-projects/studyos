'use client';

import React, { useState } from 'react';
import { useStudyStore } from '@/lib/store/study-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { getDaysUntilExam } from '@/lib/engine/planner';
import { AddExamModal } from '@/components/modals/add-exam-modal';

export function ExamsPage() {
  const { exams, subjects, todayStr, markExamCompleted, deleteExam } = useStudyStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'Upcoming' | 'Completed' | 'All'>('Upcoming');

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const filteredExams = exams.filter((e) => {
    if (filter === 'All') return true;
    return e.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
            Exams &amp; Milestones
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            StudyOS evaluates multiple exams simultaneously to allocate study capacity proportionally.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Exam
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['Upcoming', 'Completed', 'All'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredExams.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar className="h-10 w-10 text-zinc-400 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No exams in this view
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
            Add your upcoming tests or board exam dates to let the priority engine schedule prep work.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Exam
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => {
            const isCompleted = exam.status === 'Completed';
            const daysLeft = getDaysUntilExam(todayStr, exam.exam_date);
            const isUrgent = !isCompleted && daysLeft <= 2;
            const subjectNames = (exam.subject_ids || [])
              .map((id) => subjectMap.get(id))
              .filter(Boolean);

            return (
              <Card
                key={exam.id}
                className={`flex flex-col justify-between p-5 transition-all ${
                  isUrgent
                    ? 'border-zinc-900/30 ring-1 ring-zinc-900/10 dark:border-zinc-700'
                    : isCompleted
                    ? 'opacity-60 bg-zinc-50/50 dark:bg-zinc-900/40'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {exam.name}
                      </h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3.5 w-3.5" /> {exam.exam_date}
                      </p>
                    </div>

                    <Badge
                      variant={
                        isCompleted
                          ? 'success'
                          : isUrgent
                          ? 'error'
                          : daysLeft <= 7
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {isCompleted
                        ? 'Completed'
                        : daysLeft === 0
                        ? 'Today!'
                        : daysLeft === 1
                        ? 'Tomorrow!'
                        : `${daysLeft} days left`}
                    </Badge>
                  </div>

                  {/* Linked Subjects */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {subjectNames.map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>

                  {exam.notes && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                      {exam.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] text-zinc-400">
                    {!isCompleted && daysLeft <= 2
                      ? 'Receives top priority weight in daily plan'
                      : ''}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markExamCompleted(exam.id)}
                        className="h-8 text-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                        Complete
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete exam "${exam.name}"?`)) {
                          deleteExam(exam.id);
                        }
                      }}
                      className="text-zinc-400 hover:text-rose-500 h-8 px-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddExamModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

export default ExamsPage;
