import { describe, it, expect } from 'vitest';
import { calculateProgress, getChapterProgressValue } from '../src/lib/engine/progress';
import { Subject, Chapter, Revision, ErrorEntry } from '../src/types';

describe('Progress Engine', () => {
  it('correctly maps status values to numeric progress', () => {
    expect(getChapterProgressValue('Completed')).toBe(1.0);
    expect(getChapterProgressValue('In Progress')).toBe(0.5);
    expect(getChapterProgressValue('Not Started')).toBe(0.0);
  });

  it('calculates subject and overall progress percentages deterministically', () => {
    const subjects: Subject[] = [
      { id: 's1', user_id: 'u1', name: 'Physics', icon: null, created_at: '', updated_at: '' },
      { id: 's2', user_id: 'u1', name: 'Maths', icon: null, created_at: '', updated_at: '' },
    ];

    const chapters: Chapter[] = [
      // Physics: 1 completed, 1 in progress => (1.0 + 0.5) / 2 = 75%
      { id: 'c1', subject_id: 's1', name: 'P1', status: 'Completed', confidence: 4, completed_at: '', position: 1, created_at: '', updated_at: '' },
      { id: 'c2', subject_id: 's1', name: 'P2', status: 'In Progress', confidence: 3, completed_at: null, position: 2, created_at: '', updated_at: '' },
      // Maths: 1 not started, 1 completed => (0 + 1.0) / 2 = 50%
      { id: 'c3', subject_id: 's2', name: 'M1', status: 'Not Started', confidence: 3, completed_at: null, position: 1, created_at: '', updated_at: '' },
      { id: 'c4', subject_id: 's2', name: 'M2', status: 'Completed', confidence: 5, completed_at: '', position: 2, created_at: '', updated_at: '' },
    ];

    const revisions: Revision[] = [
      { id: 'r1', chapter_id: 'c1', scheduled_for: '2026-10-10', completed_at: '2026-10-10', interval_days: 1, difficulty: 'Medium', created_at: '' },
      { id: 'r2', chapter_id: 'c4', scheduled_for: '2026-10-10', completed_at: null, interval_days: 1, difficulty: null, created_at: '' },
    ];

    const errors: ErrorEntry[] = [
      { id: 'e1', chapter_id: 'c2', question: null, mistake_type: 'Concept', what_went_wrong: 'test', correct_method: null, lesson_learned: null, occurred_at: '', reviewed_at: null, created_at: '', updated_at: '' },
    ];

    const progress = calculateProgress(subjects, chapters, revisions, errors, '2026-10-10');

    expect(progress.totalChapters).toBe(4);
    expect(progress.completedChapters).toBe(2);
    expect(progress.inProgressChapters).toBe(1);
    expect(progress.notStartedChapters).toBe(1);
    // Overall: (1.0 + 0.5 + 0 + 1.0) / 4 = 2.5 / 4 = 62.5% -> 63%
    expect(progress.overallPercentage).toBe(63);

    expect(progress.subjectBreakdown[0].percentage).toBe(75);
    expect(progress.subjectBreakdown[1].percentage).toBe(50);

    expect(progress.revisionsTotal).toBe(2);
    expect(progress.revisionsCompleted).toBe(1);
    expect(progress.revisionsDue).toBe(1);
    expect(progress.errorsTotal).toBe(1);
    expect(progress.errorsUnreviewed).toBe(1);
    expect(progress.mistakeTypeBreakdown.Concept).toBe(1);
  });
});
