'use client';

import React, { useState } from 'react';
import { useStudyStore } from '@/lib/store/study-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Trash2,
  Check,
  Filter,
} from 'lucide-react';
import { AddErrorModal } from '@/components/modals/add-error-modal';
import { MistakeType } from '@/types';

const MISTAKE_TYPES: MistakeType[] = [
  'Concept',
  'Formula',
  'Calculation',
  'Careless',
  'Misread Question',
  'Time Management',
  'Guess',
  'Other',
];

export default function ErrorJournalPage() {
  const { errors, chapters, subjects, markErrorReviewed, deleteError } = useStudyStore();
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedMistakeType, setSelectedMistakeType] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'unreviewed' | 'reviewed'>('unreviewed');

  const chapterMap = new Map(chapters.map((c) => [c.id, c]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const filteredErrors = errors.filter((err) => {
    const chapter = chapterMap.get(err.chapter_id);
    if (!chapter) return false;

    // Subject filter
    if (selectedSubjectId !== 'all' && chapter.subject_id !== selectedSubjectId) {
      return false;
    }

    // Mistake type filter
    if (selectedMistakeType !== 'all' && err.mistake_type !== selectedMistakeType) {
      return false;
    }

    // Review status filter
    if (reviewFilter === 'unreviewed' && err.reviewed_at) return false;
    if (reviewFilter === 'reviewed' && !err.reviewed_at) return false;

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            Error Journal
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Subject-wide aggregated repository of exam mistakes, calculation traps, and conceptual misunderstandings.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Log Mistake
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-3.5 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200/70 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filters:
            </span>

            {/* Subject Select */}
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Mistake Type Select */}
            <select
              value={selectedMistakeType}
              onChange={(e) => setSelectedMistakeType(e.target.value)}
              className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value="all">All Mistake Types</option>
              {MISTAKE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-white dark:bg-zinc-800 self-start sm:self-auto">
            {(['unreviewed', 'reviewed', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setReviewFilter(status)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  reviewFilter === status
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Errors List */}
      {filteredErrors.length === 0 ? (
        <Card className="text-center py-16">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No mistakes found in this view
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
            {reviewFilter === 'unreviewed'
              ? 'Great job! You have reviewed all logged mistakes.'
              : 'No mistake entries matching your current filter criteria.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Log Mistake
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredErrors.map((err) => {
            const chapter = chapterMap.get(err.chapter_id);
            const subject = chapter ? subjectMap.get(chapter.subject_id) : null;
            const isReviewed = !!err.reviewed_at;

            return (
              <Card
                key={err.id}
                className={`p-4 transition-all ${
                  isReviewed
                    ? 'opacity-65 bg-zinc-50/50 dark:bg-zinc-900/40'
                    : 'border-zinc-200/90 hover:border-zinc-300 dark:border-zinc-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-500">
                        {subject?.name} · {chapter?.name}
                      </span>
                      <Badge
                        variant={
                          err.mistake_type === 'Concept'
                            ? 'error'
                            : err.mistake_type === 'Formula'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {err.mistake_type}
                      </Badge>
                      {isReviewed ? (
                        <Badge variant="success" className="text-[10px]">
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          Needs Review
                        </Badge>
                      )}
                    </div>

                    {err.question && (
                      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1.5 rounded-md">
                        <span className="text-zinc-500 mr-1.5 font-semibold">Q:</span>
                        {err.question}
                      </div>
                    )}

                    <div className="text-xs text-zinc-800 dark:text-zinc-200">
                      <span className="font-semibold text-rose-500 mr-1.5">What went wrong:</span>
                      {err.what_went_wrong}
                    </div>

                    {err.correct_method && (
                      <div className="text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="font-semibold text-emerald-600 mr-1.5">Correct Method:</span>
                        {err.correct_method}
                      </div>
                    )}

                    {err.lesson_learned && (
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                        <span className="font-semibold not-italic text-zinc-500 mr-1.5">Lesson:</span>
                        {err.lesson_learned}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start pt-1">
                    {!isReviewed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markErrorReviewed(err.id)}
                        className="h-8 text-xs font-medium text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Mark Reviewed
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this error entry?')) {
                          deleteError(err.id);
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

      <AddErrorModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
