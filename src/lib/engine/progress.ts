import { Chapter, Subject, Revision, ErrorEntry, MistakeType } from '@/types';

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  percentage: number;
}

export interface OverallProgress {
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  notStartedChapters: number;
  overallPercentage: number;
  subjectBreakdown: SubjectProgress[];
  revisionsTotal: number;
  revisionsCompleted: number;
  revisionsDue: number;
  errorsTotal: number;
  errorsUnreviewed: number;
  mistakeTypeBreakdown: Record<MistakeType, number>;
}

export function getChapterProgressValue(status: Chapter['status']): number {
  switch (status) {
    case 'Completed':
      return 1.0;
    case 'In Progress':
      return 0.5;
    case 'Not Started':
    default:
      return 0.0;
  }
}

export function calculateProgress(
  subjects: Subject[],
  chapters: Chapter[],
  revisions: Revision[],
  errors: ErrorEntry[],
  todayStr: string
): OverallProgress {
  const chaptersBySubject = new Map<string, Chapter[]>();
  for (const c of chapters) {
    const list = chaptersBySubject.get(c.subject_id) || [];
    list.push(c);
    chaptersBySubject.set(c.subject_id, list);
  }

  let totalChapters = 0;
  let completedChapters = 0;
  let inProgressChapters = 0;
  let notStartedChapters = 0;
  let totalScoreSum = 0;

  const subjectBreakdown: SubjectProgress[] = subjects.map((subject) => {
    const chaps = chaptersBySubject.get(subject.id) || [];
    const count = chaps.length;
    let completed = 0;
    let inProg = 0;
    let sumScore = 0;

    for (const c of chaps) {
      if (c.status === 'Completed') completed++;
      else if (c.status === 'In Progress') inProg++;
      sumScore += getChapterProgressValue(c.status);
    }

    const percentage = count > 0 ? Math.round((sumScore / count) * 100) : 0;

    totalChapters += count;
    completedChapters += completed;
    inProgressChapters += inProg;
    notStartedChapters += count - (completed + inProg);
    totalScoreSum += sumScore;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalChapters: count,
      completedChapters: completed,
      inProgressChapters: inProg,
      percentage,
    };
  });

  const overallPercentage =
    totalChapters > 0 ? Math.round((totalScoreSum / totalChapters) * 100) : 0;

  let revisionsCompleted = 0;
  let revisionsDue = 0;
  for (const r of revisions) {
    if (r.completed_at) {
      revisionsCompleted++;
    } else if (r.scheduled_for <= todayStr) {
      revisionsDue++;
    }
  }

  let errorsUnreviewed = 0;
  const mistakeTypeBreakdown: Record<MistakeType, number> = {
    Concept: 0,
    Formula: 0,
    Calculation: 0,
    Careless: 0,
    'Misread Question': 0,
    'Time Management': 0,
    Guess: 0,
    Other: 0,
  };

  for (const e of errors) {
    if (!e.reviewed_at) errorsUnreviewed++;
    if (mistakeTypeBreakdown[e.mistake_type] !== undefined) {
      mistakeTypeBreakdown[e.mistake_type]++;
    } else {
      mistakeTypeBreakdown.Other++;
    }
  }

  return {
    totalChapters,
    completedChapters,
    inProgressChapters,
    notStartedChapters,
    overallPercentage,
    subjectBreakdown,
    revisionsTotal: revisions.length,
    revisionsCompleted,
    revisionsDue,
    errorsTotal: errors.length,
    errorsUnreviewed,
    mistakeTypeBreakdown,
  };
}
