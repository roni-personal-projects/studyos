export type ChapterStatus = 'Not Started' | 'In Progress' | 'Completed';

export type ExamStatus = 'Upcoming' | 'Completed';

export type MistakeType =
  | 'Concept'
  | 'Formula'
  | 'Calculation'
  | 'Careless'
  | 'Misread Question'
  | 'Time Management'
  | 'Guess'
  | 'Other';

export type RevisionDifficulty = 'Hard' | 'Medium' | 'Easy';

export type TaskType =
  | 'Revision'
  | 'Exam Prep'
  | 'New Chapter'
  | 'Error Review'
  | 'General Study';

export type TaskStatus = 'Pending' | 'Completed' | 'Skipped';

export interface Profile {
  id: string;
  display_name: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  status: ChapterStatus;
  confidence: number; // 1 to 5
  completed_at: string | null;
  position: number;
  checklist_progress?: string[]; // Array of completed checkpoint IDs
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  user_id: string;
  name: string;
  exam_date: string; // YYYY-MM-DD
  status: ExamStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  subject_ids?: string[]; // linked subject IDs
  chapter_ids?: string[]; // linked chapter IDs specifically for this exam
}

export interface ExamSubject {
  id: string;
  exam_id: string;
  subject_id: string;
}

export interface Revision {
  id: string;
  chapter_id: string;
  scheduled_for: string; // YYYY-MM-DD
  completed_at: string | null;
  interval_days: number;
  difficulty: RevisionDifficulty | null;
  created_at: string;
}

export interface ErrorEntry {
  id: string;
  chapter_id: string;
  question: string | null;
  mistake_type: MistakeType;
  what_went_wrong: string;
  correct_method: string | null;
  lesson_learned: string | null;
  occurred_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  plan_date: string; // YYYY-MM-DD
  available_minutes: number;
  generated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  daily_plan_id: string | null;
  chapter_id: string | null;
  revision_id: string | null;
  title: string;
  task_type: TaskType;
  estimated_minutes: number;
  priority_score: number;
  priority_reason?: string;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Denormalized/joined helper properties for UI
  subject_name?: string;
  chapter_name?: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string | null;
  chapter_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
}
