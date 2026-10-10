'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { useStudyStore } from '@/lib/store/study-context';

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
}

export function AddChapterModal({ isOpen, onClose, defaultSubjectId }: AddChapterModalProps) {
  const { subjects, addChapter } = useStudyStore();
  const [subjectId, setSubjectId] = useState(defaultSubjectId || '');
  const [name, setName] = useState('');

  const currentSubjectId = subjectId || defaultSubjectId || (subjects.length > 0 ? subjects[0].id : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubjectId || !name.trim()) return;
    addChapter(currentSubjectId, name.trim());
    setName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Chapter / Topic"
      description="Add a syllabus chapter to track completion, revisions, and mistakes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Subject *
          </label>
          <select
            value={currentSubjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            required
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Chapter Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Thermodynamics, Optics, Organic Chemistry"
            required
            autoFocus
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Add Chapter
          </Button>
        </div>
      </form>
    </Modal>
  );
}
