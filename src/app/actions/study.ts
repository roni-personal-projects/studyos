'use server';

import { getDb } from '@/lib/db';
import {
  Subject,
  Chapter,
  Exam,
  Revision,
  ErrorEntry,
  ChapterStatus,
  RevisionDifficulty,
  MistakeType,
} from '@/types';
import { getSeedData } from '@/lib/store/seed-data';
import {
  generateInitialRevisions,
  calculateNextInterval,
  formatCalendarDate,
  addDays,
} from '@/lib/engine/revision';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

async function ensureDefaultUser() {
  const sql = getDb();
  if (!sql) return;

  await sql`
    INSERT INTO users (id, email, display_name)
    VALUES (${DEFAULT_USER_ID}, 'student@studyos.local', 'Student')
    ON CONFLICT (id) DO NOTHING;
  `;
}

/**
 * Fetch all study data directly from Neon Postgres.
 * If Neon has no subjects, seeds starter data automatically.
 */
export async function fetchStudyDataAction() {
  const sql = getDb();
  if (!sql) {
    return null;
  }

  await ensureDefaultUser();

  const subjectsRaw = await sql`
    SELECT id, user_id, name, icon, created_at, updated_at
    FROM subjects
    ORDER BY created_at ASC
  `;

  // Auto-seed if database is brand new
  if (subjectsRaw.length === 0) {
    await seedInitialDataToNeon();
    return fetchStudyDataAction();
  }

  const chaptersRaw = await sql`
    SELECT id, subject_id, name, status, confidence, completed_at, position, created_at, updated_at
    FROM chapters
    ORDER BY position ASC, created_at ASC
  `;

  const examsRaw = await sql`
    SELECT id, user_id, name, to_char(exam_date, 'YYYY-MM-DD') as exam_date, status, notes, created_at, updated_at
    FROM exams
    ORDER BY exam_date ASC
  `;

  const examSubjectsRaw = await sql`
    SELECT exam_id, subject_id FROM exam_subjects
  `;

  const revisionsRaw = await sql`
    SELECT id, chapter_id, to_char(scheduled_for, 'YYYY-MM-DD') as scheduled_for, completed_at, interval_days, difficulty, created_at
    FROM revisions
    ORDER BY scheduled_for ASC
  `;

  const errorsRaw = await sql`
    SELECT id, chapter_id, question, mistake_type, what_went_wrong, correct_method, lesson_learned, occurred_at, reviewed_at, created_at, updated_at
    FROM errors
    ORDER BY occurred_at DESC
  `;

  // Group exam_subjects by exam_id
  const examSubjectsMap = new Map<string, string[]>();
  for (const es of examSubjectsRaw) {
    const list = examSubjectsMap.get(es.exam_id) || [];
    list.push(es.subject_id);
    examSubjectsMap.set(es.exam_id, list);
  }

  const exams: Exam[] = examsRaw.map((e) => ({
    id: e.id,
    user_id: e.user_id,
    name: e.name,
    exam_date: e.exam_date,
    status: e.status,
    notes: e.notes,
    created_at: e.created_at,
    updated_at: e.updated_at,
    subject_ids: examSubjectsMap.get(e.id) || [],
  }));

  const subjects: Subject[] = subjectsRaw.map((s) => ({
    id: s.id,
    user_id: s.user_id || DEFAULT_USER_ID,
    name: s.name,
    icon: s.icon,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));

  const chapters: Chapter[] = chaptersRaw.map((c) => ({
    id: c.id,
    subject_id: c.subject_id,
    name: c.name,
    status: c.status,
    confidence: c.confidence,
    completed_at: c.completed_at,
    position: c.position,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));

  const revisions: Revision[] = revisionsRaw.map((r) => ({
    id: r.id,
    chapter_id: r.chapter_id,
    scheduled_for: r.scheduled_for,
    completed_at: r.completed_at,
    interval_days: r.interval_days,
    difficulty: r.difficulty,
    created_at: r.created_at,
  }));

  const errors: ErrorEntry[] = errorsRaw.map((err) => ({
    id: err.id,
    chapter_id: err.chapter_id,
    question: err.question,
    mistake_type: err.mistake_type,
    what_went_wrong: err.what_went_wrong,
    correct_method: err.correct_method,
    lesson_learned: err.lesson_learned,
    occurred_at: err.occurred_at,
    reviewed_at: err.reviewed_at,
    created_at: err.created_at,
    updated_at: err.updated_at,
  }));

  return { subjects, chapters, exams, revisions, errors };
}

/**
 * Seed initial mock curriculum into live Neon Postgres.
 */
async function seedInitialDataToNeon() {
  const sql = getDb();
  if (!sql) return;

  const seed = getSeedData(new Date());

  // Insert subjects
  const subIdMap = new Map<string, string>();
  for (const s of seed.subjects) {
    const [inserted] = await sql`
      INSERT INTO subjects (name, icon, user_id)
      VALUES (${s.name}, ${s.icon}, ${DEFAULT_USER_ID})
      RETURNING id
    `;
    subIdMap.set(s.id, inserted.id);
  }

  // Insert chapters
  const chapIdMap = new Map<string, string>();
  for (const c of seed.chapters) {
    const realSubId = subIdMap.get(c.subject_id);
    if (!realSubId) continue;

    const [inserted] = await sql`
      INSERT INTO chapters (subject_id, name, status, confidence, completed_at, position)
      VALUES (${realSubId}, ${c.name}, ${c.status}, ${c.confidence}, ${c.completed_at ? new Date(c.completed_at) : null}, ${c.position})
      RETURNING id
    `;
    chapIdMap.set(c.id, inserted.id);
  }

  // Insert exams and exam_subjects
  for (const e of seed.exams) {
    const [insertedExam] = await sql`
      INSERT INTO exams (name, exam_date, status, notes, user_id)
      VALUES (${e.name}, ${e.exam_date}, ${e.status}, ${e.notes}, ${DEFAULT_USER_ID})
      RETURNING id
    `;

    for (const oldSubId of e.subject_ids || []) {
      const realSubId = subIdMap.get(oldSubId);
      if (realSubId) {
        await sql`
          INSERT INTO exam_subjects (exam_id, subject_id)
          VALUES (${insertedExam.id}, ${realSubId})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  }

  // Insert revisions
  for (const r of seed.revisions) {
    const realChapId = chapIdMap.get(r.chapter_id);
    if (!realChapId) continue;

    await sql`
      INSERT INTO revisions (chapter_id, scheduled_for, completed_at, interval_days, difficulty)
      VALUES (${realChapId}, ${r.scheduled_for}, ${r.completed_at ? new Date(r.completed_at) : null}, ${r.interval_days}, ${r.difficulty})
    `;
  }

  // Insert errors
  for (const err of seed.errors) {
    const realChapId = chapIdMap.get(err.chapter_id);
    if (!realChapId) continue;

    await sql`
      INSERT INTO errors (chapter_id, question, mistake_type, what_went_wrong, correct_method, lesson_learned, occurred_at)
      VALUES (${realChapId}, ${err.question}, ${err.mistake_type}, ${err.what_went_wrong}, ${err.correct_method}, ${err.lesson_learned}, ${new Date(err.occurred_at)})
    `;
  }
}

/**
 * Create a new Subject in Neon.
 */
export async function createSubjectAction(name: string, icon?: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');
  await ensureDefaultUser();

  const [row] = await sql`
    INSERT INTO subjects (name, icon, user_id)
    VALUES (${name.trim()}, ${icon || 'BookOpen'}, ${DEFAULT_USER_ID})
    RETURNING id, user_id, name, icon, created_at, updated_at
  `;

  return row as Subject;
}

/**
 * Delete a Subject and cascades to chapters/revisions/errors in Neon.
 */
export async function deleteSubjectAction(subjectId: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  await sql`DELETE FROM subjects WHERE id = ${subjectId}`;
  return { success: true };
}

/**
 * Create a Chapter in Neon.
 */
export async function createChapterAction(subjectId: string, name: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  const countRes = await sql`
    SELECT COUNT(*)::int as count FROM chapters WHERE subject_id = ${subjectId}
  `;
  const position = (countRes[0]?.count || 0) + 1;

  const [row] = await sql`
    INSERT INTO chapters (subject_id, name, status, confidence, position)
    VALUES (${subjectId}, ${name.trim()}, 'Not Started', 3, ${position})
    RETURNING id, subject_id, name, status, confidence, completed_at, position, created_at, updated_at
  `;

  return row as Chapter;
}

/**
 * Update Chapter Status.
 * If status === 'Completed', schedules initial 5 spaced revisions in Neon!
 */
export async function updateChapterStatusAction(chapterId: string, status: ChapterStatus) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  const completedAt = status === 'Completed' ? new Date() : null;

  const [row] = await sql`
    UPDATE chapters
    SET status = ${status},
        completed_at = ${completedAt},
        updated_at = now()
    WHERE id = ${chapterId}
    RETURNING id, subject_id, name, status, confidence, completed_at, position, created_at, updated_at
  `;

  const newRevisions: Revision[] = [];
  if (status === 'Completed') {
    const schedules = generateInitialRevisions(chapterId, new Date());
    for (const s of schedules) {
      const [insertedRev] = await sql`
        INSERT INTO revisions (chapter_id, scheduled_for, interval_days)
        VALUES (${chapterId}, ${s.scheduled_for}, ${s.interval_days})
        RETURNING id, chapter_id, to_char(scheduled_for, 'YYYY-MM-DD') as scheduled_for, completed_at, interval_days, difficulty, created_at
      `;
      newRevisions.push(insertedRev as Revision);
    }
  }

  return { chapter: row as Chapter, newRevisions };
}

/**
 * Update Chapter Confidence (1-5) in Neon.
 */
export async function updateChapterConfidenceAction(chapterId: string, confidence: number) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  const clamped = Math.max(1, Math.min(5, confidence));
  const [row] = await sql`
    UPDATE chapters
    SET confidence = ${clamped},
        updated_at = now()
    WHERE id = ${chapterId}
    RETURNING id, subject_id, name, status, confidence, completed_at, position, created_at, updated_at
  `;

  return row as Chapter;
}

/**
 * Delete a Chapter in Neon.
 */
export async function deleteChapterAction(chapterId: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  await sql`DELETE FROM chapters WHERE id = ${chapterId}`;
  return { success: true };
}

/**
 * Create an Exam in Neon with linked subjects.
 */
export async function createExamAction(
  name: string,
  examDate: string,
  subjectIds: string[],
  notes?: string
) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');
  await ensureDefaultUser();

  const [examRow] = await sql`
    INSERT INTO exams (name, exam_date, notes, status, user_id)
    VALUES (${name.trim()}, ${examDate}, ${notes || null}, 'Upcoming', ${DEFAULT_USER_ID})
    RETURNING id, user_id, name, to_char(exam_date, 'YYYY-MM-DD') as exam_date, status, notes, created_at, updated_at
  `;

  for (const subId of subjectIds) {
    await sql`
      INSERT INTO exam_subjects (exam_id, subject_id)
      VALUES (${examRow.id}, ${subId})
      ON CONFLICT DO NOTHING
    `;
  }

  return {
    ...examRow,
    subject_ids: subjectIds,
  } as Exam;
}

/**
 * Mark Exam as Completed in Neon.
 */
export async function markExamCompletedAction(examId: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  const [row] = await sql`
    UPDATE exams
    SET status = 'Completed',
        updated_at = now()
    WHERE id = ${examId}
    RETURNING id, user_id, name, to_char(exam_date, 'YYYY-MM-DD') as exam_date, status, notes, created_at, updated_at
  `;

  return row as Exam;
}

/**
 * Delete an Exam in Neon.
 */
export async function deleteExamAction(examId: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  await sql`DELETE FROM exams WHERE id = ${examId}`;
  return { success: true };
}

/**
 * Complete a Revision and adaptively schedule next interval in Neon.
 */
export async function completeRevisionAction(revisionId: string, difficulty: RevisionDifficulty) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  const [revRow] = await sql`
    UPDATE revisions
    SET completed_at = now(),
        difficulty = ${difficulty}
    WHERE id = ${revisionId}
    RETURNING id, chapter_id, to_char(scheduled_for, 'YYYY-MM-DD') as scheduled_for, completed_at, interval_days, difficulty, created_at
  `;

  if (!revRow) throw new Error('Revision not found');

  const nextInterval = calculateNextInterval(revRow.interval_days, difficulty);
  const nextDateStr = formatCalendarDate(addDays(new Date(), nextInterval));

  const [nextRevRow] = await sql`
    INSERT INTO revisions (chapter_id, scheduled_for, interval_days)
    VALUES (${revRow.chapter_id}, ${nextDateStr}, ${nextInterval})
    RETURNING id, chapter_id, to_char(scheduled_for, 'YYYY-MM-DD') as scheduled_for, completed_at, interval_days, difficulty, created_at
  `;

  return {
    completedRevision: revRow as Revision,
    nextRevision: nextRevRow as Revision,
  };
}

/**
 * Record a mistake entry in Neon.
 */
export async function createErrorAction(data: {
  chapterId: string;
  mistakeType: MistakeType;
  whatWentWrong: string;
  question?: string;
  correctMethod?: string;
  lessonLearned?: string;
}) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  const [row] = await sql`
    INSERT INTO errors (chapter_id, question, mistake_type, what_went_wrong, correct_method, lesson_learned, occurred_at)
    VALUES (
      ${data.chapterId},
      ${data.question || null},
      ${data.mistakeType},
      ${data.whatWentWrong.trim()},
      ${data.correctMethod || null},
      ${data.lessonLearned || null},
      now()
    )
    RETURNING id, chapter_id, question, mistake_type, what_went_wrong, correct_method, lesson_learned, occurred_at, reviewed_at, created_at, updated_at
  `;

  return row as ErrorEntry;
}

/**
 * Mark a mistake as reviewed in Neon.
 */
export async function markErrorReviewedAction(errorId: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  const [row] = await sql`
    UPDATE errors
    SET reviewed_at = now(),
        updated_at = now()
    WHERE id = ${errorId}
    RETURNING id, chapter_id, question, mistake_type, what_went_wrong, correct_method, lesson_learned, occurred_at, reviewed_at, created_at, updated_at
  `;

  return row as ErrorEntry;
}

/**
 * Delete a mistake entry in Neon.
 */
export async function deleteErrorAction(errorId: string) {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  await sql`DELETE FROM errors WHERE id = ${errorId}`;
  return { success: true };
}

/**
 * Clear and reset all curriculum data to sample data directly on Neon.
 */
export async function resetToSampleDataAction() {
  const sql = getDb();
  if (!sql) throw new Error('Database not connected');

  await sql`DELETE FROM errors`;
  await sql`DELETE FROM revisions`;
  await sql`DELETE FROM exam_subjects`;
  await sql`DELETE FROM exams`;
  await sql`DELETE FROM chapters`;
  await sql`DELETE FROM subjects`;

  await seedInitialDataToNeon();
  return fetchStudyDataAction();
}
