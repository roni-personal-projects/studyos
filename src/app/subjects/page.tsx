'use client';

import React, { useState } from 'react';
import { useStudyStore } from '@/lib/store/study-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Clock,
  Circle,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { AddSubjectModal } from '@/components/modals/add-subject-modal';
import { AddChapterModal } from '@/components/modals/add-chapter-modal';
import { AddErrorModal } from '@/components/modals/add-error-modal';
import { ChapterStatus } from '@/types';

export default function SubjectsPage() {
  const {
    subjects,
    chapters,
    errors,
    updateChapterStatus,
    updateChapterConfidence,
    deleteChapter,
    deleteSubject,
  } = useStudyStore();

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [selectedSubjectIdForChapter, setSelectedSubjectIdForChapter] = useState<string | null>(null);
  const [selectedChapterForError, setSelectedChapterForError] = useState<string | null>(null);
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>(
    subjects.length > 0 ? subjects[0].id : ''
  );

  const currentSubject = subjects.find((s) => s.id === activeSubjectTab) || subjects[0];
  const subjectChapters = currentSubject
    ? chapters.filter((c) => c.subject_id === currentSubject.id)
    : [];

  const subjectErrors = currentSubject
    ? errors.filter((e) => subjectChapters.some((c) => c.id === e.chapter_id))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
            Syllabus &amp; Subjects
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track chapter completion, confidence ratings, and chapter-specific mistakes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddSubject(true)}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Subject
          </Button>
          {currentSubject && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedSubjectIdForChapter(currentSubject.id)}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Chapter
            </Button>
          )}
        </div>
      </div>

      {subjects.length === 0 ? (
        <Card className="text-center py-16">
          <BookOpen className="h-10 w-10 text-zinc-400 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No subjects created yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
            Create your subjects (e.g. Physics, Maths, Chemistry) to build your study curriculum.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddSubject(true)}
            className="mt-4 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Subject
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Subject Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {subjects.map((sub) => {
              const isActive = (currentSubject?.id || '') === sub.id;
              const subChaps = chapters.filter((c) => c.subject_id === sub.id);
              const completedCount = subChaps.filter((c) => c.status === 'Completed').length;
              const pct = subChaps.length > 0 ? Math.round((completedCount / subChaps.length) * 100) : 0;

              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubjectTab(sub.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-zinc-900 bg-white text-zinc-950 shadow-xs ring-1 ring-zinc-900/10 dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-50'
                      : 'border-zinc-200/70 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{sub.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-500">
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>

          {currentSubject && (
            <div className="space-y-4">
              {/* Subject Overview Card */}
              <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {currentSubject.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span>{subjectChapters.length} Chapters</span>
                    <span>•</span>
                    <span>{subjectErrors.length} Errors logged</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSubjectIdForChapter(currentSubject.id)}
                    className="text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Chapter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete subject "${currentSubject.name}" and all its chapters?`)) {
                        deleteSubject(currentSubject.id);
                        const remaining = subjects.filter((s) => s.id !== currentSubject.id);
                        if (remaining.length > 0) setActiveSubjectTab(remaining[0].id);
                      }
                    }}
                    className="text-rose-500 hover:text-rose-700 h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Chapters List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Chapters &amp; Syllabus
                </h4>

                {subjectChapters.length === 0 ? (
                  <Card className="text-center py-8 border-dashed">
                    <p className="text-xs text-zinc-500">No chapters added to this subject yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSubjectIdForChapter(currentSubject.id)}
                      className="mt-3 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add First Chapter
                    </Button>
                  </Card>
                ) : (
                  subjectChapters.map((chapter) => {
                    const chapterErrorCount = errors.filter((e) => e.chapter_id === chapter.id).length;

                    return (
                      <div
                        key={chapter.id}
                        className="p-3.5 rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          {/* Status toggle button */}
                          <button
                            onClick={() => {
                              const nextStatus: ChapterStatus =
                                chapter.status === 'Not Started'
                                  ? 'In Progress'
                                  : chapter.status === 'In Progress'
                                  ? 'Completed'
                                  : 'Not Started';
                              updateChapterStatus(chapter.id, nextStatus);
                            }}
                            className="mt-0.5 sm:mt-0 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Click to advance status"
                          >
                            {chapter.status === 'Completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : chapter.status === 'In Progress' ? (
                              <Clock className="h-5 w-5 text-amber-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-semibold ${
                                  chapter.status === 'Completed'
                                    ? 'text-zinc-600 dark:text-zinc-400 line-through'
                                    : 'text-zinc-900 dark:text-zinc-100'
                                }`}
                              >
                                {chapter.name}
                              </span>
                              <Badge
                                variant={
                                  chapter.status === 'Completed'
                                    ? 'success'
                                    : chapter.status === 'In Progress'
                                    ? 'warning'
                                    : 'default'
                                }
                                className="text-[10px]"
                              >
                                {chapter.status}
                              </Badge>
                              {chapterErrorCount > 0 && (
                                <Badge variant="error" className="text-[10px]">
                                  {chapterErrorCount} error{chapterErrorCount > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Confidence & Chapter Actions */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {/* Confidence Rating (1-5) */}
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-zinc-400 mr-1">Confidence:</span>
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() => updateChapterConfidence(chapter.id, lvl)}
                                className={`h-6 w-6 rounded-md flex items-center justify-center text-xs font-semibold transition-colors ${
                                  chapter.confidence >= lvl
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 hover:bg-zinc-200'
                                }`}
                                title={`Set confidence ${lvl}/5`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedChapterForError(chapter.id)}
                            className="h-8 px-2 text-xs text-zinc-500 hover:text-zinc-900"
                            title="Log mistake for this chapter"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 mr-1 text-rose-500" />
                            Mistake
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete chapter "${chapter.name}"?`)) {
                                deleteChapter(chapter.id);
                              }
                            }}
                            className="text-zinc-400 hover:text-rose-500 h-8 px-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AddSubjectModal isOpen={showAddSubject} onClose={() => setShowAddSubject(false)} />

      {selectedSubjectIdForChapter && (
        <AddChapterModal
          isOpen={true}
          defaultSubjectId={selectedSubjectIdForChapter}
          onClose={() => setSelectedSubjectIdForChapter(null)}
        />
      )}

      {selectedChapterForError && (
        <AddErrorModal
          isOpen={true}
          defaultChapterId={selectedChapterForError}
          onClose={() => setSelectedChapterForError(null)}
        />
      )}
    </div>
  );
}
