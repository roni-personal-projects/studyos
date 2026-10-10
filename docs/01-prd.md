# StudyOS — Product Requirements Document

## 1. Product Vision

StudyOS is a personal study operating system that answers one question every day:

> **What should I study next?**

It combines syllabus tracking, multiple exam dates, automatic revision scheduling, daily tasks, progress tracking, and error journals into one simple workflow.

The product is being built for personal use first. It should prioritize usefulness and low friction over social features, gamification, or unnecessary complexity.

## 2. Problem

Normal study trackers require the student to manually decide:
- What to study today
- Which exam should get priority
- When a completed chapter should be revised
- Which weak chapters need attention
- Which mistakes should be reviewed

StudyOS should automate most of this planning.

## 3. Core Principle

Every feature must either:
1. Reduce planning effort, or
2. Improve learning/retention.

If a feature does neither, it should not be part of the MVP.

## 4. Target User

### V1
A single student using the application for their own school/board/JEE-related preparation.

No multi-user, social, teacher, or classroom functionality is required.

## 5. Goals

- Provide a clear daily study plan.
- Track syllabus completion at subject and chapter level.
- Support multiple exams simultaneously.
- Prioritize study based on exam urgency and learning state.
- Automatically schedule revisions.
- Track confidence and mistakes.
- Aggregate chapter errors into a subject-wide error journal.
- Make progress visible without creating distraction.

## 6. Non-Goals

Do not build in V1:
- Social feeds
- Leaderboards
- Friends
- Teacher dashboards
- Public profiles
- Full note-taking application
- AI chatbot/tutor
- Complex calendar synchronization
- Advanced gamification
- Marketplace
- Native mobile applications

## 7. Core Features

### 7.1 Dashboard

Show:
- Today's study plan
- Revision tasks due today
- Nearest upcoming exams
- Overall syllabus progress
- Subject progress
- Study time for today if tracked
- Important overdue tasks

The daily plan should be the dominant element.

### 7.2 Subjects

Each subject contains:
- Name
- Optional icon
- Chapters
- Exams
- Progress percentage
- Error journal
- Revision statistics

### 7.3 Chapters

Each chapter contains:
- Name
- Subject
- Status: Not Started / In Progress / Completed
- Confidence: 1–5
- Completion date
- Revision history
- Error journal entries

### 7.4 Exams

Users can create multiple exams.

Each exam contains:
- Name
- Date
- Linked subjects
- Optional syllabus scope
- Status: Upcoming / Completed

Multiple exams must be considered together when generating the daily plan.

Example:
- Science exam tomorrow
- Maths exam in two days

Today's plan should prioritize Science and should not treat both exams equally.

### 7.5 Daily Study Planner

The planner generates tasks using:
- Exam urgency
- Remaining syllabus
- Revision tasks due
- Chapter confidence
- Error count
- Available study time
- Task completion status

The user can manually override or complete tasks, but does not need to manually construct the entire plan.

### 7.6 Revision Planner

After a chapter is completed, schedule revisions using an initial spaced-repetition schedule:

- +1 day
- +3 days
- +7 days
- +14 days
- +30 days

The schedule is adjustable based on confidence/review outcome.

A difficult review should produce a shorter next interval. An easy review can produce a longer interval.

### 7.7 Progress Tracking

Track:
- Subject completion %
- Overall syllabus completion %
- Completed chapters
- Chapters remaining
- Revisions completed
- Revision tasks due
- Error count

Avoid turning the dashboard into a wall of statistics.

### 7.8 Error Journal

Every error can contain:
- Subject
- Chapter
- Question/problem
- Mistake type
- What went wrong
- Correct method
- Lesson learned
- Date
- Optional review status

Mistake types:
- Concept
- Formula
- Calculation
- Careless
- Misread question
- Time management
- Guess
- Other

### 7.9 Chapter Error Journal

Each chapter shows only its own errors.

### 7.10 Subject Error Journal

Each subject aggregates errors from all chapters.

Allow filtering by:
- Chapter
- Mistake type
- Date
- Review status

This gives the user both granular and subject-wide views.

### 7.11 Exam Completion

When an exam is marked completed:
- Stop planning preparation tasks for that exam.
- Preserve historical data.
- Recalculate priorities using remaining exams.
- Continue normal syllabus/revision tracking where relevant.

## 8. Smart Planning Rules

The planner should prioritize roughly in this order:

1. Exam occurring soonest.
2. Revision tasks that are due.
3. Low-confidence chapters.
4. Chapters with repeated errors.
5. Incomplete high-priority syllabus.
6. Lower-urgency subjects.

This is a starting rule set, not a machine-learning model.

## 9. Capacity-Based Planning

The user can specify available study time for a day.

Example:

```text
Available today: 2h

Science exam tomorrow: 90 min
Maths exam in 2 days: 30 min
Other subjects: 0 min
```

The planner must never create an impossible schedule.

If tasks do not fit:
- Keep the highest-priority tasks.
- Defer lower-priority work.
- Recalculate future days rather than piling everything onto tomorrow.

## 10. Success Criteria

The app succeeds if the user can:
- Add subjects and chapters.
- Add multiple exams.
- Open the dashboard and immediately know what to study.
- Complete chapters and receive automatic revision dates.
- Log mistakes quickly.
- Review all mistakes for a subject across chapters.
- See syllabus progress.
- Have the plan automatically change as exams approach or finish.

## 11. MVP

### Must Have
- Subjects
- Chapters
- Multiple exams
- Dashboard
- Daily planner
- Syllabus progress
- Confidence ratings
- Spaced repetition
- Chapter error journal
- Subject aggregated error journal
- Exam-aware prioritization
- Available-time planning

### Nice to Have
- Study session timer
- Basic notifications
- Weekly summary

### Later
- AI recommendations
- OCR/PDF syllabus import
- Flashcards
- Advanced analytics
- Calendar integration

## 12. Product Philosophy

StudyOS should feel like a calm planning assistant, not another productivity system demanding constant maintenance.
