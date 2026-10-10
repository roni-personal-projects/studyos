'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { useStudyStore } from '@/lib/store/study-context';
import { MistakeType } from '@/types';

interface AddErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChapterId?: string;
}

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

export function AddErrorModal({ isOpen, onClose, defaultChapterId }: AddErrorModalProps) {
  const { chapters, subjects, addError } = useStudyStore();
  const [chapterId, setChapterId] = useState(defaultChapterId || '');
  const [mistakeType, setMistakeType] = useState<MistakeType>('Concept');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [question, setQuestion] = useState('');
  const [correctMethod, setCorrectMethod] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');

  const currentChapterId = chapterId || defaultChapterId || (chapters.length > 0 ? chapters[0].id : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChapterId || !whatWentWrong.trim()) return;

    addError({
      chapterId: currentChapterId,
      mistakeType,
      whatWentWrong,
      question: question.trim() || undefined,
      correctMethod: correctMethod.trim() || undefined,
      lessonLearned: lessonLearned.trim() || undefined,
    });

    // Reset form & close
    setWhatWentWrong('');
    setQuestion('');
    setCorrectMethod('');
    setLessonLearned('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Mistake in Error Journal"
      description="Record what tripped you up so StudyOS can schedule error reviews."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Chapter *
          </label>
          <select
            value={currentChapterId}
            onChange={(e) => setChapterId(e.target.value)}
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            required
          >
            {subjects.map((s) => {
              const subChapters = chapters.filter((c) => c.subject_id === s.id);
              if (subChapters.length === 0) return null;
              return (
                <optgroup key={s.id} label={s.name}>
                  {subChapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Mistake Type *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {MISTAKE_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setMistakeType(type)}
                className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-colors ${
                  mistakeType === type
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Question / Problem (Optional)
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Find roots of 2x^2 - 5x + 3 = 0"
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            What went wrong? *
          </label>
          <textarea
            value={whatWentWrong}
            onChange={(e) => setWhatWentWrong(e.target.value)}
            placeholder="Describe the misunderstanding, forgotten step, or arithmetic fault..."
            rows={2}
            required
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Correct Method (Optional)
            </label>
            <textarea
              value={correctMethod}
              onChange={(e) => setCorrectMethod(e.target.value)}
              placeholder="How to solve correctly..."
              rows={2}
              className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Key Lesson Learned (Optional)
            </label>
            <textarea
              value={lessonLearned}
              onChange={(e) => setLessonLearned(e.target.value)}
              placeholder="Rule to remember next time..."
              rows={2}
              className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save to Error Journal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
