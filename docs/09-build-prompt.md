# StudyOS — Master Build Prompt

Build a production-quality personal study web application called **StudyOS**.

## Product

StudyOS is not a generic task manager. It is a personal study operating system whose primary job is to answer:

> **What should I study next?**

The app manages:
- Subjects
- Chapters
- Multiple exams
- Syllabus progress
- Daily tasks
- Available study time
- Automatic spaced-repetition revisions
- Confidence
- Chapter-level error journals
- Subject-wide aggregated error journals

The application is for a single student initially. Do not build social features or unnecessary infrastructure.

## Tech

Use:
- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide
- Supabase PostgreSQL/Auth/RLS
- React Hook Form
- Zod
- Vitest
- Playwright

Use strict TypeScript.

## Core Behavior

### Subjects

Users can create subjects and chapters.

Chapter statuses:
- Not Started
- In Progress
- Completed

Confidence:
- 1–5

### Exams

Users can create multiple exams.

Each exam has:
- Name
- Date
- One or more subjects
- Status

All active exams must influence the daily plan.

Example:

```text
Science exam: tomorrow
Maths exam: in 2 days
English exam: in 10 days
```

The plan should prioritize Science, then Maths, while potentially giving English no work if available study time is limited.

Do not give every active subject equal weight.

### Available Time

The user can specify how many minutes they have today.

The planner must not exceed this capacity.

If 90 minutes are available, do not create 120 minutes of work.

### Planner

Generate candidate tasks from:
- Due revisions
- Exam preparation
- Incomplete chapters
- Low-confidence chapters
- Chapters with many/recent errors

Rank them using a deterministic, explainable priority algorithm.

A near exam should receive disproportionately higher priority.

When the user completes a task, changes available time, adds an exam, or completes an exam, regenerate the plan.

### Revision

When a chapter is completed, schedule:

```text
+1 day
+3 days
+7 days
+14 days
+30 days
```

When a revision is completed, let the user rate it:
- Hard
- Medium
- Easy

Hard should shorten the next interval.
Easy can lengthen it.

Keep the algorithm simple and deterministic.

### Error Journal

Each error belongs to a chapter.

Fields:
- Question
- Mistake type
- What went wrong
- Correct method
- Lesson learned
- Date
- Review status

Mistake types:
- Concept
- Formula
- Calculation
- Careless
- Misread Question
- Time Management
- Guess
- Other

A chapter view displays its errors.

A subject view aggregates errors from every chapter under that subject.

Allow filtering by:
- Chapter
- Mistake type
- Date
- Review status

Do not duplicate errors into a separate subject-error table.

### Progress

Calculate:
- Chapter completion
- Subject completion
- Overall completion
- Revision completion
- Error counts

Keep analytics secondary to the daily plan.

## Dashboard

The dashboard should show:

1. Today's plan
2. Nearest exam
3. Revisions due
4. Progress
5. Weak areas/errors

Example:

```text
Science Exam Tomorrow

Today's Plan — 90 min

Review Carbon Errors
25 min

Revise Light
25 min

Science Formula Review
20 min

Mixed Questions
20 min
```

If Science is tomorrow and Maths is the day after, do not create a fake balanced schedule.

## Design

Follow the design system documented in `docs/07-ui-guidelines.md`.

Use the Stitch design as visual reference, but prioritize functional correctness and responsive behavior.

Mobile-first.

Minimal.

No excessive gamification.

## Architecture

Separate:
- UI components
- Data access
- Planner logic
- Revision logic
- Validation
- Types

The scheduling engine must be independently testable.

Do not bury planning calculations inside React components.

## Database

Follow `docs/05-database-schema.md`.

Enable Row Level Security for user-owned data.

## Important Engineering Rules

- Do not hardcode demo data into production components.
- Do not invent APIs.
- Do not duplicate business logic.
- Do not silently swallow errors.
- Use loading and empty states.
- Validate mutations server-side.
- Keep database queries efficient.
- Use indexes defined in the schema.
- Write tests for planner and revision calculations.
- Keep components reasonably small.
- Prefer simple solutions over unnecessary abstractions.

## Build Strategy

Implement incrementally:

1. Project setup
2. Supabase connection
3. Database schema
4. App shell
5. Subjects
6. Chapters
7. Exams
8. Dashboard
9. Tasks
10. Revision engine
11. Multi-exam priority engine
12. Error journal
13. Subject error aggregation
14. Progress
15. Testing
16. Responsive polish

After each major feature:
- Run type checks.
- Run linting.
- Run relevant tests.
- Fix errors before moving on.

Do not implement AI features until the deterministic version works reliably.

## Definition of Done

The user can:

- Add subjects.
- Add chapters.
- Add multiple exams.
- Set available study time.
- Open the dashboard and immediately see what matters.
- Complete chapters.
- Receive automatic revision schedules.
- Log errors.
- Review all errors for a subject.
- Have the nearest exam receive priority.
- Finish an exam and automatically get a recalculated plan.
- Use the app comfortably on mobile and desktop.
