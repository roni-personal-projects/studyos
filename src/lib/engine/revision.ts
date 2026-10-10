import { Revision, RevisionDifficulty } from '@/types';

export const INITIAL_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

/**
 * Formats a Date object to YYYY-MM-DD string preserving calendar date.
 */
export function formatCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date object.
 */
export function parseCalendarDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Adds days to a calendar date.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generates the initial spaced-repetition schedules upon chapter completion.
 * Default intervals: +1, +3, +7, +14, +30 days.
 */
export function generateInitialRevisions(
  chapterId: string,
  baseDate: Date = new Date()
): Omit<Revision, 'id' | 'created_at'>[] {
  return INITIAL_INTERVAL_DAYS.map((interval) => {
    const scheduledDate = addDays(baseDate, interval);
    return {
      chapter_id: chapterId,
      scheduled_for: formatCalendarDate(scheduledDate),
      completed_at: null,
      interval_days: interval,
      difficulty: null,
    };
  });
}

/**
 * Calculates the next interval based on user rating.
 * - Hard: Shorten next interval by ~50% (minimum 1 day)
 * - Medium: Progress along spaced curve or 1.5x
 * - Easy: Lengthen next interval by 2x
 */
export function calculateNextInterval(
  currentInterval: number,
  difficulty: RevisionDifficulty
): number {
  if (difficulty === 'Hard') {
    return Math.max(1, Math.round(currentInterval * 0.5));
  } else if (difficulty === 'Medium') {
    // Find next step in predefined sequence or multiply by 1.6
    const currentIndex = INITIAL_INTERVAL_DAYS.findIndex((i) => i >= currentInterval);
    if (currentIndex !== -1 && currentIndex < INITIAL_INTERVAL_DAYS.length - 1) {
      return INITIAL_INTERVAL_DAYS[currentIndex + 1];
    }
    return Math.max(1, Math.round(currentInterval * 1.6));
  } else {
    // Easy: jump further
    const currentIndex = INITIAL_INTERVAL_DAYS.findIndex((i) => i >= currentInterval);
    if (currentIndex !== -1 && currentIndex < INITIAL_INTERVAL_DAYS.length - 2) {
      return INITIAL_INTERVAL_DAYS[currentIndex + 2];
    }
    return Math.max(2, Math.round(currentInterval * 2.2));
  }
}

/**
 * Check if a revision is due on or before a given target date.
 */
export function isRevisionDue(revision: Revision, targetDateStr: string): boolean {
  if (revision.completed_at) return false;
  return revision.scheduled_for <= targetDateStr;
}
