# StudyOS — UI Guidelines

## 1. Design Direction

StudyOS should feel:
- Calm
- Minimal
- Focused
- Fast
- Personal
- Modern

Reference the clarity of products such as Linear and Raycast without copying them.

Avoid making it look like:
- A gaming app
- A generic school portal
- A Notion clone
- A dashboard full of charts

## 2. Primary UX Principle

The user should understand:

> **What should I study right now?**

within a few seconds of opening the dashboard.

## 3. Navigation

Primary navigation:

```text
Dashboard
Subjects
Exams
Revisions
Errors
Settings
```

On mobile, use a compact bottom navigation or adaptive navigation pattern.

## 4. Dashboard Hierarchy

```text
Greeting / Date

Today's Plan
  ↓
Nearest Exam
  ↓
Revisions Due
  ↓
Progress
  ↓
Weak Areas / Errors
```

## 5. Visual Hierarchy

Use:
- Large clear headings.
- Compact metadata.
- Strong task titles.
- Subtle status indicators.
- Progress bars where useful.

Do not use excessive badges.

## 6. Colors

Use a neutral base with one primary accent.

Status colors should be meaningful:
- Success
- Warning
- Error
- Neutral

Do not make every card a different color.

## 7. Typography

Recommended:
- Geist
- Inter

Use a limited type scale.

## 8. Components

Create reusable:
- Button
- Input
- Select
- Dialog
- Sheet
- Card
- Progress
- Badge
- Tabs
- Table/List
- Empty State
- Skeleton
- Toast

Use shadcn/ui as the base.

## 9. Task Card

A task should clearly communicate:

```text
Task name
Subject / chapter
Estimated time
Why it is prioritized
Complete action
```

Example:

```text
Review Carbon — Errors
Science · Carbon
25 min

Exam tomorrow · 6 unresolved errors

[Complete]
```

## 10. Exam Card

Show:
- Exam name
- Date
- Days remaining
- Subjects
- Preparation state

The nearest exam should be visually prominent.

## 11. Error Journal

Make adding an error fast.

Required:
- Mistake type
- What went wrong

Optional:
- Question
- Correct method
- Lesson learned

Do not force the user through a long form.

## 12. Empty States

Empty states should provide a clear action.

Example:

```text
No exams yet.

Add your next exam to let StudyOS
build an exam-aware plan.

[Add Exam]
```

## 13. Responsive Design

Mobile-first.

Desktop should use the additional width for:
- Two-column layouts
- Side-by-side subject/exam information
- Wider error tables

Do not simply stretch the mobile UI.

## 14. Accessibility

- Keyboard navigable.
- Visible focus states.
- Proper labels.
- Sufficient contrast.
- Touch targets large enough for mobile.
- Do not communicate status using color alone.

## 15. Animation

Use animation sparingly.

Good:
- Task completion
- Dialog transitions
- Progress updates
- Page transitions

Avoid:
- Constant moving backgrounds
- Excessive hover effects
- Distracting celebration animations
