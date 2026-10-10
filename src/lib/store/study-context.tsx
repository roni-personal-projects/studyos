'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Subject,
  Chapter,
  Exam,
  Revision,
  ErrorEntry,
  Task,
  ChapterStatus,
  RevisionDifficulty,
  MistakeType,
} from '@/types';
import { getSeedData } from './seed-data';
import {
  formatCalendarDate,
  generateInitialRevisions,
  calculateNextInterval,
  addDays,
} from '../engine/revision';
import { buildDailyPlan } from '../engine/planner';
import { calculateProgress, OverallProgress } from '../engine/progress';

interface StudyContextType {
  subjects: Subject[];
  chapters: Chapter[];
  exams: Exam[];
  revisions: Revision[];
  errors: ErrorEntry[];
  tasks: Task[];
  availableMinutes: number;
  todayStr: string;
  progress: OverallProgress;
  isLoaded: boolean;

  // Actions
  setAvailableMinutes: (minutes: number) => void;
  addSubject: (name: string, icon?: string) => void;
  deleteSubject: (subjectId: string) => void;
  addChapter: (subjectId: string, name: string) => void;
  updateChapterStatus: (chapterId: string, status: ChapterStatus) => void;
  updateChapterConfidence: (chapterId: string, confidence: number) => void;
  deleteChapter: (chapterId: string) => void;
  addExam: (name: string, examDate: string, subjectIds: string[], notes?: string) => void;
  markExamCompleted: (examId: string) => void;
  deleteExam: (examId: string) => void;
  completeRevision: (revisionId: string, difficulty: RevisionDifficulty) => void;
  addError: (data: {
    chapterId: string;
    mistakeType: MistakeType;
    whatWentWrong: string;
    question?: string;
    correctMethod?: string;
    lessonLearned?: string;
  }) => void;
  markErrorReviewed: (errorId: string) => void;
  deleteError: (errorId: string) => void;
  completeTask: (taskId: string) => void;
  skipTask: (taskId: string) => void;
  resetToSampleData: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_KEY = 'study_os_store_v1';

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [availableMinutes, setAvailableMinutesState] = useState<number>(90);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [skippedTaskIds, setSkippedTaskIds] = useState<Set<string>>(new Set());

  const [todayStr, setTodayStr] = useState<string>('');

