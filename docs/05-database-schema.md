# StudyOS — Database Schema

## 1. users

Managed primarily by Supabase Auth.

Optional profile table:

```text
profiles
- id UUID PK
- display_name TEXT
- timezone TEXT
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

## 2. subjects

```text
subjects
- id UUID PK
- user_id UUID FK
- name TEXT NOT NULL
- icon TEXT NULL
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

## 3. chapters

```text
chapters
- id UUID PK
- subject_id UUID FK
- name TEXT NOT NULL
- status TEXT
- confidence INTEGER
- completed_at TIMESTAMPTZ NULL
- position INTEGER
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

Constraints:
- confidence between 1 and 5.
- status must be one of the supported states.

## 4. exams

```text
exams
- id UUID PK
- user_id UUID FK
- name TEXT NOT NULL
- exam_date DATE NOT NULL
- status TEXT
- notes TEXT NULL
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

## 5. exam_subjects

Allows an exam to cover one or more subjects.

```text
exam_subjects
- id UUID PK
- exam_id UUID FK
- subject_id UUID FK
```

Optional future exam scope can identify specific chapters.

## 6. revisions

```text
revisions
- id UUID PK
- chapter_id UUID FK
- scheduled_for DATE NOT NULL
- completed_at TIMESTAMPTZ NULL
- interval_days INTEGER
- difficulty TEXT NULL
- created_at TIMESTAMPTZ
```

## 7. errors

```text
errors
- id UUID PK
- chapter_id UUID FK
- question TEXT NULL
- mistake_type TEXT NOT NULL
- what_went_wrong TEXT NOT NULL
- correct_method TEXT NULL
- lesson_learned TEXT NULL
- occurred_at TIMESTAMPTZ
- reviewed_at TIMESTAMPTZ NULL
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

## 8. daily_plans

```text
daily_plans
- id UUID PK
- user_id UUID FK
- plan_date DATE NOT NULL
- available_minutes INTEGER
- generated_at TIMESTAMPTZ
```

## 9. tasks

```text
tasks
- id UUID PK
- user_id UUID FK
- daily_plan_id UUID FK NULL
- chapter_id UUID FK NULL
- revision_id UUID FK NULL
- title TEXT NOT NULL
- task_type TEXT NOT NULL
- estimated_minutes INTEGER
- priority_score NUMERIC
- status TEXT
- completed_at TIMESTAMPTZ NULL
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

## 10. study_sessions

Optional for MVP.

```text
study_sessions
- id UUID PK
- user_id UUID FK
- subject_id UUID FK NULL
- chapter_id UUID FK NULL
- started_at TIMESTAMPTZ
- ended_at TIMESTAMPTZ
- duration_minutes INTEGER
```

## Relationships

```text
subjects 1 → many chapters
chapters 1 → many revisions
chapters 1 → many errors
exams many ↔ many subjects
daily_plans 1 → many tasks
```

## Indexes

Recommended:
- chapters(subject_id)
- exams(user_id, exam_date)
- revisions(scheduled_for)
- errors(chapter_id, occurred_at)
- tasks(user_id, status)
- daily_plans(user_id, plan_date)

## Security

Every user-owned row must be protected by Supabase Row Level Security.

A user must never be able to read or modify another user's data.
