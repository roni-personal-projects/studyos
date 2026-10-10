import { describe, it, expect } from 'vitest';
import {
  calculateExamUrgency,
  getDaysUntilExam,
  calculateWeaknessScore,
  generateCandidateTasks,
  buildDailyPlan,
  PlannerInput,
} from '../src/lib/engine/planner';
import { Subject, Chapter, Exam, Revision, ErrorEntry } from '../src/types';

describe('Planner & Multi-Exam Engine', () => {
  it('calculates non-linear exam urgency prioritizing near exams disproportionately', () => {
    expect(calculateExamUrgency(0)).toBe(1000);
    const tomorrow = calculateExamUrgency(1);
    const in2Days = calculateExamUrgency(2);
    const in7Days = calculateExamUrgency(7);
    const in30Days = calculateExamUrgency(30);

    expect(tomorrow).toBeGreaterThan(in2Days);
    expect(in2Days).toBeGreaterThan(in7Days);
    expect(in7Days).toBeGreaterThan(in30Days);

    // Verify non-linear drop
    expect(tomorrow).toBe(600);
    expect(in2Days).toBe(380);
    expect(in7Days).toBe(120);
    expect(in30Days).toBe(25);
  });

  it('calculates days until exam accurately', () => {
    expect(getDaysUntilExam('2026-10-10', '2026-10-11')).toBe(1);
    expect(getDaysUntilExam('2026-10-10', '2026-10-12')).toBe(2);
    expect(getDaysUntilExam('2026-10-10', '2026-10-20')).toBe(10);
  });

  it('weights low confidence higher in weakness score', () => {
    expect(calculateWeaknessScore(1)).toBe(90);
    expect(calculateWeaknessScore(2)).toBe(60);
    expect(calculateWeaknessScore(3)).toBe(30);
    expect(calculateWeaknessScore(5)).toBe(0);
  });

  it('prioritizes tomorrow exam over later exams (e.g. Science tomorrow vs English in 10 days)', () => {
    const subjects: Subject[] = [
      { id: 'sub-science', user_id: 'u1', name: 'Science', icon: null, created_at: '', updated_at: '' },
      { id: 'sub-maths', user_id: 'u1', name: 'Maths', icon: null, created_at: '', updated_at: '' },
      { id: 'sub-english', user_id: 'u1', name: 'English', icon: null, created_at: '', updated_at: '' },
    ];

    const chapters: Chapter[] = [
      { id: 'c-sci-1', subject_id: 'sub-science', name: 'Carbon Compounds', status: 'In Progress', confidence: 2, completed_at: null, position: 1, created_at: '', updated_at: '' },
      { id: 'c-math-1', subject_id: 'sub-maths', name: 'Quadratic Equations', status: 'In Progress', confidence: 3, completed_at: null, position: 1, created_at: '', updated_at: '' },
      { id: 'c-eng-1', subject_id: 'sub-english', name: 'Literature', status: 'In Progress', confidence: 4, completed_at: null, position: 1, created_at: '', updated_at: '' },
    ];

    const exams: Exam[] = [
      { id: 'ex-sci', user_id: 'u1', name: 'Science Board', exam_date: '2026-10-11', status: 'Upcoming', notes: null, created_at: '', updated_at: '', subject_ids: ['sub-science'] },
      { id: 'ex-math', user_id: 'u1', name: 'Maths Board', exam_date: '2026-10-12', status: 'Upcoming', notes: null, created_at: '', updated_at: '', subject_ids: ['sub-maths'] },
      { id: 'ex-eng', user_id: 'u1', name: 'English Board', exam_date: '2026-10-20', status: 'Upcoming', notes: null, created_at: '', updated_at: '', subject_ids: ['sub-english'] },
    ];

    const input: PlannerInput = {
      userId: 'u1',
      todayDateStr: '2026-10-10',
      availableMinutes: 90,
      subjects,
      chapters,
      exams,
      revisions: [],
      errors: [],
    };

    const candidates = generateCandidateTasks(input);
    expect(candidates.length).toBeGreaterThan(0);
    // Highest ranked candidate should be Science
    expect(candidates[0].subjectName).toBe('Science');
    expect(candidates[0].priorityReason).toContain('Science Board in 1d');

    // Second ranked should be Maths
    expect(candidates[1].subjectName).toBe('Maths');
    expect(candidates[1].priorityReason).toContain('Maths Board in 2d');
  });

  it('strictly respects available study time and does not exceed capacity', () => {
    const subjects: Subject[] = [
      { id: 'sub-1', user_id: 'u1', name: 'Physics', icon: null, created_at: '', updated_at: '' },
    ];

    const chapters: Chapter[] = [
      { id: 'c-1', subject_id: 'sub-1', name: 'Optics', status: 'In Progress', confidence: 2, completed_at: null, position: 1, created_at: '', updated_at: '' },
      { id: 'c-2', subject_id: 'sub-1', name: 'Mechanics', status: 'In Progress', confidence: 3, completed_at: null, position: 2, created_at: '', updated_at: '' },
      { id: 'c-3', subject_id: 'sub-1', name: 'Thermodynamics', status: 'Not Started', confidence: 3, completed_at: null, position: 3, created_at: '', updated_at: '' },
      { id: 'c-4', subject_id: 'sub-1', name: 'Waves', status: 'Not Started', confidence: 3, completed_at: null, position: 4, created_at: '', updated_at: '' },
      { id: 'c-5', subject_id: 'sub-1', name: 'Electromagnetism', status: 'Not Started', confidence: 3, completed_at: null, position: 5, created_at: '', updated_at: '' },
    ];

    const input: PlannerInput = {
      userId: 'u1',
      todayDateStr: '2026-10-10',
      availableMinutes: 90,
      subjects,
      chapters,
      exams: [],
      revisions: [],
      errors: [],
    };

    const plan = buildDailyPlan(input);
    const totalMinutes = plan.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    expect(totalMinutes).toBeLessThanOrEqual(90);
    expect(totalMinutes).toBeGreaterThan(0);
  });

  it('allocates work for high error chapters and overdue revisions', () => {
    const subjects: Subject[] = [
      { id: 'sub-chem', user_id: 'u1', name: 'Chemistry', icon: null, created_at: '', updated_at: '' },
    ];
    const chapters: Chapter[] = [
      { id: 'c-chem-1', subject_id: 'sub-chem', name: 'Acids and Bases', status: 'Completed', confidence: 2, completed_at: '2026-10-01', position: 1, created_at: '', updated_at: '' },
    ];
    const revisions: Revision[] = [
      { id: 'rev-1', chapter_id: 'c-chem-1', scheduled_for: '2026-10-10', completed_at: null, interval_days: 7, difficulty: null, created_at: '' },
    ];
    const errors: ErrorEntry[] = [
      { id: 'err-1', chapter_id: 'c-chem-1', question: 'pH calculation', mistake_type: 'Calculation', what_went_wrong: 'Missed log power', correct_method: '-log[H+]', lesson_learned: 'Watch base 10', occurred_at: '2026-10-09', reviewed_at: null, created_at: '', updated_at: '' },
      { id: 'err-2', chapter_id: 'c-chem-1', question: 'Titration endpoint', mistake_type: 'Concept', what_went_wrong: 'Wrong indicator', correct_method: 'Phenolphthalein', lesson_learned: 'Check pKa', occurred_at: '2026-10-09', reviewed_at: null, created_at: '', updated_at: '' },
    ];

    const input: PlannerInput = {
      userId: 'u1',
      todayDateStr: '2026-10-10',
      availableMinutes: 60,
      subjects,
      chapters,
      exams: [],
      revisions,
      errors,
    };

    const plan = buildDailyPlan(input);
    expect(plan.length).toBeGreaterThanOrEqual(1);
    const hasRevisionOrError = plan.some((t) => t.taskType === 'Revision' || t.taskType === 'Error Review');
    expect(hasRevisionOrError).toBe(true);
  });
});
