# CLAUDE.md — Namo Volunteer Management Platform

> This file is the persistent context for Claude Code. Read it fully before making any changes.
> When in doubt, refer to `Namo_Product_Spec_MVP.md` for detailed requirements.
> For UI/visual decisions, refer to `DESIGN_GUIDE.md` for key design characteristics and visual language.

---

## 1. Project Overview

**Namo** is a web application for a volunteer association to manage event registration, waitlists, attendance tracking, and email notifications. It replaces a manual Google Calendar + Excel workflow.

- ~50–200 registered volunteers (Volontari), 3–5 Super Admins, variable external users (Utenti Esterni)
- Italian UI only (hardcoded, no i18n framework needed)
- Mobile-first: volunteers use it on their phones between activities

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15** (App Router, TypeScript) | Server Components + Server Actions for all mutations |
| Database & Auth | **Supabase** (PostgreSQL + RLS + Auth + Storage + Realtime) | RLS is the authoritative access control layer |
| ORM | **Drizzle ORM** | Schema lives in `/src/db/schema.ts` — single source of truth |
| UI | **shadcn/ui + Tailwind CSS** | Components in `/src/components/ui/` |
| Email | **Resend + React Email** | Templates in `/src/emails/` |
| Hosting | **Vercel** | Deploy from `main` branch |
| Background Jobs | **Supabase Edge Functions + pg_cron** | Attendance auto-mark and reminder emails |
| Monitoring | **Sentry + Vercel Analytics** | No PII in Sentry breadcrumbs |
| Testing | **Vitest** (unit) + **Playwright** (e2e) | |
| Package manager | **pnpm** | Always use `pnpm`, never npm or yarn |

---

## 3. Folder Structure

```
/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Login, register, password-reset pages
│   │   ├── (app)/                  # Protected routes (requires session)
│   │   │   ├── calendario/         # Event calendar (volunteer view)
│   │   │   ├── dashboard/          # Volunteer personal dashboard
│   │   │   └── admin/              # Admin-only routes
│   │   │       ├── eventi/         # Event management
│   │   │       ├── utenti/         # User management
│   │   │       ├── audit/          # Audit log
│   │   │       └── export/         # Data export
│   │   ├── eventi/                 # Public Aperto events (no auth)
│   │   └── api/                    # Custom API routes (webhooks, .ics, CSV)
│   ├── components/
│   │   ├── ui/                     # shadcn/ui base components (do not edit)
│   │   └── [feature]/              # Feature-specific components
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema — ALL table definitions here
│   │   ├── migrations/             # Drizzle migration files
│   │   └── index.ts                # Drizzle client
│   ├── features/                   # Business logic, colocated by feature
│   │   ├── auth/
│   │   ├── events/
│   │   ├── registrations/
│   │   ├── users/
│   │   ├── notifications/
│   │   └── attendance/
│   ├── emails/                     # React Email templates
│   ├── lib/
│   │   ├── supabase/               # Supabase client helpers (server + browser)
│   │   ├── utils.ts
│   │   └── constants.ts
│   └── types/                      # Shared TypeScript types and enums
├── supabase/
│   ├── migrations/                 # Supabase SQL migrations (RLS policies, triggers)
│   └── functions/                  # Supabase Edge Functions
├── tests/
│   ├── unit/                       # Vitest unit tests
│   └── e2e/                        # Playwright e2e tests
├── public/
├── .env.local                      # NEVER commit this
└── CLAUDE.md                       # This file
```

---

## 4. Database Schema (`/src/db/schema.ts`)

All Drizzle table definitions live here. Key tables:

| Table | Purpose |
|---|---|
| `users` | Internal volunteers and admins. `role`: `super_admin` \| `volontario`. `status`: `pending` \| `active` \| `suspended` \| `deactivated`. `phone_encrypted` stored encrypted. |
| `user_tags` | Qualification tags (e.g. "Clown Terapia Certificato"). Admin-managed. |
| `user_tag_assignments` | Many-to-many: users ↔ tags |
| `events` | All events. `type`: `interno` \| `aperto`. `status`: `draft` \| `published` \| `cancelled` \| `archived`. `clone_series_id` groups bulk-cloned events. |
| `registrations` | Internal volunteer registrations. `status`: `confirmed` \| `waitlist` \| `cancelled`. `attendance_status`: `present` \| `absent` \| `no_show`. |
| `external_registrations` | No-account registrations for Aperto events. Has `cancel_token` (UUID) for tokenised email cancellation. |
| `audit_log` | Append-only. Records all admin actions with `before_state`/`after_state` (JSONB). NEVER UPDATE or DELETE. |
| `notification_preferences` | Per-user opt-out of informational emails (transactional emails cannot be opted out). |

