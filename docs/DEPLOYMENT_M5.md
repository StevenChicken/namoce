# M5 Notifications — Deployment Instructions

> For Antigravity to execute via browser use + Vercel MCP + GitHub

---

## 1. Database Migration (ALREADY DONE)

The `reminder_sent_at` column has already been added to the `events` table via `pnpm db:push`. No action needed.

---

## 2. Vercel Environment Variable: CRON_SECRET

### What
Add a new environment variable to the Vercel project to secure the cron endpoint.

### Where
Vercel Dashboard → Project **namo** (or **namoce**) → Settings → Environment Variables

### Variable to add

| Key | Value | Environments |
|-----|-------|-------------|
| `CRON_SECRET` | `eda1f3804c61d602eaeb6ed342c948431797ea9f517effb59ee990dd256037a7` | Production, Preview |

### Why
The reminder cron endpoint (`/api/cron/send-reminders`) checks this secret in the `Authorization: Bearer <token>` header. Vercel Cron Jobs automatically send this header when the variable is named `CRON_SECRET`.

---

## 3. Verify Existing Environment Variables

Ensure these are already set on Vercel (they should be from previous milestones):

| Key | Type | Required |
|-----|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes |
| `NEXT_PUBLIC_APP_URL` | Public | Yes — used for all email links |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Yes — used by HMAC token helper as fallback |
| `RESEND_API_KEY` | Secret | Yes — for sending emails |

### Important: `NEXT_PUBLIC_APP_URL`
This variable is used to build all links in emails (calendar links, cancel links, refuse links, unsubscribe links). Make sure it's set to the production URL (e.g., `https://namo.vercel.app` or your custom domain) **without** a trailing slash.

---

## 4. Deploy

### Option A: Push to main (if auto-deploy is enabled)
The code is ready on the local branch. Push to `main` on GitHub and Vercel will auto-deploy.

### Option B: Manual deploy via Vercel Dashboard
Vercel Dashboard → Project → Deployments → Redeploy latest

---

## 5. Verify After Deploy

### 5.1 Cron Job Active
Go to Vercel Dashboard → Project → Settings → Cron Jobs. You should see:

| Path | Schedule |
|------|----------|
| `/api/cron/send-reminders` | Every 15 minutes (`*/15 * * * *`) |

This is defined in `vercel.json` at the project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### 5.2 Test the cron endpoint manually
```
curl -H "Authorization: Bearer eda1f3804c61d602eaeb6ed342c948431797ea9f517effb59ee990dd256037a7" \
  https://<your-vercel-url>/api/cron/send-reminders
```
Expected response: `{"success":true,"eventsProcessed":0,"remindersSent":0}`

### 5.3 Test the profile page
Visit `/profilo` while logged in. Should show user info and notification preferences toggle.

### 5.4 Test email sending
1. Create a draft event with sectors matching a volunteer's sectorsOfInterest
2. Publish the event → volunteer should receive "Nuovo evento" email
3. Register a volunteer → should receive "Iscrizione confermata" email
4. Cancel a registration → should receive "Iscrizione annullata" email

---

## 6. Resend Configuration

### From address
All emails are sent from: `Namo APS <noreply@namo.app>`

Make sure:
- The domain `namo.app` is verified in Resend Dashboard
- Or you're using Resend's test/sandbox mode for development

### Resend Dashboard
Check delivery logs at: https://resend.com/emails

---

## 7. GitHub Repository

The project repository should be connected to Vercel for auto-deploys. All M5 changes are on the local codebase and need to be pushed to GitHub.

### Files changed/added in M5

**New files (22):**
- `src/emails/registration-confirmed.tsx`
- `src/emails/registration-cancelled.tsx`
- `src/emails/waitlist-promotion.tsx`
- `src/emails/event-reminder.tsx`
- `src/emails/event-modified.tsx`
- `src/emails/new-event-in-sector.tsx`
- `src/emails/external-registration-confirmed.tsx`
- `src/features/notifications/email-helpers.ts`
- `src/features/notifications/queries.ts`
- `src/features/notifications/actions.ts`
- `src/features/notifications/schemas.ts`
- `src/features/notifications/token-helpers.ts`
- `src/features/notifications/send-registration-confirmed.ts`
- `src/features/notifications/send-registration-cancelled.ts`
- `src/features/notifications/send-waitlist-promotion.ts`
- `src/features/notifications/send-event-reminder.ts`
- `src/features/notifications/send-event-modified.ts`
- `src/features/notifications/send-new-event-in-sector.ts`
- `src/features/notifications/send-external-registration-confirmed.ts`
- `src/app/api/cron/send-reminders/route.ts`
- `src/app/api/registrations/[registrationId]/refuse-promotion/route.ts`
- `src/components/profile/notification-preferences-form.tsx`
- `supabase/migrations/003_reminder_sent.sql`
- `vercel.json`

**Modified files (4):**
- `src/db/schema.ts` — added `reminderSentAt` to events
- `src/features/registrations/actions.ts` — wired 4 email triggers, exported promoteFromWaitlist
- `src/features/events/actions.ts` — wired 3 email triggers + buildChangesSummary helper
- `src/features/notifications/send-account-approved.ts` — refactored to use shared helpers
- `src/app/(app)/profilo/page.tsx` — full profile page with notification preferences

---

## Summary Checklist

- [x] Database migration applied (`reminder_sent_at` column)
- [ ] Set `CRON_SECRET` env var on Vercel
- [ ] Verify `NEXT_PUBLIC_APP_URL` is set correctly
- [ ] Verify `RESEND_API_KEY` is set
- [ ] Push code to GitHub / Deploy to Vercel
- [ ] Verify cron job appears in Vercel dashboard
- [ ] Test cron endpoint with curl
- [ ] Test profile page
- [ ] Test email sending (optional smoke test)
