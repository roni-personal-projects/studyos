# StudyOS — Tools & Design Workflow

## 1. Google Stitch

Use Google Stitch for rapid UI exploration and initial screen generation.

### Stitch Prompt

Design a modern, mobile-first personal study operating system called **StudyOS**.

The product helps one student manage subjects, chapters, multiple exams, automatic spaced-repetition revisions, daily study plans, syllabus progress, and error journals.

The most important screen is the Dashboard. It should immediately answer:

> What should I study right now?

Design these screens:
1. Dashboard
2. Subjects
3. Subject Detail
4. Chapter Detail
5. Exams
6. Exam Detail
7. Daily Plan
8. Revision Queue
9. Error Journal
10. Chapter Error Journal
11. Settings

The Dashboard should prioritize today's tasks and the nearest exam. If an exam is tomorrow, it should dominate the daily plan. Do not give equal weight to every subject.

The UI should be minimal, calm, modern, mobile-first, and highly readable. Use generous whitespace, subtle borders, restrained shadows, rounded cards, and one primary accent color. Avoid excessive gradients, glassmorphism, gamification, motivational quotes, leaderboards, and decorative clutter.

Use clear task cards, progress indicators, exam countdowns, confidence indicators, and error summaries.

The Error Journal must support both:
- Errors within a specific chapter.
- A subject-wide view aggregating errors from all chapters.

Make the interface feel like a personal planning tool rather than a school administration portal.

## 2. Figma

Use Figma when:
- Stitch output needs refinement.
- Components need consistent variants.
- You want to establish spacing/typography tokens.
- You need to inspect mobile and desktop states.

## 3. Excalidraw

Use Excalidraw for:
- User-flow diagrams.
- Architecture sketches.
- Planner logic diagrams.

## 4. Coding

Recommended:
- VS Code
- GitHub
- AI coding assistant such as Codex
- Browser DevTools

## 5. Supabase

Use the Supabase dashboard for:
- Database inspection
- Auth configuration
- SQL migrations
- RLS testing

## 6. Vercel

Use Vercel for:
- Preview deployments
- Production deployment
- Environment variables

## 7. Workflow

```text
Requirements
    ↓
PRD
    ↓
User Flow
    ↓
Stitch UI exploration
    ↓
Design refinement
    ↓
Database schema
    ↓
Architecture
    ↓
Scaffold application
    ↓
Build feature-by-feature
    ↓
Test
    ↓
Deploy
```

## 8. Feature Build Order

Build in this order:

1. App shell
2. Subjects
3. Chapters
4. Exams
5. Dashboard
6. Basic task system
7. Revision engine
8. Multi-exam planner
9. Error journal
10. Subject error aggregation
11. Progress
12. Polish

Do not start with AI.

## 9. Testing Tools

- Vitest
- Playwright
- Browser DevTools

The most important tests are planner tests because incorrect scheduling directly damages the app's core purpose.