---

## 5. User Roles & Access Control

**THREE roles only:**
- `super_admin` — full access to everything
- `volontario` — can register for events, view own data
- External users — no account, register for `aperto` events via just-in-time form

**Critical rule:** All access control MUST be enforced server-side (Server Actions / API routes) AND at the database layer (Supabase RLS). Client-side checks are UI-only conveniences.

**Key RLS rules:**
- `users.phone_encrypted` — never returned to non-admin
- `events` — volontario sees only `status=published`; esterno sees only `published + type=aperto`
- `registrations` — volontario can read/write own rows; no DELETE; admin reads all
- `audit_log` — INSERT only for authenticated; SELECT only for `super_admin`; no UPDATE/DELETE ever

---

## 6. Event Types & Registration Logic

**Event types:**
- `interno` — visible only to authenticated volunteers
- `aperto` — publicly visible, external users can register

**Registration states:** `confirmed` → `waitlist` → `cancelled`

**Waitlist rules:**
- FIFO order
- Waitlist position = computed (`COUNT` of waitlisted rows with earlier `registered_at`), NOT stored as a mutable integer
- On cancellation: auto-promote first waitlisted volunteer, send promotion email with tokenised refusal link
- External users: NO waitlist in MVP. If `aperto` event is full, they see "evento al completo" and cannot register.

**Attendance (trust model):**
- After event end: all confirmed (non-cancelled) registrants auto-marked `present` via `pg_cron`
- Admin can correct during configurable grace period. After grace period, records are immutable.
- All corrections logged in `audit_log`.

**Recurring events:** Clone-based only. `clone_series_id` groups related events. No pattern/rule engine.

---

## 7. Key Conventions

### TypeScript
- Strict mode enabled. No `any` types.
- Use `zod` for all input validation on API routes and Server Actions.
- Enums live in `/src/types/enums.ts` and mirror Drizzle schema enums.

### Server Actions vs API Routes
- **Server Actions** for all authenticated mutations (register, cancel, admin operations).
- **API Routes** (`/api/`) for: webhooks from Resend, tokenised public links (external cancel, waitlist refusal), .ics downloads, CSV exports.

### Naming conventions
- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Drizzle tables: `snake_case` (matches PostgreSQL convention)
- TypeScript types derived from Drizzle: exported from `/src/db/schema.ts`

### Error handling
- All errors return Italian user-facing messages (never English strings in production UI)
- Standard API error shape:
```json
{ "error": "HUMAN_READABLE_CODE", "message": "Messaggio in italiano", "details": {} }
```
- HTTP codes: 200, 201, 400, 401, 403, 404, 409, 500

### Audit logging
- Every admin action MUST create an `audit_log` entry.
- Helper: `await createAuditEntry({ actorId, actionType, entityType, entityId, beforeState, afterState })`
- `actionType` values: `EVENT_CREATED`, `EVENT_UPDATED`, `EVENT_CANCELLED`, `EVENT_DELETED`, `REGISTRATION_CANCELLED_BY_ADMIN`, `ATTENDANCE_CORRECTED`, `CAPACITY_OVERRIDE`, `USER_APPROVED`, `USER_SUSPENDED`, `USER_DEACTIVATED`, `USER_DELETED`, `WAITLIST_ORDER_OVERRIDE`, `ROLE_CHANGED`

---

## 8. Email Notifications (Resend + React Email)

Templates in `/src/emails/`. 7 types (all transactional except `new_event_in_sector`):

| Template file | Trigger | Recipient |
|---|---|---|
| `registration-confirmed.tsx` | Volunteer confirms registration | Volunteer |
| `registration-cancelled.tsx` | Volunteer or admin cancels | Volunteer |
| `waitlist-promotion.tsx` | Spot opens up, volunteer promoted | Promoted volunteer (includes refusal link) |
| `event-reminder.tsx` | X hours before event (`reminder_hours`) | All confirmed volunteers |
| `event-modified.tsx` | Admin edits published event | All registered volunteers |
| `new-event-in-sector.tsx` | Admin publishes event | Volunteers with matching sector preference (can opt out) |
| `account-approved.tsx` | Admin approves pending account | New volunteer |
| `external-registration-confirmed.tsx` | External user registers | External user (includes cancel link) |

