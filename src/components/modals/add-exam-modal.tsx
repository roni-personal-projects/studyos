'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { useStudyStore } from '@/lib/store/study-context';
import { Check, CheckSquare, Square } from 'lucide-react';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExamModal({ isOpen, onClose }: AddExamModalProps) {
  const { subjects, chapters, addExam, todayStr } = useStudyStore();
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const effectiveSubjectIds = selectedSubjects.length > 0 ? selectedSubjects : subjects.map((s) => s.id);

  const toggleSubject = (subId: string) => {
    setSelectedSubjects((prev) => {
      const isSelected = prev.includes(subId);
      if (isSelected) {
        // Deselect subject and also remove its chapters from selectedChapters
        const newSubs = prev.filter((id) => id !== subId);
        const subChapterIds = chapters.filter((c) => c.subject_id === subId).map((c) => c.id);
        setSelectedChapters((currChaps) => currChaps.filter((cId) => !subChapterIds.includes(cId)));
        return newSubs;
      } else {
        // Select subject and auto-select all its chapters by default
        const newSubs = [...prev, subId];
        const subChapterIds = chapters.filter((c) => c.subject_id === subId).map((c) => c.id);
        setSelectedChapters((currChaps) => Array.from(new Set([...currChaps, ...subChapterIds])));
        return newSubs;
      }
    });
  };

  const toggleChapter = (chapId: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapId) ? prev.filter((id) => id !== chapId) : [...prev, chapId]
    );
  };

  const selectAllChaptersForSubject = (subId: string) => {
    const subChapterIds = chapters.filter((c) => c.subject_id === subId).map((c) => c.id);
    setSelectedChapters((prev) => Array.from(new Set([...prev, ...subChapterIds])));
  };

  const deselectAllChaptersForSubject = (subId: string) => {
    const subChapterIds = new Set(chapters.filter((c) => c.subject_id === subId).map((c) => c.id));
    setSelectedChapters((prev) => prev.filter((id) => !subChapterIds.has(id)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !examDate) return;

    const finalSubjectIds = selectedSubjects.length > 0 ? selectedSubjects : subjects.map((s) => s.id);
    // If user selected specific chapters, use them. If none selected, fallback to all chapters of the selected subjects.
    let finalChapterIds = selectedChapters;
    if (finalChapterIds.length === 0) {
      finalChapterIds = chapters
        .filter((c) => finalSubjectIds.includes(c.subject_id))
        .map((c) => c.id);
    }

    addExam(
      name.trim(),
      examDate,
      finalSubjectIds,
      notes.trim() || undefined,
      finalChapterIds
    );

    setName('');
    setExamDate('');
    setSelectedSubjects([]);
    setSelectedChapters([]);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Exam"
      description="Select subjects and the exact chapters coming in this exam so StudyOS can prioritize syllabus prep."
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Exam Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CBSE Maths Term 1, Science Pre-Board"
            required
            autoFocus
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Exam Date *
          </label>
          <input
            type="date"
            value={examDate}
            min={todayStr}
            onChange={(e) => setExamDate(e.target.value)}
            required
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Covered Subjects
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {subjects.map((s) => {
              const isSelected = selectedSubjects.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSubject(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {s.name}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Select one or more subjects to specify test syllabus.
          </p>
        </div>

        {/* Chapters selection per covered subject */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Syllabus Chapters Coming in this Exam
          </label>

          <div className="space-y-3">
            {effectiveSubjectIds.map((subId) => {
              const sub = subjects.find((s) => s.id === subId);
              if (!sub) return null;
              const subChapters = chapters.filter((c) => c.subject_id === subId);

              if (subChapters.length === 0) {
                return (
                  <div key={subId} className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs text-zinc-400">
                    No chapters exist in {sub.name} yet.
                  </div>
                );
              }

              const allSelected = subChapters.every((c) => selectedChapters.includes(c.id));
              const someSelected = subChapters.some((c) => selectedChapters.includes(c.id));

              return (
                <div
                  key={subId}
                  className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {sub.name} ({subChapters.filter((c) => selectedChapters.includes(c.id)).length}/{subChapters.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => selectAllChaptersForSubject(subId)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <button
                        type="button"
                        onClick={() => deselectAllChaptersForSubject(subId)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {subChapters.map((chap) => {
                      const isChecked = selectedChapters.includes(chap.id);
                      return (
                        <button
                          type="button"
                          key={chap.id}
                          onClick={() => toggleChapter(chap.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors border ${
                            isChecked
                              ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-zinc-900 dark:text-zinc-100'
                              : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-zinc-400 dark:text-zinc-600 flex-shrink-0" />
                          )}
                          <span className="truncate">{chap.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Notes / Target Focus (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key syllabus scope, scoring targets, or test center..."
            rows={2}
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Exam
          </Button>
        </div>
      </form>
    </Modal>
  );
}
