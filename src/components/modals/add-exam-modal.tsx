'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { useStudyStore } from '@/lib/store/study-context';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExamModal({ isOpen, onClose }: AddExamModalProps) {
  const { subjects, addExam, todayStr } = useStudyStore();
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const toggleSubject = (subId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !examDate) return;

    addExam(
      name.trim(),
      examDate,
      selectedSubjects.length > 0 ? selectedSubjects : subjects.map((s) => s.id),
      notes.trim() || undefined
    );

    setName('');
    setExamDate('');
    setSelectedSubjects([]);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Exam"
      description="StudyOS will automatically recalculate daily urgency based on exam proximity."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Exam Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CBSE Physics Board, JEE Mock Test"
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
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Leave unselected to cover all subjects.
          </p>
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
