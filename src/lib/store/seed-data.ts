import { Subject, Chapter, Exam, Revision, ErrorEntry } from '@/types';
import { formatCalendarDate, addDays } from '../engine/revision';

export function getSeedData(today: Date = new Date()) {
  const todayStr = formatCalendarDate(today);
  const tomorrowStr = formatCalendarDate(addDays(today, 1));
  const in3DaysStr = formatCalendarDate(addDays(today, 3));
  const in12DaysStr = formatCalendarDate(addDays(today, 12));

  const subjects: Subject[] = [
    {
      id: 'sub-science',
      user_id: 'default-user',
      name: 'Science',
      icon: 'Atom',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'sub-maths',
      user_id: 'default-user',
      name: 'Mathematics',
      icon: 'Calculator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'sub-cs',
      user_id: 'default-user',
      name: 'Computer Science',
      icon: 'Code2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const chapters: Chapter[] = [
    // Science Chapters
    {
      id: 'chap-sci-1',
      subject_id: 'sub-science',
      name: 'Chemical Reactions & Equations',
      status: 'Completed',
      confidence: 4,
      completed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'chap-sci-2',
      subject_id: 'sub-science',
      name: 'Carbon and its Compounds',
      status: 'In Progress',
      confidence: 2,
      completed_at: null,
      position: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'chap-sci-3',
      subject_id: 'sub-science',
      name: 'Light — Reflection & Refraction',
      status: 'In Progress',
      confidence: 3,
      completed_at: null,
      position: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'chap-sci-4',
      subject_id: 'sub-science',
      name: 'Electricity & Circuits',
      status: 'Not Started',
      confidence: 2,
      completed_at: null,
      position: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // Mathematics Chapters
    {
      id: 'chap-math-1',
      subject_id: 'sub-maths',
      name: 'Quadratic Equations',
      status: 'Completed',
      confidence: 4,
      completed_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'chap-math-2',
      subject_id: 'sub-maths',
      name: 'Triangles & Coordinate Geometry',
      status: 'In Progress',
      confidence: 2,
      completed_at: null,
      position: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'chap-math-3',
      subject_id: 'sub-maths',
      name: 'Introduction to Trigonometry',
      status: 'Not Started',
      confidence: 2,
      completed_at: null,
      position: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },

    // Computer Science Chapters
    {
      id: 'chap-cs-1',
      subject_id: 'sub-cs',
      name: 'Data Structures & Arrays',
      status: 'Completed',
      confidence: 5,
      completed_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'chap-cs-2',
      subject_id: 'sub-cs',
      name: 'Recursion and Backtracking',
      status: 'In Progress',
      confidence: 3,
      completed_at: null,
      position: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const exams: Exam[] = [
    {
      id: 'exam-1',
      user_id: 'default-user',
      name: 'Science Term Exam',
      exam_date: tomorrowStr, // Tomorrow! Immediate priority
      status: 'Upcoming',
      notes: 'Focus on Carbon nomenclature and Ray diagrams',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subject_ids: ['sub-science'],
    },
    {
      id: 'exam-2',
      user_id: 'default-user',
      name: 'Maths Mid-Term',
      exam_date: in3DaysStr,
      status: 'Upcoming',
      notes: 'Coordinate geometry proofs and quadratic derivations',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subject_ids: ['sub-maths'],
    },
    {
      id: 'exam-3',
      user_id: 'default-user',
      name: 'CS Practical Finals',
      exam_date: in12DaysStr,
      status: 'Upcoming',
      notes: 'Lab code execution',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subject_ids: ['sub-cs'],
    },
  ];

  const revisions: Revision[] = [
    {
      id: 'rev-1',
      chapter_id: 'chap-sci-1',
      scheduled_for: todayStr, // Due today!
      completed_at: null,
      interval_days: 3,
      difficulty: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 'rev-2',
      chapter_id: 'chap-math-1',
      scheduled_for: formatCalendarDate(addDays(today, 2)),
      completed_at: null,
      interval_days: 7,
      difficulty: null,
      created_at: new Date().toISOString(),
    },
  ];

  const errors: ErrorEntry[] = [
    {
      id: 'err-1',
      chapter_id: 'chap-sci-2',
      question: 'Give IUPAC name for CH3-CH2-CHO',
      mistake_type: 'Concept',
      what_went_wrong: 'Wrote propanone instead of propanal due to confusing -al and -one suffixes.',
      correct_method: 'Aldehyde (-CHO) has suffix -al: Propanal.',
      lesson_learned: 'Always check if carbonyl is terminal (-CHO) or internal (ketone -CO-).',
      occurred_at: new Date(Date.now() - 86400000).toISOString(),
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'err-2',
      chapter_id: 'chap-sci-2',
      question: 'Saturated vs Unsaturated Hydrocarbon Bromine Water Test',
      mistake_type: 'Careless',
      what_went_wrong: 'Swapped observation for alkene vs alkane.',
      correct_method: 'Unsaturated hydrocarbons decolorize bromine water.',
      lesson_learned: 'Active double bond reacts with halogen adding across bond.',
      occurred_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'err-3',
      chapter_id: 'chap-math-2',
      question: 'Find distance between (2, 3) and (4, 1)',
      mistake_type: 'Calculation',
      what_went_wrong: 'Calculation error with sign inside parenthesis before squaring.',
      correct_method: 'sqrt((4-2)^2 + (1-3)^2) = sqrt(4 + 4) = 2*sqrt(2).',
      lesson_learned: 'Write both terms step by step before simplifying.',
      occurred_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return { subjects, chapters, exams, revisions, errors };
}
