export interface CheckpointItem {
  id: string;
  label: string;
  category?: 'Concepts' | 'Practice' | 'Recall' | 'Testing' | 'Review';
  estimatedMinutes?: number;
}

export interface SubjectChecklistConfig {
  subjectKey: string;
  title: string;
  subtitle: string;
  rule?: string;
  items: CheckpointItem[];
}

export const MATHEMATICS_CHECKLIST: SubjectChecklistConfig = {
  subjectKey: 'maths',
  title: 'Maths Mastery',
  subtitle: 'Concepts → Practice → Accuracy',
  rule: 'StudyOS rule: a chapter is mastered only after the test and error review—not merely after reading.',
  items: [
    {
      id: 'math-1',
      label: 'Read and understand all NCERT concepts and examples',
      category: 'Concepts',
      estimatedMinutes: 25,
    },
    {
      id: 'math-2',
      label: 'Understand formulas, identities and their derivations where required',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'math-3',
      label: 'Solve all NCERT examples independently',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'math-4',
      label: 'Complete all NCERT exercises',
      category: 'Practice',
      estimatedMinutes: 40,
    },
    {
      id: 'math-5',
      label: 'Solve important competency-based and application questions',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'math-6',
      label: 'Practice relevant previous-year board questions',
      category: 'Practice',
      estimatedMinutes: 35,
    },
    {
      id: 'math-7',
      label: 'Review mistakes and update the chapter error journal',
      category: 'Review',
      estimatedMinutes: 15,
    },
    {
      id: 'math-8',
      label: 'Complete a timed chapter test and verify weak areas',
      category: 'Testing',
      estimatedMinutes: 35,
    },
  ],
};

export const SCIENCE_CHECKLIST: SubjectChecklistConfig = {
  subjectKey: 'science',
  title: 'Science Mastery',
  subtitle: 'Understand → Recall → Apply',
  rule: 'Adapt the formula/diagram checkpoint to the chapter: Physics, Chemistry and Biology require different forms of practice.',
  items: [
    {
      id: 'sci-1',
      label: 'Read the NCERT chapter carefully and understand every key concept',
      category: 'Concepts',
      estimatedMinutes: 30,
    },
    {
      id: 'sci-2',
      label: 'Learn definitions, laws, principles and important terminology',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'sci-3',
      label: 'Understand formulas, units, derivations and numerical methods where applicable',
      category: 'Concepts',
      estimatedMinutes: 25,
    },
    {
      id: 'sci-4',
      label: 'Practice required diagrams, labelling, chemical equations or reactions',
      category: 'Practice',
      estimatedMinutes: 25,
    },
    {
      id: 'sci-5',
      label: 'Explain key concepts from memory without looking at notes',
      category: 'Recall',
      estimatedMinutes: 20,
    },
    {
      id: 'sci-6',
      label: 'Complete NCERT in-text and exercise questions',
      category: 'Practice',
      estimatedMinutes: 35,
    },
    {
      id: 'sci-7',
      label: 'Practice competency-based questions and relevant PYQs',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'sci-8',
      label: 'Review mistakes and record them in the error journal',
      category: 'Review',
      estimatedMinutes: 15,
    },
    {
      id: 'sci-9',
      label: 'Complete a timed chapter test and correct every error',
      category: 'Testing',
      estimatedMinutes: 35,
    },
  ],
};

export const ENGLISH_LITERATURE_CHECKLIST: SubjectChecklistConfig = {
  subjectKey: 'english_literature',
  title: 'English Literature — Prose & Poetry',
  subtitle: 'Read → Understand → Analyze → Write',
  items: [
    {
      id: 'eng-lit-1',
      label: 'Read the complete text and understand its meaning',
      category: 'Concepts',
      estimatedMinutes: 25,
    },
    {
      id: 'eng-lit-2',
      label: 'Understand the plot or central idea, themes and message',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'eng-lit-3',
      label: 'Identify important characters, relationships or poetic devices where relevant',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'eng-lit-4',
      label: 'Understand significant lines, events and their context',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'eng-lit-5',
      label: 'Practice textbook questions and important textual references',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'eng-lit-6',
      label: 'Practice competency-based, inference and analytical questions',
      category: 'Practice',
      estimatedMinutes: 25,
    },
    {
      id: 'eng-lit-7',
      label: 'Write at least one timed exam-style answer',
      category: 'Testing',
      estimatedMinutes: 25,
    },
    {
      id: 'eng-lit-8',
      label: 'Review mistakes and revise weak interpretations',
      category: 'Review',
      estimatedMinutes: 15,
    },
  ],
};