**All emails sent within 60 seconds of trigger event.**
Volunteers who have cancelled do NOT receive reminders (filter on query).
`informational_emails_enabled=false` suppresses only `new-event-in-sector` type.

---

## 9. Environment Variables

```bash
# Public (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=          # e.g. https://namo.vercel.app

# Server-only (NEVER prefix with NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=    # Used only in server actions / API routes
RESEND_API_KEY=
SENTRY_DSN=                   # Optional for MVP
```

Never commit `.env.local`. Use Vercel dashboard for preview/production secrets.

---

## 10. Key Commands

```bash
pnpm dev                      # Start dev server (localhost:3000)
pnpm build                    # Production build
pnpm typecheck                # tsc --noEmit
pnpm lint                     # ESLint
pnpm test                     # Vitest unit tests
pnpm test:e2e                 # Playwright e2e tests
pnpm db:generate              # Generate Drizzle migration
pnpm db:push                  # Apply schema to local Supabase
pnpm db:studio                # Open Drizzle Studio
```

---

## 11. Supabase Client Usage

```ts
// For SERVER components, server actions, and API routes — has full access
import { createServerClient } from '@/lib/supabase/server'

// For CLIENT components — limited to anon/user permissions, RLS enforced
import { createBrowserClient } from '@/lib/supabase/browser'

// NEVER use the service role key in client components
```

---

## 12. UI Components

- Use **shadcn/ui** components as base (Button, Dialog, Form, Table, etc.)
- shadcn components live in `/src/components/ui/` — do not edit them directly
- Build feature components on top: `/src/components/events/EventCard.tsx`, etc.
- All forms use **react-hook-form + zod** (shadcn Form component)
- Responsive breakpoints: mobile-first. Core volunteer flows MUST work at 375px. Admin tables MAY require min 768px.

---

## 13. Definition of Done (per feature)

Before marking any feature complete:
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Unit tests pass for all business logic (`/features/**`)
- [ ] RLS policies written and tested for affected tables
- [ ] Server-side auth check on every protected route/action
- [ ] Italian copy used everywhere (no English strings in UI)
- [ ] All UI states implemented: loading, empty, error, success, permission-denied
- [ ] Audit log entry created for all admin actions
- [ ] No secrets committed

---

## 14. Build Milestones

| Milestone | Focus |
|---|---|
| **M1 — Foundation** | Next.js scaffold, Drizzle schema + RLS, Supabase auth (email + Google OAuth), volunteer registration + admin approval, layout + routing |
| **M2 — Event Management** | Event CRUD, draft/publish, Interno/Aperto types, clone + bulk-clone, calendar view, event detail page |
| **M3 — Registration & Waitlist** | Registration flow, FIFO waitlist, overlap warning, tag restriction, external user JIT registration (no waitlist) |
| **M4 — Cancellation & Attendance** | Cancellation (late-flag), admin cancel, waitlist auto-promotion, trust-model auto-mark (pg_cron), admin attendance correction |
| **M5 — Notifications** | All 8 email templates, notification preferences, reminder job (pg_cron), external cancellation token flow |
| **M6 — Dashboards & Export** | Volunteer dashboard, admin user management, audit log view, CSV/Excel export, .ics download |
| **M7 — Polish & Launch** | Italian copy review, mobile pass, empty/error/loading states, Sentry, GDPR deletion, load test, production deploy |

**Currently targeting:** M1

---

## 15. Known Decisions (ADRs)

- **Auth:** Supabase Auth (email+password + Google OAuth). External users have NO account.
- **Access control:** Supabase RLS as defence-in-depth. Application code also checks permissions.
- **Attendance:** Trust model — confirmed = present automatically. Admin corrects exceptions.
- **Late cancellation:** Flagged but NEVER blocked. Volunteer can always cancel.
- **External waitlist:** NOT in MVP. If Aperto event is full, external user is turned away.
- **Recurring events:** Clone-based only. No recurrence rule engine.
- **Waitlist position:** Computed value (COUNT), not stored integer, to prevent drift on admin overrides.

---

## 16. Out of Scope (MVP)

