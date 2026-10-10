# StudyOS — Design Document

## 1. System Overview

StudyOS consists of four major systems:

```text
Academic Data
  ├── Subjects
  ├── Chapters
  └── Exams

Learning State
  ├── Confidence
  ├── Revisions
  └── Errors

Planning Engine
  ├── Priority
  ├── Capacity
  └── Daily Tasks

UI
  ├── Dashboard
  ├── Subject Views
  ├── Exam Views
  └── Error Journal
```

## 2. Core Data Relationships

```text
User
 ├── Subjects
 │    └── Chapters
 │         ├── Revisions
 │         └── Errors
 │
 ├── Exams
 │    └── Exam Subjects / Scope
 │
 └── Daily Plans
      └── Tasks
```

## 3. Planner Design

The planner should not simply sort tasks by due date.

It should consider context.

### Priority Inputs

- Days until exam
- Chapter completion state
- Revision due status
- Confidence
- Error count
- Available time
- Task type

A simple deterministic scoring model is preferable for V1.

Example conceptual score:

```text
priority =
  exam_urgency
  + revision_urgency
  + weakness_score
  + error_score
  + syllabus_score
```

The exact weights should live in one planner module and be easy to tune.

## 4. Exam Urgency

Closer exams receive substantially more weight.

Example:

```text
Exam tomorrow > Exam in 7 days > Exam in 30 days
```

Do not use only a linear difference. A near-term exam should receive disproportionately higher priority.

## 5. Multiple Exam Logic

The planner evaluates all active exams.

Example:

```text
Science: tomorrow
Maths: in 2 days
English: in 10 days
```

The plan may become:

```text
Science: 80%
Maths: 20%
English: 0%
```

If Science is fully prepared, Maths can receive more time.

The planner should not blindly assign every active subject a task every day.

## 6. Available-Time Allocation

Input:

```text
available_minutes = 120
```

The planner ranks candidate tasks and fills the time budget.

Tasks that do not fit are deferred.

Avoid producing a 180-minute plan for a user who has entered 120 available minutes.

## 7. Revision Algorithm

Initial schedule:

```text
Completion
  ↓
+1 day
  ↓
+3 days
  ↓
+7 days
  ↓
+14 days
  ↓
+30 days
```

When the user reviews a chapter, ask for a simple difficulty/confidence response.

Possible result:
- Hard → shorten next interval.
- Medium → normal interval.
- Easy → lengthen next interval.

The algorithm should remain simple and transparent.

## 8. Error Impact

Repeated errors should increase a chapter's weakness score.

For example:

```text
Chapter A: 1 error
Chapter B: 8 errors
```

Chapter B should be more likely to appear in revision planning.

However, errors should not permanently dominate the plan.

Use recency and exam relevance.

## 9. Daily Plan Generation

Generate the plan using:

```text
1. Find active exams.
2. Calculate exam urgency.
3. Find due revisions.
4. Find weak chapters.
5. Find unfinished high-priority chapters.
6. Rank candidate tasks.
7. Allocate available time.
8. Save/generated display plan.
```

The system should be able to regenerate the plan after:
- Completing a task.
- Completing an exam.
- Changing available time.
- Adding a new exam.
- Completing a chapter.

## 10. Error Journal Design

Each error belongs to exactly one chapter.

Because every chapter belongs to a subject, subject-level aggregation is automatic.

Do not duplicate errors into a separate subject-error table.

Query:

```text
Subject
  → Chapters
      → Errors
```

Subject-level journal is therefore a filtered/aggregated view.

## 11. Progress Calculation

Chapter progress:

```text
Not Started = 0
In Progress = 0.5
Completed = 1
```

Subject progress is the average of chapter completion values.

Overall progress is the weighted average across all subjects, unless the user later defines custom weights.

Keep this calculation deterministic.

## 12. Dashboard

The dashboard hierarchy should be:

1. Today's plan
2. Nearest exam
3. Revisions due
4. Progress
5. Errors/weak areas
6. Secondary analytics

The user should not need to scroll through analytics before finding today's work.

## 13. Failure Handling

If there is no available time:
- Show the highest-priority next task.
- Do not fabricate a schedule.

If there are no tasks:
- Show the next upcoming study action or an empty state.

If an exam has no syllabus:
- Do not invent chapters.
- Allow the user to add scope later.

## 14. Manual Override

The user should be able to:
- Complete a task.
- Skip a task.
- Move a task.
- Change available time.
- Change chapter confidence.
- Mark an exam completed.

Manual changes should not corrupt the underlying scheduling data.

## 15. Design Principle

The scheduling engine should be explainable.

When useful, show why a task is prioritized:

> “Science is prioritized because your exam is tomorrow.”

Avoid black-box behavior in V1.
