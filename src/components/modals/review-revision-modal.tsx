'use client';

import React from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { useStudyStore } from '@/lib/store/study-context';
import { RevisionDifficulty } from '@/types';
import { Flame, Check, Zap } from 'lucide-react';

interface ReviewRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisionId: string;
  chapterName: string;
  intervalDays: number;
}

export function ReviewRevisionModal({
  isOpen,
  onClose,
  revisionId,
  chapterName,
  intervalDays,
}: ReviewRevisionModalProps) {
  const { completeRevision } = useStudyStore();

  const handleSelectDifficulty = (difficulty: RevisionDifficulty) => {
    completeRevision(revisionId, difficulty);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Spaced Revision"
      description={`Rate how well you recalled "${chapterName}" (${intervalDays}-day interval).`}
    >
      <div className="space-y-4">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Your feedback automatically adapts the spaced repetition curve for this chapter:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSelectDifficulty('Hard')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors text-center group"
          >
            <div className="h-9 w-9 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2 group-hover:scale-110 transition-transform">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">Hard</span>
            <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
              Shorten interval to review again sooner
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDifficulty('Medium')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center group"
          >
            <div className="h-9 w-9 rounded-full bg-zinc-200/80 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-2 group-hover:scale-110 transition-transform">
              <Check className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Medium</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Solid recall. Continue normal spaced intervals
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDifficulty('Easy')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors text-center group"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Easy</span>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
              Effortless mastery. Lengthen next interval
            </span>
          </button>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
