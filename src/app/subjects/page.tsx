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
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { AddSubjectModal } from '@/components/modals/add-subject-modal';
import { AddChapterModal } from '@/components/modals/add-chapter-modal';
import { AddErrorModal } from '@/components/modals/add-error-modal';
import { ChapterStatus } from '@/types';
import {
  getSubjectChecklist,
  computeMasteryStatus,
  MasteryStatus,
} from '@/lib/engine/checklists';

export default function SubjectsPage() {
  const {
    subjects,
    chapters,
    revisions,
    errors,
    todayStr,
    updateChapterStatus,
    toggleChapterCheckpoint,
    updateChapterConfidence,
    deleteChapter,
    deleteSubject,
  } = useStudyStore();

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [selectedSubjectIdForChapter, setSelectedSubjectIdForChapter] = useState<string | null>(null);
  const [selectedChapterForError, setSelectedChapterForError] = useState<string | null>(null);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
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

  const getMasteryBadgeVariant = (status: MasteryStatus) => {
    switch (status) {
      case 'Exam-ready':
      case 'First pass complete':
        return 'success';
      case 'Revision due':
        return 'warning';
      case 'Practice':
        return 'secondary';
      case 'Learning':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
            Syllabus &amp; Subjects
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track fixed mastery checklists, chapter completion phases, confidence ratings, and error logs.
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
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
            Create your subjects (e.g. Mathematics, Science, SST) to build your study curriculum.
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
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-500 dark:text-zinc-400">
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
                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Chapters &amp; Checklists
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    Click &quot;Checklist&quot; to inspect and mark checkpoints
                  </span>
                </div>

                {subjectChapters.length === 0 ? (
                  <Card className="text-center py-8 border-dashed">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">No chapters added to this subject yet.</p>
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
                    const checklist = getSubjectChecklist(currentSubject.name, chapter.name);
                    const completedCheckpoints = new Set(chapter.checklist_progress || []);
                    const completedCount = checklist.items.filter((item) =>
                      completedCheckpoints.has(item.id)
                    ).length;
                    const totalCheckpoints = checklist.items.length;
                    const checklistPct = Math.round((completedCount / totalCheckpoints) * 100);

                    const hasDueRevision = revisions.some(
                      (r) => r.chapter_id === chapter.id && !r.completed_at && r.scheduled_for <= todayStr
                    );

                    const masteryStatus = computeMasteryStatus({
                      completedCount,
                      totalCount: totalCheckpoints,
                      hasDueRevision,
                      confidence: chapter.confidence,
                    });

                    const isExpanded = expandedChapterId === chapter.id;

                    return (
                      <div
                        key={chapter.id}
                        className={`rounded-xl border transition-all ${
                          chapter.status === 'Completed'
                            ? 'border-emerald-200/60 bg-emerald-50/15 dark:border-emerald-950/60 dark:bg-emerald-950/10'
                            : 'border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                        }`}
                      >
                        {/* Chapter summary row */}
                        <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                              className="mt-0.5 sm:mt-0 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
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

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-sm font-semibold truncate ${
                                    chapter.status === 'Completed'
                                      ? 'text-zinc-700 dark:text-zinc-300'
                                      : 'text-zinc-900 dark:text-zinc-100'
                                  }`}
                                >
                                  {chapter.name}
                                </span>

                                <Badge
                                  variant={getMasteryBadgeVariant(masteryStatus)}
                                  className="text-[10px]"
                                >
                                  {masteryStatus}
                                </Badge>

                                {chapterErrorCount > 0 && (
                                  <Badge variant="error" className="text-[10px]">
                                    {chapterErrorCount} mistake{chapterErrorCount > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>

                              {/* Progress bar and checkpoint ratio */}
                              <div className="flex items-center gap-2.5 mt-1.5">
                                <div className="w-28 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      completedCount === totalCheckpoints
                                        ? 'bg-emerald-500'
                                        : 'bg-indigo-500'
                                    }`}
                                    style={{ width: `${checklistPct}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                  {completedCount}/{totalCheckpoints} checkpoints ({checklistPct}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Confidence & Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Toggle checklist accordion button */}
                            <button
                              type="button"
                              onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                isExpanded
                                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border-transparent'
                              }`}
                            >
                              <span>Checklist</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* Confidence Rating (1-5) */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <button
                                  key={lvl}
                                  onClick={() => updateChapterConfidence(chapter.id, lvl)}
                                  className={`h-6 w-6 rounded-md flex items-center justify-center text-xs font-semibold transition-colors ${
                                    chapter.confidence >= lvl
                                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                      : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 hover:bg-zinc-200'
                                  }`}
                                  title={`Confidence ${lvl}/5`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedChapterForError(chapter.id)}
                              className="h-8 px-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                              title="Log mistake for this chapter"
                            >
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
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

                        {/* Expandable Fixed Checklist Drawer */}
                        {isExpanded && (
                          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 rounded-b-xl space-y-3 animate-in fade-in duration-150">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                                  {checklist.title} — Completion Requirements
                                </h5>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                  {checklist.subtitle} · Complete all {totalCheckpoints} checkpoints to master this chapter.
                                </p>
                              </div>

                              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                {completedCount}/{totalCheckpoints} Done
                              </span>
                            </div>

                            {checklist.rule && (
                              <div className="p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 text-[11px] text-amber-800 dark:text-amber-300">
                                <strong>Rule:</strong> {checklist.rule}
                              </div>
                            )}

                            {/* Checkpoints list */}
                            <div className="space-y-1.5 pt-1">
                              {checklist.items.map((item, idx) => {
                                const isChecked = completedCheckpoints.has(item.id);

                                return (
                                  <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => toggleChapterCheckpoint(chapter.id, item.id)}
                                    className={`w-full text-left p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
                                      isChecked
                                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-zinc-900 dark:text-zinc-100'
                                        : 'border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                                    }`}
                                  >
                                    <div className="mt-0.5 flex-shrink-0">
                                      {isChecked ? (
                                        <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                      ) : (
                                        <Square className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                          #{idx + 1}
                                        </span>
                                        <span
                                          className={`text-xs ${
                                            isChecked
                                              ? 'line-through text-zinc-500 dark:text-zinc-400 font-normal'
                                              : 'font-medium'
                                          }`}
                                        >
                                          {item.label}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
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
