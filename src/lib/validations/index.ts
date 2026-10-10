import { z } from 'zod';

export const MistakeTypeEnum = z.enum([
  'Concept',
  'Formula',
  'Calculation',
  'Careless',
  'Misread Question',
  'Time Management',
  'Guess',
  'Other',
]);

export const SubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100),
  icon: z.string().optional().nullable(),
});

export const ChapterSchema = z.object({
  subject_id: z.string().uuid().or(z.string().min(1)),
  name: z.string().min(1, 'Chapter name is required').max(150),
  status: z.enum(['Not Started', 'In Progress', 'Completed']).default('Not Started'),
  confidence: z.number().int().min(1).max(5).default(3),
  position: z.number().int().default(0),
});

export const ExamSchema = z.object({
  name: z.string().min(1, 'Exam name is required').max(150),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date YYYY-MM-DD required'),
  notes: z.string().optional().nullable(),
  subject_ids: z.array(z.string()).default([]),
});

export const ErrorEntrySchema = z.object({
  chapter_id: z.string().min(1, 'Chapter is required'),
  mistake_type: MistakeTypeEnum,
  what_went_wrong: z.string().min(3, 'Description of mistake is required'),
  question: z.string().optional().nullable(),
  correct_method: z.string().optional().nullable(),
  lesson_learned: z.string().optional().nullable(),
});

export const RevisionReviewSchema = z.object({
  revision_id: z.string().min(1),
  difficulty: z.enum(['Hard', 'Medium', 'Easy']),
});

export const DailyCapacitySchema = z.object({
  available_minutes: z.number().int().min(15).max(720),
});
