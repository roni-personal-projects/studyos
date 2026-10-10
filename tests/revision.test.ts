import { describe, it, expect } from 'vitest';
import {
  generateInitialRevisions,
  calculateNextInterval,
  formatCalendarDate,
  parseCalendarDate,
  addDays,
  isRevisionDue,
} from '../src/lib/engine/revision';

describe('Revision Engine', () => {
  it('generates 5 spaced-repetition revisions (+1, +3, +7, +14, +30 days)', () => {
    const baseDate = new Date(2026, 9, 10); // Oct 10, 2026
    const revisions = generateInitialRevisions('chap-1', baseDate);

    expect(revisions).toHaveLength(5);
    expect(revisions.map((r) => r.interval_days)).toEqual([1, 3, 7, 14, 30]);
    expect(revisions[0].scheduled_for).toBe('2026-10-11');
    expect(revisions[1].scheduled_for).toBe('2026-10-13');
    expect(revisions[2].scheduled_for).toBe('2026-10-17');
    expect(revisions[3].scheduled_for).toBe('2026-10-24');
    expect(revisions[4].scheduled_for).toBe('2026-11-09');
  });

  it('shortens next interval on Hard rating', () => {
    expect(calculateNextInterval(7, 'Hard')).toBe(4);
    expect(calculateNextInterval(14, 'Hard')).toBe(7);
    expect(calculateNextInterval(1, 'Hard')).toBe(1); // minimum 1 day
  });

  it('advances to next interval on Medium rating', () => {
    expect(calculateNextInterval(1, 'Medium')).toBe(3);
    expect(calculateNextInterval(3, 'Medium')).toBe(7);
    expect(calculateNextInterval(7, 'Medium')).toBe(14);
    expect(calculateNextInterval(14, 'Medium')).toBe(30);
  });

  it('expands interval on Easy rating', () => {
    expect(calculateNextInterval(1, 'Easy')).toBe(7);
    expect(calculateNextInterval(3, 'Easy')).toBe(14);
    expect(calculateNextInterval(7, 'Easy')).toBe(30);
  });

  it('handles calendar date round-tripping without timezone shifting', () => {
    const date = parseCalendarDate('2026-08-15');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7); // 0-indexed August
    expect(date.getDate()).toBe(15);
    expect(formatCalendarDate(date)).toBe('2026-08-15');

    const nextWeek = addDays(date, 7);
    expect(formatCalendarDate(nextWeek)).toBe('2026-08-22');
  });

  it('correctly evaluates when revisions are due', () => {
    const rev = {
      id: 'r1',
      chapter_id: 'c1',
      scheduled_for: '2026-10-10',
      completed_at: null,
      interval_days: 1,
      difficulty: null,
      created_at: '2026-10-09',
    };

    expect(isRevisionDue(rev, '2026-10-10')).toBe(true);
    expect(isRevisionDue(rev, '2026-10-11')).toBe(true);
    expect(isRevisionDue(rev, '2026-10-09')).toBe(false);

    const completedRev = { ...rev, completed_at: '2026-10-10T10:00:00Z' };
    expect(isRevisionDue(completedRev, '2026-10-10')).toBe(false);
  });
});
