import {
  Subject,
  Chapter,
  Exam,
  Revision,
  ErrorEntry,
  TaskType,
} from '@/types';
import { parseCalendarDate } from './revision';
import { getSubjectChecklist } from './checklists';

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
  checkpointId?: string | null;
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
 * Checkpoint-driven, exam-aware, and cognitive load balanced.
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

  // Map each specific chapter (and fallback to subject) to its nearest upcoming exam urgency
  const chapterExamUrgency = new Map<string, { urgency: number; days: number; examName: string }>();
  const subjectExamUrgency = new Map<string, { urgency: number; days: number; examName: string }>();

  for (const exam of activeExams) {
    const days = getDaysUntilExam(todayDateStr, exam.exam_date);
    if (days < 0) continue; // exam has passed
    const urgency = calculateExamUrgency(days);

    // Track subject-level urgency
    for (const subId of exam.subject_ids || []) {
      const existing = subjectExamUrgency.get(subId);
      if (!existing || urgency > existing.urgency) {
        subjectExamUrgency.set(subId, { urgency, days, examName: exam.name });
      }
    }

    // If exam specifies chapters explicitly, prioritize those exact chapters
    if (exam.chapter_ids && exam.chapter_ids.length > 0) {
      for (const chapId of exam.chapter_ids) {
        const existing = chapterExamUrgency.get(chapId);
        if (!existing || urgency > existing.urgency) {
          chapterExamUrgency.set(chapId, { urgency, days, examName: exam.name });
        }
      }
    } else {
      // Fallback: if no chapters specified, all chapters of covered subjects are considered
      for (const subId of exam.subject_ids || []) {
        for (const chap of chapters.filter((c) => c.subject_id === subId)) {
          const existing = chapterExamUrgency.get(chap.id);
          if (!existing || urgency > existing.urgency) {
            chapterExamUrgency.set(chap.id, { urgency, days, examName: exam.name });
          }
        }
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

  // 1. Spaced Repetition tasks due
  for (const rev of revisions) {
    if (rev.completed_at) continue;
    if (rev.scheduled_for > todayDateStr) continue; // Not due yet

    const chapter = chapterMap.get(rev.chapter_id);
    if (!chapter) continue;
    const subject = subjectMap.get(chapter.subject_id);
    const subName = subject?.name || 'General';

    const examInfo = chapterExamUrgency.get(chapter.id) || subjectExamUrgency.get(chapter.subject_id);
    const examBonus = examInfo ? examInfo.urgency * 1.1 : 0;
    const isOverdue = rev.scheduled_for < todayDateStr;
    const baseRevUrgency = isOverdue ? 190 : 150;
    const weakness = calculateWeaknessScore(chapter.confidence);

    const score = baseRevUrgency + examBonus + weakness;
    const reasonParts: string[] = [];
    if (examInfo) {
      reasonParts.push(`${examInfo.examName} in ${examInfo.days}d`);
    }
    reasonParts.push(isOverdue ? 'Overdue retrieval practice' : 'Spaced revision due today');
    if (chapter.confidence <= 2) {
      reasonParts.push(`Low confidence (${chapter.confidence}/5)`);
    }

    candidates.push({
      id: `task-rev-${rev.id}`,
      userId,
      chapterId: chapter.id,
      revisionId: rev.id,
      title: `Active Recall Revision: ${chapter.name}`,
      taskType: 'Revision',
      estimatedMinutes: 25,
      priorityScore: score,
      priorityReason: reasonParts.join(' · '),
      subjectName: subName,
      chapterName: chapter.name,
    });
  }

  // 2. Error review tasks (for chapters with unreviewed errors or upcoming exams)
  for (const [chapId, errCount] of unreviewedErrorsByChapter.entries()) {
    const chapter = chapterMap.get(chapId);
    if (!chapter) continue;
    const subject = subjectMap.get(chapter.subject_id);
    const subName = subject?.name || 'General';
    const examInfo = chapterExamUrgency.get(chapter.id) || subjectExamUrgency.get(chapter.subject_id);

    const examBonus = examInfo ? examInfo.urgency * 1.15 : 0;
    const errorBonus = Math.min(120, errCount * 25);
    const score = 110 + examBonus + errorBonus;

    const reasonParts: string[] = [];
    if (examInfo) {
      reasonParts.push(`${examInfo.examName} in ${examInfo.days}d`);
    }
    reasonParts.push(`${errCount} logged mistake${errCount > 1 ? 's' : ''} to repair`);

    candidates.push({
      id: `task-err-${chapId}`,
      userId,
      chapterId: chapter.id,
      revisionId: null,
      title: `Error Journal Review: ${chapter.name}`,
      taskType: 'Error Review',
      estimatedMinutes: 20,
      priorityScore: score,
      priorityReason: reasonParts.join(' · '),
      subjectName: subName,
      chapterName: chapter.name,
    });
  }

  // 3. Syllabus progress / Checkpoint-driven tasks for incomplete chapters
  for (const chapter of chapters) {
    if (chapter.status === 'Completed') continue;

    const subject = subjectMap.get(chapter.subject_id);
    const subName = subject?.name || 'General';
    const examInfo = chapterExamUrgency.get(chapter.id);

    // Get subject-specific completion checklist
    const checklist = getSubjectChecklist(subName, chapter.name);
    const completedSet = new Set(chapter.checklist_progress || []);

    // Find the next incomplete checkpoint
    const nextCheckpoint = checklist.items.find((item) => !completedSet.has(item.id)) || checklist.items[0];

    let baseScore = chapter.status === 'In Progress' ? 60 : 35;
    let taskType: TaskType = examInfo ? 'Exam Prep' : 'New Chapter';
    const reasonParts: string[] = [];

    if (examInfo) {
      baseScore += examInfo.urgency * 1.25; // High urgency boost for chapters on upcoming exam
      reasonParts.push(`In ${examInfo.examName} (${examInfo.days}d)`);
    }

    if (chapter.status === 'In Progress') {
      baseScore += 25; // Prefer finishing started chapters
      reasonParts.push(`Step ${checklist.items.indexOf(nextCheckpoint) + 1}/${checklist.items.length}`);
    } else {
      reasonParts.push(`Start Step 1/${checklist.items.length}`);
    }

    const weakness = calculateWeaknessScore(chapter.confidence);
    baseScore += weakness;
    if (chapter.confidence <= 2) {
      reasonParts.push(`Confidence: ${chapter.confidence}/5`);
    }

    const checkpointTitle = `${nextCheckpoint.label}`;

    candidates.push({
      id: `task-chk-${chapter.id}-${nextCheckpoint.id}`,
      userId,
      chapterId: chapter.id,
      checkpointId: nextCheckpoint.id,
      revisionId: null,
      title: `${checkpointTitle} · ${chapter.name}`,
      taskType,
      estimatedMinutes: nextCheckpoint.estimatedMinutes || 25,
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
 * Strictly respects available study minutes and interleaves subjects when viable.
 */
export function allocateDailyPlan(
  candidates: CandidateTask[],
  availableMinutes: number
): CandidateTask[] {
  if (availableMinutes <= 0) {
    return [];
  }

  const selectedTasks: CandidateTask[] = [];
  let currentMinutes = 0;

  for (const task of candidates) {
    if (currentMinutes + task.estimatedMinutes <= availableMinutes) {
      selectedTasks.push(task);
      currentMinutes += task.estimatedMinutes;
    } else {
      const remainingMinutes = availableMinutes - currentMinutes;
      if (remainingMinutes >= 15 && selectedTasks.length < 5) {
        selectedTasks.push({
          ...task,
          estimatedMinutes: remainingMinutes,
          priorityReason: `${task.priorityReason} (duration adjusted)`,
        });
        currentMinutes += remainingMinutes;
        break;
      }
    }

    if (currentMinutes >= availableMinutes) {
      break;
    }
  }

  if (selectedTasks.length === 0 && candidates.length > 0 && availableMinutes > 0) {
    selectedTasks.push({
      ...candidates[0],
      estimatedMinutes: availableMinutes,
    });
  }

  return selectedTasks;
}

/**
 * Main planning function: returns prioritized checkpoint tasks up to capacity.
 */
export function buildDailyPlan(input: PlannerInput): CandidateTask[] {
  const candidates = generateCandidateTasks(input);
  return allocateDailyPlan(candidates, input.availableMinutes);
}
