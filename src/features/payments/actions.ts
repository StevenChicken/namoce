'use server'

import { db } from '@/db'
import { membershipPayments, appSettings } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAuthenticated, requireSuperAdmin } from '@/lib/auth'
import { createAuditEntry } from '@/lib/audit'
import { getStripeClient } from '@/lib/stripe'
import { getMembershipSettings, getUserMembershipPayment } from './queries'
import {
  createMembershipCheckoutSchema,
  markManualPaymentSchema,
  updateMembershipSettingsSchema,
} from './schemas'

// ─── Create Membership Checkout ──────────────────────────

export async function createMembershipCheckout(input: { periodYear: number }) {
  const userId = await requireAuthenticated()
  const parsed = createMembershipCheckoutSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { periodYear } = parsed.data

  // Check if already paid
  const existing = await getUserMembershipPayment(userId, periodYear)
  if (existing) {
    return { error: 'Hai già pagato la quota per questo anno.' }
  }

  const settings = await getMembershipSettings()
  const stripe = getStripeClient()

  // Create pending payment row
  const [payment] = await db
    .insert(membershipPayments)
    .values({
      userId,
      periodYear,
      amountCents: settings.amountCents,
      status: 'pending',
    })
    .returning()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://namo.vercel.app'

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: settings.amountCents,
          product_data: {
            name: `Quota associativa ${periodYear}`,
            description: `Quota di iscrizione annuale Namo APS — Anno ${periodYear}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'membership',
      paymentId: payment.id,
      userId,
      periodYear: String(periodYear),
    },
    success_url: `${appUrl}/profilo?pagamento=successo`,
    cancel_url: `${appUrl}/profilo?pagamento=annullato`,
  })

  // Update with stripe session ID
  await db
    .update(membershipPayments)
    .set({ stripeSessionId: session.id })
    .where(eq(membershipPayments.id, payment.id))

  return { checkoutUrl: session.url }
}

// ─── Mark Manual Payment ─────────────────────────────────

export async function markManualPayment(input: {
  userId: string
  periodYear: number
  notes?: string
}) {
  const adminId = await requireSuperAdmin()
  const parsed = markManualPaymentSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { userId, periodYear, notes } = parsed.data

  // Check if already paid
  const existing = await getUserMembershipPayment(userId, periodYear)
  if (existing) {
    return { error: 'Questo volontario ha già pagato per questo anno.' }
  }

  const settings = await getMembershipSettings()

  const [payment] = await db
    .insert(membershipPayments)
    .values({
      userId,
      periodYear,
      amountCents: settings.amountCents,
      status: 'completed',
      paidAt: new Date(),
      notes: notes || 'Pagamento manuale registrato da admin',
    })
    .returning()

  await createAuditEntry({
    actorId: adminId,
    actionType: 'MANUAL_PAYMENT_RECORDED',
    entityType: 'membership_payment',
    entityId: payment.id,
    afterState: {
      userId,
      periodYear,
      amountCents: settings.amountCents,
      notes,
    },
  })

  return { success: true }
}

// ─── Update Membership Settings ──────────────────────────

export async function updateMembershipSettings(input: {
  amountCents: number
  deadlineMonth: number
  deadlineDay: number
}) {
  const adminId = await requireSuperAdmin()
  const parsed = updateMembershipSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { amountCents, deadlineMonth, deadlineDay } = parsed.data

  // Get current settings for audit
  const currentSettings = await getMembershipSettings()

  const now = new Date()

  await db
    .insert(appSettings)
    .values([
      {
        key: 'membership_amount_cents',
        value: String(amountCents),
        updatedBy: adminId,
        updatedAt: now,
      },
      {
        key: 'membership_deadline_month',
        value: String(deadlineMonth),
        updatedBy: adminId,
        updatedAt: now,
      },
      {
        key: 'membership_deadline_day',
        value: String(deadlineDay),
        updatedBy: adminId,
        updatedAt: now,
      },
    ])
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        value: sql`EXCLUDED.value`,
        updatedBy: sql`EXCLUDED.updated_by`,
        updatedAt: sql`EXCLUDED.updated_at`,
      },
    })

  await createAuditEntry({
    actorId: adminId,
    actionType: 'MEMBERSHIP_SETTINGS_UPDATED',
    entityType: 'app_settings',
    beforeState: currentSettings as unknown as Record<string, unknown>,
    afterState: { amountCents, deadlineMonth, deadlineDay },
  })

  return { success: true }
}
