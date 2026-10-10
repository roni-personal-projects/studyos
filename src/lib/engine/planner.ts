import {
  Subject,
  Chapter,
  Exam,
  Revision,
  ErrorEntry,
  TaskType,
} from '@/types';
import { parseCalendarDate } from './revision';

export interface PlannerInput {
  userId: string;
  todayDateStr: string; // YYYY-MM-DD
  availableMinutes: number;
  subjects: Subject[];
  chapters: Chapter[];
  exams: Exam[];
  revisions: Revision[];
  errors: ErrorEntry[];
}

export interface CandidateTask {
  id?: string;
  userId: string;
  chapterId: string | null;
  revisionId: string | null;
  title: string;
  taskType: TaskType;
  estimatedMinutes: number;
  priorityScore: number;
  priorityReason: string;
  subjectName: string;
  chapterName?: string;
}

/**
 * Calculates days remaining until an exam date from today.
 */
export function getDaysUntilExam(todayStr: string, examDateStr: string): number {
  const today = parseCalendarDate(todayStr);
  const examDate = parseCalendarDate(examDateStr);
  const diffTime = examDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Non-linear exam urgency scoring.
 * Closer exams receive exponentially higher weight.
 */
export function calculateExamUrgency(daysRemaining: number): number {
  if (daysRemaining <= 0) return 1000; // Today or overdue
  if (daysRemaining === 1) return 600; // Tomorrow!
  if (daysRemaining === 2) return 380; // In 2 days
  if (daysRemaining === 3) return 260; // In 3 days
  if (daysRemaining <= 5) return 180;
  if (daysRemaining <= 7) return 120;
  if (daysRemaining <= 14) return 60;
  if (daysRemaining <= 30) return 25;
  return 10;
}

/**
 * Weakness score based on confidence level (1-5).
 */
export function calculateWeaknessScore(confidence: number): number {
  switch (confidence) {
    case 1:
      return 90;
    case 2:
      return 60;
    case 3:
      return 30;
    case 4:
      return 10;
    case 5:
    default:
      return 0;
  }
}

/**
 * Deterministic candidate task generator and ranker.
 */
export function generateCandidateTasks(input: PlannerInput): CandidateTask[] {
  const {
    userId,
    todayDateStr,
    subjects,
    chapters,
    exams,
    revisions,
    errors,
  } = input;

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const chapterMap = new Map(chapters.map((c) => [c.id, c]));

  // Active upcoming exams
  const activeExams = exams.filter((e) => e.status === 'Upcoming');

  // Map each subject to its nearest upcoming exam urgency
  const subjectExamUrgency = new Map<string, { urgency: number; days: number; examName: string }>();
  for (const exam of activeExams) {
    const days = getDaysUntilExam(todayDateStr, exam.exam_date);
    if (days < 0) continue; // exam has passed
    const urgency = calculateExamUrgency(days);

    const linkedSubjectIds = exam.subject_ids || [];
    for (const subId of linkedSubjectIds) {
      const existing = subjectExamUrgency.get(subId);
      if (!existing || urgency > existing.urgency) {
        subjectExamUrgency.set(subId, { urgency, days, examName: exam.name });
      }
    }
  }

  // Count unreviewed errors by chapter
  const unreviewedErrorsByChapter = new Map<string, number>();
  for (const err of errors) {
    if (!err.reviewed_at) {
      const current = unreviewedErrorsByChapter.get(err.chapter_id) || 0;
      unreviewedErrorsByChapter.set(err.chapter_id, current + 1);
    }
  }

  const candidates: CandidateTask[] = [];

  // 1. Revision tasks due
  for (const rev of revisions) {
    if (rev.completed_at) continue;
    if (rev.scheduled_for > todayDateStr) continue; // Not due yet

    const chapter = chapterMap.get(rev.chapter_id);
    if (!chapter) continue;
    const subject = subjectMap.get(chapter.subject_id);
    const subName = subject?.name || 'General';

    const examInfo = subjectExamUrgency.get(chapter.subject_id);
    const examBonus = examInfo ? examInfo.urgency : 0;
    const isOverdue = rev.scheduled_for < todayDateStr;
    const baseRevUrgency = isOverdue ? 180 : 140;
    const weakness = calculateWeaknessScore(chapter.confidence);

    const score = baseRevUrgency + examBonus + weakness;
    const reasonParts: string[] = [];
    if (examInfo) {
      reasonParts.push(`${examInfo.examName} in ${examInfo.days}d`);
    }
    reasonParts.push(isOverdue ? 'Overdue revision' : 'Revision due today');
    if (chapter.confidence <= 2) {
      reasonParts.push(`Low confidence (${chapter.confidence}/5)`);
    }

    candidates.push({
      userId,
      chapterId: chapter.id,
      revisionId: rev.id,
      title: `Revise: ${chapter.name}`,
      taskType: 'Revision',
      estimatedMinutes: 25,
      priorityScore: score,
      priorityReason: reasonParts.join(' · '),
      subjectName: subName,
      chapterName: chapter.name,
    });
  }

  // 2. Error review tasks (for chapters with 2+ unreviewed errors or upcoming exams)
  for (const [chapId, errCount] of unreviewedErrorsByChapter.entries()) {
    const chapter = chapterMap.get(chapId);
    if (!chapter) continue;
    const subject = subjectMap.get(chapter.subject_id);
    const subName = subject?.name || 'General';
    const examInfo = subjectExamUrgency.get(chapter.subject_id);

    // Prioritize if exam is approaching or high error count
    const examBonus = examInfo ? examInfo.urgency * 1.1 : 0;
    const errorBonus = Math.min(100, errCount * 20);
    const score = 100 + examBonus + errorBonus;

    const reasonParts: string[] = [];
    if (examInfo) {
      reasonParts.push(`${examInfo.examName} in ${examInfo.days}d`);
    }
    reasonParts.push(`${errCount} unresolved mistake${errCount > 1 ? 's' : ''}`);

    candidates.push({
      userId,
      chapterId: chapter.id,
      revisionId: null,
      title: `Review Mistakes: ${chapter.name}`,
      taskType: 'Error Review',
      estimatedMinutes: 20,
      priorityScore: score,
      priorityReason: reasonParts.join(' · '),
      subjectName: subName,
      chapterName: chapter.name,
    });
  }

  // 3. Syllabus progress / Exam prep tasks for incomplete chapters
  for (const chapter of chapters) {
    if (chapter.status === 'Completed') continue;

    const subject = subjectMap.get(chapter.subject_id);
    const subName = subject?.name || 'General';
    const examInfo = subjectExamUrgency.get(chapter.subject_id);

    let baseScore = chapter.status === 'In Progress' ? 50 : 30;
    let taskType: TaskType = 'New Chapter';
    const reasonParts: string[] = [];

    if (examInfo) {
      baseScore += examInfo.urgency;
      taskType = 'Exam Prep';
      reasonParts.push(`${examInfo.examName} in ${examInfo.days}d`);
    } else {
      reasonParts.push(chapter.status === 'In Progress' ? 'Continue chapter' : 'Start chapter');
    }

    const weakness = calculateWeaknessScore(chapter.confidence);
    baseScore += weakness;
    if (chapter.confidence <= 2) {
      reasonParts.push(`Confidence: ${chapter.confidence}/5`);
    }

    candidates.push({
      userId,
      chapterId: chapter.id,
      revisionId: null,
      title: `${taskType === 'Exam Prep' ? 'Prep' : 'Study'}: ${chapter.name}`,
      taskType,
      estimatedMinutes: 30,
      priorityScore: baseScore,
      priorityReason: reasonParts.join(' · '),
      subjectName: subName,
      chapterName: chapter.name,
    });
  }

  // Sort candidate tasks deterministically by priority score descending
  candidates.sort((a, b) => b.priorityScore - a.priorityScore);

  return candidates;
}

/**
 * Capacity-based plan allocation.
 * Strictly respects available study minutes.
 */
export function allocateDailyPlan(
  candidates: CandidateTask[],
  availableMinutes: number
): CandidateTask[] {
  if (availableMinutes <= 0) {
    // If 0 minutes available, return top priority task as a focus highlight or empty
    return [];
  }

  const selectedTasks: CandidateTask[] = [];
  let currentMinutes = 0;

  for (const task of candidates) {
    // Check if adding this task fits within remaining capacity
    if (currentMinutes + task.estimatedMinutes <= availableMinutes) {
      selectedTasks.push(task);
      currentMinutes += task.estimatedMinutes;
    } else {
      // If we still have at least 15 minutes left, adapt the duration if helpful
      const remainingMinutes = availableMinutes - currentMinutes;
      if (remainingMinutes >= 15 && selectedTasks.length < 5) {
        selectedTasks.push({
          ...task,
          estimatedMinutes: remainingMinutes,
          priorityReason: `${task.priorityReason} (time adjusted to fit)`,
        });
        currentMinutes += remainingMinutes;
        break;
      }
    }

    if (currentMinutes >= availableMinutes) {
      break;
    }
  }

  // If no task fit because availableMinutes < task.estimatedMinutes,
  // allow the #1 priority task with scaled minutes so user has work
  if (selectedTasks.length === 0 && candidates.length > 0 && availableMinutes > 0) {
    selectedTasks.push({
      ...candidates[0],
      estimatedMinutes: availableMinutes,
    });
  }

  return selectedTasks;
}

/**
 * Main planning function: returns prioritized tasks up to capacity.
 */
export function buildDailyPlan(input: PlannerInput): CandidateTask[] {
  const candidates = generateCandidateTasks(input);
  return allocateDailyPlan(candidates, input.availableMinutes);
}