Do NOT implement these:
- Sector Admin role (V2)
- Compagno Adulto hour tracking (V2)
- SMS / push notifications
- Multi-language / i18n
- Live iCal webcal:// subscription feed
- Automated PDF reports
- Payment processing
- Sub-event / time-slot structure

---

---

## 17. Skills Reference

The following skills are installed globally and available to Claude Code. Invoke them with `/skill-name` when working on the relevant area.

### Backend & Infrastructure

| Skill | Invoke | When to use |
|---|---|---|
| `nextjs-supabase-auth` | `/nextjs-supabase-auth` | Whenever setting up or modifying auth flows, middleware, session handling, or Supabase client config |
| `supabase-postgres-best-practices` | `/supabase-postgres-best-practices` | Writing RLS policies, pg_cron jobs, Edge Functions, Postgres functions/triggers |
| `nextjs-best-practices` | `/nextjs-best-practices` | App Router conventions, Server Actions, `use client` boundaries, caching strategy |
| `drizzle-orm` | `/drizzle-orm` | Schema definitions, relations, queries, transactions, migrations in `/src/db/` |
| `react-email` | `/react-email` | Building the 8 email templates in `/src/emails/` — layout, components, CSS constraints |
| `resend` | `/resend` | Resend API integration, delivery webhooks, error handling, test mode setup |
| `playwright-e2e-testing` | `/playwright-e2e-testing` | Writing e2e tests in `/tests/e2e/`, auth fixtures, CI configuration |

### Frontend & Design

| Skill | Invoke | When to use |
|---|---|---|
| `frontend-design` | `/frontend-design` | **Always invoke first** when building any new page, component, or UI section. Ensures high design quality; avoids generic AI aesthetics |
| `shadcn-ui` | `/shadcn-ui` | Adding or composing shadcn/ui components, form patterns, dialog/modal structure |
| `tailwind-theme-builder` | `/tailwind-theme-builder` | Configuring Tailwind theme tokens, colour palette, spacing scale — align with DESIGN_GUIDE.md |
| `responsive-design` | `/responsive-design` | Implementing responsive layouts, breakpoint strategy, mobile-first patterns |
| `tailwind-responsive-design` | `/tailwind-responsive-design` | Tailwind-specific responsive utilities, container queries, adaptive component variants |

> **Note on `playwright-e2e-testing`:** The Gen security assessor flagged this as "Critical Risk" — this appears to be a false positive (Socket shows 0 alerts, Snyk shows Low Risk). The skill covers standard test automation patterns. Review it before use if concerned.

---

## 18. Design Guide & Frontend Rules

**This is mandatory, not optional.** Every page and component built for Namo must follow these rules.

### Primary references
- **`DESIGN_GUIDE.md`** — visual language of the app: colour palette, typography, spacing, component style, tone, and brand guidelines. Read before touching any UI.
- **`/frontend-design` skill** — production-grade design patterns; invoke at the start of every UI session to avoid generic AI aesthetics.

### Frontend design rules (enforce on every PR)

1. **Always read `DESIGN_GUIDE.md` before building any UI.** Do not pick colours, fonts, or spacing from intuition — use the tokens defined there.

2. **Always invoke `/frontend-design` before building a new page or component.** This skill enforces distinctive, polished UI. Never skip it.

3. **Always invoke `/responsive-design` and `/tailwind-responsive-design` when building layouts.** Every layout must be mobile-first; core volunteer flows must work at 375px.

4. **Use `/tailwind-theme-builder` when translating design tokens** from `DESIGN_GUIDE.md` into `tailwind.config.ts`. Do not hardcode colour values in components — use CSS variables / theme tokens.

5. **Use `/shadcn-ui` for all component composition.** Do not write raw form, dialog, or table HTML — build on shadcn primitives and customise via `className` / `variants`.

6. **Responsive breakpoints:**
   - `375px` — minimum: all volunteer flows fully functional
   - `768px` — tablet: admin tables and multi-column layouts unlock
   - `1280px` — desktop: full sidebar nav, wider content areas

7. **UI copy is Italian only.** No English strings in production UI. When uncertain of phrasing, add `{/* TODO: Italian copy */}` and flag it.

8. **All UI states must be implemented:** loading skeleton, empty state (never a blank page), error state (Italian message), success feedback, permission-denied screen.

---

*Last updated: 23 February 2026 — Namo MVP v1.0*