export const ENGLISH_GRAMMAR_CHECKLIST: SubjectChecklistConfig = {
  subjectKey: 'english_grammar',
  title: 'English — Grammar & Writing',
  subtitle: 'Format → Rules → Independent Practice',
  items: [
    {
      id: 'eng-gw-1',
      label: 'Understand the relevant grammar or writing format and rules',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'eng-gw-2',
      label: 'Study solved examples and identify common errors',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'eng-gw-3',
      label: 'Practice the required question types independently',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'eng-gw-4',
      label: 'Complete a timed set of exam-style questions',
      category: 'Testing',
      estimatedMinutes: 25,
    },
    {
      id: 'eng-gw-5',
      label: 'Check answers against marking criteria and record mistakes',
      category: 'Review',
      estimatedMinutes: 15,
    },
  ],
};

export const IT_CHECKLIST: SubjectChecklistConfig = {
  subjectKey: 'it',
  title: 'IT Mastery',
  subtitle: 'Theory → Procedures → Practical application',
  rule: 'Use the practical checkpoint only for topics that involve software or hands-on procedures.',
  items: [
    {
      id: 'it-1',
      label: 'Read and understand all prescribed textbook concepts',
      category: 'Concepts',
      estimatedMinutes: 25,
    },
    {
      id: 'it-2',
      label: 'Learn important definitions, terminology, abbreviations and full forms',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'it-3',
      label: 'Understand features, functions, commands and their uses',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'it-4',
      label: 'Practice software steps or procedures practically where applicable',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'it-5',
      label: 'Practice relevant code, formulas or syntax if included in the syllabus',
      category: 'Practice',
      estimatedMinutes: 25,
    },
    {
      id: 'it-6',
      label: 'Complete textbook exercises, MCQs and application-based questions',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'it-7',
      label: 'Practice board-pattern and previous-year questions',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'it-8',
      label: 'Review mistakes and complete a timed chapter test',
      category: 'Testing',
      estimatedMinutes: 30,
    },
  ],
};

export const SST_CHECKLIST: SubjectChecklistConfig = {
  subjectKey: 'sst',
  title: 'SST Mastery',
  subtitle: 'Understand → Connect → Recall → Write',
  rule: 'Adapt map work, dates and data interpretation to the specific History, Geography, Political Science or Economics chapter.',
  items: [
    {
      id: 'sst-1',
      label: 'Read the NCERT chapter and understand its main argument or narrative',
      category: 'Concepts',
      estimatedMinutes: 30,
    },
    {
      id: 'sst-2',
      label: 'Identify key terms, concepts, events, dates and people where relevant',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'sst-3',
      label: 'Understand causes, consequences, comparisons and relationships',
      category: 'Concepts',
      estimatedMinutes: 25,
    },
    {
      id: 'sst-4',
      label: 'Practice maps, locations, diagrams or data interpretation where applicable',
      category: 'Practice',
      estimatedMinutes: 25,
    },
    {
      id: 'sst-5',
      label: 'Recall key information without looking at the textbook',
      category: 'Recall',
      estimatedMinutes: 20,
    },
    {
      id: 'sst-6',
      label: 'Prepare concise answer frameworks for important questions',
      category: 'Practice',
      estimatedMinutes: 25,
    },
    {
      id: 'sst-7',
      label: 'Practice source-based, case-based and competency-based questions',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'sst-8',
      label: 'Write timed short-answer and long-answer responses',
      category: 'Testing',
      estimatedMinutes: 30,
    },
    {
      id: 'sst-9',
      label: 'Check answers against marking criteria and update the error journal',
      category: 'Review',
      estimatedMinutes: 15,
    },
  ],
};

