# M7 Polish & Launch — Deployment Instructions

> For Antigravity to execute via browser use + Vercel MCP + GitHub

---

## 1. Database Migrations

No new database migrations needed for M7. All schema changes from previous milestones are already applied.

---

## 2. Vercel Environment Variables

### New variable to add

| Key | Value | Environments |
|-----|-------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | *(get from Sentry dashboard)* | Production, Preview |

### How to get the Sentry DSN
1. Go to [sentry.io](https://sentry.io) and create an account (or log in)
2. Create a new project → Platform: **Next.js**
3. Copy the DSN from the project settings (looks like `https://xxxx@xxxx.ingest.sentry.io/xxxx`)
4. Add it as `NEXT_PUBLIC_SENTRY_DSN` on Vercel

> **Note:** Sentry is optional for launch. The app works fine without it — errors just won't be monitored remotely. You can add the DSN later.

---

## 3. Verify Existing Environment Variables

Ensure all these are set on Vercel (from previous milestones):

| Key | Type | Required |
|-----|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes |
| `NEXT_PUBLIC_APP_URL` | Public | Yes — used for all email links |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Yes |
| `RESEND_API_KEY` | Secret | Yes — for sending emails |
| `CRON_SECRET` | Secret | Yes — for cron endpoint auth |

---

## 4. Deploy

Push to `main` on GitHub. Vercel will auto-deploy.

---

## 5. Verify After Deploy

### 5.1 Error pages
- Visit a non-existent URL (e.g., `/pagina-inesistente`) → should show branded 404 page in Italian
- Error boundaries are automatically active for runtime errors

### 5.2 Loading states
- Navigate between pages → should see skeleton loading states (not blank pages)

### 5.3 GDPR deletion
- Log in as a volunteer → go to `/profilo` → scroll to bottom
- "Eliminazione account" card should be visible with red button

### 5.4 Sentry (if DSN configured)
- Check Sentry dashboard for any errors
- Errors in production will be automatically captured

### 5.5 All pages functional
| Page | URL | Expected |
|------|-----|----------|
| Dashboard | `/dashboard` | Upcoming events, attendance summary, recent activity, export buttons |
| Calendar | `/calendario` | Event calendar with registration |
| Profile | `/profilo` | User info, notification prefs, account deletion |
| Admin Events | `/admin/eventi` | Events table, create/edit/clone/cancel |
| Admin Users | `/admin/utenti` | Pending approvals, user table with search/filter/actions |
| Admin Audit | `/admin/audit` | Paginated audit log with filters |
| Admin Export | `/admin/export` | Date range picker, CSV download |
| Public Events | `/eventi` | Public events listing |

---

## 6. Post-Launch Checklist

- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` on Vercel (optional but recommended)
- [ ] Verify all existing env vars are correct
- [ ] Push code to GitHub / Deploy
- [ ] Test 404 page
- [ ] Test loading states
- [ ] Test GDPR deletion flow on profile
- [ ] Test all core flows: login, register, event management, attendance
- [ ] Verify email delivery (Resend dashboard)
- [ ] Verify cron job (Vercel dashboard → Settings → Cron Jobs)

---

## 7. What's New in M7

**New files (17):**
- `src/app/error.tsx` — Root error boundary
- `src/app/not-found.tsx` — 404 page
- `src/app/global-error.tsx` — Global error boundary (Sentry capture)
- `src/app/(app)/error.tsx` — App error boundary
- `src/app/(auth)/error.tsx` — Auth error boundary
- `src/app/(app)/dashboard/loading.tsx`
- `src/app/(app)/profilo/loading.tsx`
- `src/app/(app)/admin/utenti/loading.tsx`
- `src/app/(app)/admin/eventi/loading.tsx`
- `src/app/(app)/admin/eventi/[eventId]/loading.tsx`
- `src/app/(app)/admin/audit/loading.tsx`
- `src/app/(app)/admin/export/loading.tsx`
- `src/components/profile/delete-account-dialog.tsx`
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `src/instrumentation.ts`

**Modified files (4):**
- `next.config.ts` — wrapped with Sentry config
- `src/features/users/actions.ts` — added requestAccountDeletion, deleteUserData
- `src/types/enums.ts` — added ACCOUNT_DELETION_REQUESTED
- `src/app/(app)/profilo/page.tsx` — added account deletion card

**New dependency:**
- `@sentry/nextjs`
