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
import {
  fetchStudyDataAction,
  createSubjectAction,
  deleteSubjectAction,
  createChapterAction,
  updateChapterStatusAction,
  updateChapterConfidenceAction,
  deleteChapterAction,
  createExamAction,
  markExamCompletedAction,
  deleteExamAction,
  completeRevisionAction,
  createErrorAction,
  markErrorReviewedAction,
  deleteErrorAction,
  resetToSampleDataAction,
} from '@/app/actions/study';

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
  isSyncing: boolean;

  // Actions
  setAvailableMinutes: (minutes: number) => void;
  addSubject: (name: string, icon?: string) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  addChapter: (subjectId: string, name: string) => Promise<void>;
  updateChapterStatus: (chapterId: string, status: ChapterStatus) => Promise<void>;
  updateChapterConfidence: (chapterId: string, confidence: number) => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;
  addExam: (name: string, examDate: string, subjectIds: string[], notes?: string) => Promise<void>;
  markExamCompleted: (examId: string) => Promise<void>;
  deleteExam: (examId: string) => Promise<void>;
  completeRevision: (revisionId: string, difficulty: RevisionDifficulty) => Promise<void>;
  addError: (data: {
    chapterId: string;
    mistakeType: MistakeType;
    whatWentWrong: string;
    question?: string;
    correctMethod?: string;
    lessonLearned?: string;
  }) => Promise<void>;
  markErrorReviewed: (errorId: string) => Promise<void>;
  deleteError: (errorId: string) => Promise<void>;
  completeTask: (taskId: string) => void;
  skipTask: (taskId: string) => void;
  resetToSampleData: () => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_KEY = 'study_os_store_v1';

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [availableMinutes, setAvailableMinutesState] = useState<number>(90);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [skippedTaskIds, setSkippedTaskIds] = useState<Set<string>>(new Set());

  const [todayStr, setTodayStr] = useState<string>('');

  // Initial Data Fetch from Neon Postgres (with fallback to localStorage/seed)
  useEffect(() => {
    const now = new Date();
    const currentTodayStr = formatCalendarDate(now);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayStr(currentTodayStr);

    async function loadData() {
      try {
        setIsSyncing(true);
        // Try fetching from Neon Postgres
        const neonData = await fetchStudyDataAction();
        if (neonData) {
          setSubjects(neonData.subjects);
          setChapters(neonData.chapters);
          setExams(neonData.exams);
          setRevisions(neonData.revisions);
          setErrors(neonData.errors);
          setIsLoaded(true);
          return;
        }
      } catch (err) {
        console.warn('Neon connection failed or offline, loading local store:', err);
      } finally {
        setIsSyncing(false);
      }

      // Fallback: localStorage or Seed Data
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
          const seed = getSeedData(now);
          setSubjects(seed.subjects);
          setChapters(seed.chapters);
          setExams(seed.exams);
          setRevisions(seed.revisions);
          setErrors(seed.errors);
        }
      } catch {
        const seed = getSeedData(now);
        setSubjects(seed.subjects);
        setChapters(seed.chapters);
        setExams(seed.exams);
        setRevisions(seed.revisions);
        setErrors(seed.errors);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  // Backup cache to localStorage on state change
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

  // SUBJECT ACTIONS
  const addSubject = async (name: string, icon?: string) => {
    const tempId = `sub-temp-${Date.now()}`;
    const optimisticSubject: Subject = {
      id: tempId,
      user_id: 'default-user',
      name: name.trim(),
      icon: icon || 'BookOpen',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSubjects((prev) => [...prev, optimisticSubject]);

    try {
      const created = await createSubjectAction(name, icon);
      setSubjects((prev) => prev.map((s) => (s.id === tempId ? created : s)));
    } catch (err) {
      console.error('Failed to save subject to Neon:', err);
    }
  };

  const deleteSubject = async (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setChapters((prev) => prev.filter((c) => c.subject_id !== subjectId));

    try {
      await deleteSubjectAction(subjectId);
    } catch (err) {
      console.error('Failed to delete subject from Neon:', err);
    }
  };

  // CHAPTER ACTIONS
  const addChapter = async (subjectId: string, name: string) => {
    const tempId = `chap-temp-${Date.now()}`;
    const optimisticChapter: Chapter = {
      id: tempId,
      subject_id: subjectId,
      name: name.trim(),
      status: 'Not Started',
      confidence: 3,
      completed_at: null,
      position: chapters.filter((c) => c.subject_id === subjectId).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setChapters((prev) => [...prev, optimisticChapter]);

    try {
      const created = await createChapterAction(subjectId, name);
      setChapters((prev) => prev.map((c) => (c.id === tempId ? created : c)));
    } catch (err) {
      console.error('Failed to save chapter to Neon:', err);
    }
  };

  const updateChapterStatus = async (chapterId: string, status: ChapterStatus) => {
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

    // Optimistically schedule revisions if completed
    if (status === 'Completed') {
      const tempRevs = generateInitialRevisions(chapterId, now).map((r, i) => ({
        ...r,
        id: `rev-${chapterId}-${i}-${Date.now()}`,
        created_at: now.toISOString(),
      }));
      setRevisions((prev) => [...prev, ...tempRevs]);
    }

    try {
      const result = await updateChapterStatusAction(chapterId, status);
      if (status === 'Completed' && result.newRevisions.length > 0) {
        setRevisions((prev) => [
          ...prev.filter((r) => r.chapter_id !== chapterId || !r.id.startsWith('rev-')),
          ...result.newRevisions,
        ]);
      }
    } catch (err) {
      console.error('Failed to update chapter status in Neon:', err);
    }
  };

  const updateChapterConfidence = async (chapterId: string, confidence: number) => {
    const clamped = Math.max(1, Math.min(5, confidence));
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, confidence: clamped } : c))
    );

    try {
      await updateChapterConfidenceAction(chapterId, clamped);
    } catch (err) {
      console.error('Failed to update confidence in Neon:', err);
    }
  };

  const deleteChapter = async (chapterId: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    setRevisions((prev) => prev.filter((r) => r.chapter_id !== chapterId));
    setErrors((prev) => prev.filter((e) => e.chapter_id !== chapterId));

    try {
      await deleteChapterAction(chapterId);
    } catch (err) {
      console.error('Failed to delete chapter from Neon:', err);
    }
  };

  // EXAM ACTIONS
  const addExam = async (name: string, examDate: string, subjectIds: string[], notes?: string) => {
    const tempId = `exam-temp-${Date.now()}`;
    const optimisticExam: Exam = {
      id: tempId,
      user_id: 'default-user',
      name: name.trim(),
      exam_date: examDate,
      status: 'Upcoming',
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subject_ids: subjectIds,
    };
    setExams((prev) => [...prev, optimisticExam]);

    try {
      const created = await createExamAction(name, examDate, subjectIds, notes);
      setExams((prev) => prev.map((e) => (e.id === tempId ? created : e)));
    } catch (err) {
      console.error('Failed to save exam to Neon:', err);
    }
  };

  const markExamCompleted = async (examId: string) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId ? { ...e, status: 'Completed', updated_at: new Date().toISOString() } : e
      )
    );

    try {
      await markExamCompletedAction(examId);
    } catch (err) {
      console.error('Failed to mark exam completed in Neon:', err);
    }
  };

  const deleteExam = async (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));

    try {
      await deleteExamAction(examId);
    } catch (err) {
      console.error('Failed to delete exam from Neon:', err);
    }
  };

  // REVISION ACTIONS
  const completeRevision = async (revisionId: string, difficulty: RevisionDifficulty) => {
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

    if (updatedTargetRev) {
      const nextInterval = calculateNextInterval((updatedTargetRev as Revision).interval_days, difficulty);
      const nextDate = addDays(now, nextInterval);
      const tempNextRev: Revision = {
        id: `rev-next-${Date.now()}`,
        chapter_id: (updatedTargetRev as Revision).chapter_id,
        scheduled_for: formatCalendarDate(nextDate),
        completed_at: null,
        interval_days: nextInterval,
        difficulty: null,
        created_at: now.toISOString(),
      };
      setRevisions((prev) => [...prev, tempNextRev]);
    }

    try {
      const { completedRevision, nextRevision } = await completeRevisionAction(revisionId, difficulty);
      setRevisions((prev) =>
        prev
          .map((r) => (r.id === revisionId ? completedRevision : r))
          .filter((r) => !r.id.startsWith('rev-next-'))
          .concat(nextRevision)
      );
    } catch (err) {
      console.error('Failed to complete revision in Neon:', err);
    }
  };

  // ERROR ACTIONS
  const addError = async (data: {
    chapterId: string;
    mistakeType: MistakeType;
    whatWentWrong: string;
    question?: string;
    correctMethod?: string;
    lessonLearned?: string;
  }) => {
    const tempId = `err-temp-${Date.now()}`;
    const optimisticError: ErrorEntry = {
      id: tempId,
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
    setErrors((prev) => [...prev, optimisticError]);

    try {
      const created = await createErrorAction(data);
      setErrors((prev) => prev.map((e) => (e.id === tempId ? created : e)));
    } catch (err) {
      console.error('Failed to save mistake to Neon:', err);
    }
  };

  const markErrorReviewed = async (errorId: string) => {
    setErrors((prev) =>
      prev.map((e) =>
        e.id === errorId ? { ...e, reviewed_at: new Date().toISOString() } : e
      )
    );

    try {
      await markErrorReviewedAction(errorId);
    } catch (err) {
      console.error('Failed to mark mistake reviewed in Neon:', err);
    }
  };

  const deleteError = async (errorId: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== errorId));

    try {
      await deleteErrorAction(errorId);
    } catch (err) {
      console.error('Failed to delete mistake from Neon:', err);
    }
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

  const resetToSampleData = async () => {
    try {
      setIsSyncing(true);
      const neonData = await resetToSampleDataAction();
      if (neonData) {
        setSubjects(neonData.subjects);
        setChapters(neonData.chapters);
        setExams(neonData.exams);
        setRevisions(neonData.revisions);
        setErrors(neonData.errors);
        setCompletedTaskIds(new Set());
        setSkippedTaskIds(new Set());
        setAvailableMinutesState(90);
      }
    } catch (err) {
      console.error('Failed to reset sample data in Neon:', err);
      // Fallback
      const seed = getSeedData(new Date());
      setSubjects(seed.subjects);
      setChapters(seed.chapters);
      setExams(seed.exams);
      setRevisions(seed.revisions);
      setErrors(seed.errors);
      setCompletedTaskIds(new Set());
      setSkippedTaskIds(new Set());
      setAvailableMinutesState(90);
    } finally {
      setIsSyncing(false);
    }
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
        isSyncing,
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
