# StudyOS — Tech Stack

## 1. Architecture

Use a modern full-stack TypeScript web application.

```text
Browser
  ↓
Next.js App Router
  ↓
Server Actions / Route Handlers
  ↓
Supabase
  ├── PostgreSQL
  ├── Auth
  └── Row Level Security
```

## 2. Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide React
- Framer Motion only where animation improves usability

## 3. Backend

### Supabase

Use Supabase for:
- PostgreSQL database
- Authentication
- Row Level Security
- Optional future storage

Avoid creating a separate backend server for V1.

## 4. Data Fetching

Use:
- Server Components for server-rendered data where practical.
- Server Actions for mutations.
- TanStack Query only where client-side caching/interactive synchronization provides real value.

Do not add state-management complexity unnecessarily.

## 5. Client State

Prefer:
- URL state for filters/navigation.
- React state for local UI state.
- Zustand only for genuinely shared client state.

Do not put server data into a global store.

## 6. Forms and Validation

- React Hook Form
- Zod

Validate important inputs both client-side and server-side.

## 7. Dates

Use a consistent timezone strategy.

Store timestamps in UTC where appropriate, while displaying dates in the user's local timezone.

A study date such as an exam date should be treated as a calendar date, not accidentally shifted because of timezone conversion.

## 8. Charts

Use Recharts only for useful progress visualizations.

Avoid charts when a simple number/progress bar communicates the information better.

## 9. Authentication

For personal V1:
- Supabase email/password or magic-link authentication is sufficient.
- Keep the architecture ready for a single-user development mode.

## 10. Deployment

- Vercel for application hosting.
- Supabase for backend/database.

## 11. Development Tools

Recommended:
- VS Code
- Git
- GitHub
- ESLint
- Prettier
- TypeScript strict mode

## 12. Testing

### Unit
- Vitest

Test:
- Revision scheduling
- Priority scoring
- Progress calculations
- Capacity allocation

### End-to-End
- Playwright

Test critical flows:
- Create subject
- Add chapter
- Create exam
- Complete chapter
- Generate revision
- Create error
- Generate daily plan
- Complete exam

## 13. Future Tools

Optional later:
- PostHog for product analytics
- Sentry for error monitoring
- Web Push for notifications
- AI API for recommendations

Do not add these until they solve a real need.

## 14. Environment Variables

Example:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Add AI keys only when AI functionality is implemented.

## 15. Engineering Principles

- TypeScript strict.
- Reusable components.
- Small functions.
- Server-side authorization.
- Database constraints where useful.
- No duplicated scheduling logic.
- Keep algorithms deterministic and testable.
- Avoid premature abstractions.