export const DEFAULT_CHECKLIST: SubjectChecklistConfig = {
  subjectKey: 'default',
  title: 'Subject Mastery',
  subtitle: 'Understand → Practice → Test',
  items: [
    {
      id: 'def-1',
      label: 'Read and understand all core textbook concepts and definitions',
      category: 'Concepts',
      estimatedMinutes: 25,
    },
    {
      id: 'def-2',
      label: 'Summarize key formulas, rules, or core principles from memory',
      category: 'Concepts',
      estimatedMinutes: 20,
    },
    {
      id: 'def-3',
      label: 'Solve all standard textbook examples independently',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'def-4',
      label: 'Complete in-text and end-of-chapter exercise questions',
      category: 'Practice',
      estimatedMinutes: 35,
    },
    {
      id: 'def-5',
      label: 'Solve competency-based, analytical and previous-year questions',
      category: 'Practice',
      estimatedMinutes: 30,
    },
    {
      id: 'def-6',
      label: 'Active recall test: explain or outline chapter without notes',
      category: 'Recall',
      estimatedMinutes: 20,
    },
    {
      id: 'def-7',
      label: 'Review mistakes and document tricky points in the error journal',
      category: 'Review',
      estimatedMinutes: 15,
    },
    {
      id: 'def-8',
      label: 'Complete a timed chapter test and review errors',
      category: 'Testing',
      estimatedMinutes: 35,
    },
  ],
};

/**
 * Resolves the appropriate completion checklist for a subject based on its name or chapter name.
 */
export function getSubjectChecklist(subjectName: string, chapterName: string = ''): SubjectChecklistConfig {
  const normSub = subjectName.toLowerCase();
  const normChap = chapterName.toLowerCase();

  if (normSub.includes('math')) {
    return MATHEMATICS_CHECKLIST;
  }
  if (
    normSub.includes('science') ||
    normSub.includes('physics') ||
    normSub.includes('chemistry') ||
    normSub.includes('biology')
  ) {
    return SCIENCE_CHECKLIST;
  }
  if (normSub.includes('english')) {
    // Discriminate between Grammar/Writing vs Literature
    if (
      normChap.includes('grammar') ||
      normChap.includes('writing') ||
      normChap.includes('letter') ||
      normChap.includes('essay') ||
      normChap.includes('tense') ||
      normChap.includes('modals')
    ) {
      return ENGLISH_GRAMMAR_CHECKLIST;
    }
    return ENGLISH_LITERATURE_CHECKLIST;
  }
  if (
    normSub.includes('it') ||
    normSub.includes('information technology') ||
    normSub.includes('computer') ||
    normSub.includes('cs') ||
    normSub.includes('coding')
  ) {
    return IT_CHECKLIST;
  }
  if (
    normSub.includes('sst') ||
    normSub.includes('social') ||
    normSub.includes('history') ||
    normSub.includes('geography') ||
    normSub.includes('civics') ||
    normSub.includes('political') ||
    normSub.includes('economics')
  ) {
    return SST_CHECKLIST;
  }

  return DEFAULT_CHECKLIST;
}

export type MasteryStatus =
  | 'Not started'
  | 'Learning'
  | 'Practice'
  | 'First pass complete'
  | 'Revision due'
  | 'Exam-ready';

/**
 * Computes the recommended status of a chapter from checklist progress, confidence and revision state.
 */
export function computeMasteryStatus({
  completedCount,
  totalCount,
  hasDueRevision = false,
  confidence = 3,
}: {
  completedCount: number;
  totalCount: number;
  hasDueRevision?: boolean;
  confidence?: number;
}): MasteryStatus {
  if (completedCount === 0) {
    return 'Not started';
  }

  if (completedCount < totalCount) {
    // If under half or first 2-3 concept checkpoints done:
    if (completedCount <= 2 || completedCount / totalCount < 0.4) {
      return 'Learning';
    }
    return 'Practice';
  }

  // All checkpoints completed!
  if (hasDueRevision) {
    return 'Revision due';
  }

  if (confidence >= 4) {
    return 'Exam-ready';
  }

  return 'First pass complete';
}