  // Initialize from localStorage or Seed Data
  useEffect(() => {
    const now = new Date();
    const currentTodayStr = formatCalendarDate(now);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayStr(currentTodayStr);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSubjects(parsed.subjects || []);
        setChapters(parsed.chapters || []);
        setExams(parsed.exams || []);
        setRevisions(parsed.revisions || []);
        setErrors(parsed.errors || []);
        if (parsed.availableMinutes) {
          setAvailableMinutesState(parsed.availableMinutes);
        }
        if (parsed.completedTaskIds) {
          setCompletedTaskIds(new Set(parsed.completedTaskIds));
        }
      } else {
        const seed = getSeedData(new Date());
        setSubjects(seed.subjects);
        setChapters(seed.chapters);
        setExams(seed.exams);
        setRevisions(seed.revisions);
        setErrors(seed.errors);
      }
    } catch {
      const seed = getSeedData(new Date());
      setSubjects(seed.subjects);
      setChapters(seed.chapters);
      setExams(seed.exams);
      setRevisions(seed.revisions);
      setErrors(seed.errors);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const state = {
        subjects,
        chapters,
        exams,
        revisions,
        errors,
        availableMinutes,
        completedTaskIds: Array.from(completedTaskIds),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or private browsing
    }
  }, [subjects, chapters, exams, revisions, errors, availableMinutes, completedTaskIds, isLoaded]);

  // Generate dynamic daily plan
  const tasks: Task[] = useMemo(() => {
    if (!isLoaded) return [];

    const candidateTasks = buildDailyPlan({
      userId: 'default-user',
      todayDateStr: todayStr,
      availableMinutes,
      subjects,
      chapters,
      exams,
      revisions,
      errors,
    });

    return candidateTasks.map((t, idx) => {
      const taskId = `task-${t.chapterId || 'gen'}-${t.taskType}-${idx}`;
      let status: Task['status'] = 'Pending';
      if (completedTaskIds.has(taskId)) status = 'Completed';
      else if (skippedTaskIds.has(taskId)) status = 'Skipped';

      return {
        id: taskId,
        user_id: t.userId,
        daily_plan_id: null,
        chapter_id: t.chapterId,
        revision_id: t.revisionId,
        title: t.title,
        task_type: t.taskType,
        estimated_minutes: t.estimatedMinutes,
        priority_score: t.priorityScore,
        priority_reason: t.priorityReason,
        status,
        completed_at: completedTaskIds.has(taskId) ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subject_name: t.subjectName,
        chapter_name: t.chapterName,
      };
    });
  }, [
    isLoaded,
    todayStr,
    availableMinutes,
    subjects,
    chapters,
    exams,
    revisions,
    errors,
    completedTaskIds,
    skippedTaskIds,
  ]);

  // Overall Progress
  const progress = useMemo(() => {
    return calculateProgress(subjects, chapters, revisions, errors, todayStr);
  }, [subjects, chapters, revisions, errors, todayStr]);

  const setAvailableMinutes = (minutes: number) => {
    setAvailableMinutesState(Math.max(15, Math.min(720, minutes)));
  };

  const addSubject = (name: string, icon?: string) => {
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      user_id: 'default-user',
      name: name.trim(),
      icon: icon || 'BookOpen',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setChapters((prev) => prev.filter((c) => c.subject_id !== subjectId));
  };

  const addChapter = (subjectId: string, name: string) => {
    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      subject_id: subjectId,
      name: name.trim(),
      status: 'Not Started',
      confidence: 3,
      completed_at: null,
      position: chapters.filter((c) => c.subject_id === subjectId).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setChapters((prev) => [...prev, newChapter]);
  };

  const updateChapterStatus = (chapterId: string, status: ChapterStatus) => {
    const now = new Date();
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === chapterId) {
          const completedAt = status === 'Completed' ? now.toISOString() : null;
          return { ...c, status, completed_at: completedAt, updated_at: now.toISOString() };
        }
        return c;
      })
    );

    // If marked Completed, generate initial revision schedule (+1, +3, +7, +14, +30)
    if (status === 'Completed') {
      const newRevs = generateInitialRevisions(chapterId, now).map((r, i) => ({
        ...r,
        id: `rev-${chapterId}-${i}-${Date.now()}`,
        created_at: now.toISOString(),
      }));
      setRevisions((prev) => [...prev, ...newRevs]);
    }
  };

  const updateChapterConfidence = (chapterId: string, confidence: number) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, confidence: Math.max(1, Math.min(5, confidence)) } : c))
    );
  };

  const deleteChapter = (chapterId: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    setRevisions((prev) => prev.filter((r) => r.chapter_id !== chapterId));
    setErrors((prev) => prev.filter((e) => e.chapter_id !== chapterId));
  };

  const addExam = (name: string, examDate: string, subjectIds: string[], notes?: string) => {
    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      user_id: 'default-user',
      name: name.trim(),
      exam_date: examDate,
      status: 'Upcoming',
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subject_ids: subjectIds,
    };
    setExams((prev) => [...prev, newExam]);
  };

  const markExamCompleted = (examId: string) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId ? { ...e, status: 'Completed', updated_at: new Date().toISOString() } : e
      )
    );
  };

  const deleteExam = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
  };

  const completeRevision = (revisionId: string, difficulty: RevisionDifficulty) => {
    const now = new Date();
    let updatedTargetRev: Revision | null = null;

    setRevisions((prev) =>
      prev.map((r) => {
        if (r.id === revisionId) {
          updatedTargetRev = {
            ...r,
            completed_at: now.toISOString(),
            difficulty,
          };
          return updatedTargetRev;
        }
        return r;
      })
    );

    // Adaptive interval: create next revision step based on rating
    if (updatedTargetRev) {
      const nextInterval = calculateNextInterval((updatedTargetRev as Revision).interval_days, difficulty);
      const nextDate = addDays(now, nextInterval);
      const nextRev: Revision = {
        id: `rev-next-${Date.now()}`,
        chapter_id: (updatedTargetRev as Revision).chapter_id,
        scheduled_for: formatCalendarDate(nextDate),
        completed_at: null,
        interval_days: nextInterval,
        difficulty: null,
        created_at: now.toISOString(),
      };
      setRevisions((prev) => [...prev, nextRev]);
    }
  };

  const addError = (data: {
    chapterId: string;
    mistakeType: MistakeType;
    whatWentWrong: string;
    question?: string;
    correctMethod?: string;
    lessonLearned?: string;
  }) => {
    const newError: ErrorEntry = {
      id: `err-${Date.now()}`,
      chapter_id: data.chapterId,
      question: data.question || null,
      mistake_type: data.mistakeType,
      what_went_wrong: data.whatWentWrong.trim(),
      correct_method: data.correctMethod || null,
      lesson_learned: data.lessonLearned || null,
      occurred_at: new Date().toISOString(),
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setErrors((prev) => [...prev, newError]);
  };

  const markErrorReviewed = (errorId: string) => {
    setErrors((prev) =>
      prev.map((e) =>
        e.id === errorId ? { ...e, reviewed_at: new Date().toISOString() } : e
      )
    );
  };

  const deleteError = (errorId: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== errorId));
  };

  const completeTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
  };

  const skipTask = (taskId: string) => {
    setSkippedTaskIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
  };

  const resetToSampleData = () => {
    const seed = getSeedData(new Date());
    setSubjects(seed.subjects);
    setChapters(seed.chapters);
    setExams(seed.exams);
    setRevisions(seed.revisions);
    setErrors(seed.errors);
    setCompletedTaskIds(new Set());
    setSkippedTaskIds(new Set());
    setAvailableMinutesState(90);
  };

  return (
    <StudyContext.Provider
      value={{
        subjects,
        chapters,
        exams,
        revisions,
        errors,
        tasks,
        availableMinutes,
        todayStr,
        progress,
        isLoaded,
        setAvailableMinutes,
        addSubject,
        deleteSubject,
        addChapter,
        updateChapterStatus,
        updateChapterConfidence,
        deleteChapter,
        addExam,
        markExamCompleted,
        deleteExam,
        completeRevision,
        addError,
        markErrorReviewed,
        deleteError,
        completeTask,
        skipTask,
        resetToSampleData,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudyStore() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudyStore must be used within a StudyProvider');
  }
  return context;
}
