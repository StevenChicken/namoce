import 'server-only'
import { db } from '@/db'
import {
  appSettings,
  membershipPayments,
  donations,
  users,
} from '@/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

// ─── App Settings ────────────────────────────────────────

export interface MembershipSettings {
  amountCents: number
  deadlineMonth: number
  deadlineDay: number
}

export async function getMembershipSettings(): Promise<MembershipSettings> {
  const rows = await db
    .select()
    .from(appSettings)
    .where(
      sql`${appSettings.key} IN ('membership_amount_cents', 'membership_deadline_month', 'membership_deadline_day')`
    )

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  return {
    amountCents: parseInt(map['membership_amount_cents'] ?? '3500', 10),
    deadlineMonth: parseInt(map['membership_deadline_month'] ?? '12', 10),
    deadlineDay: parseInt(map['membership_deadline_day'] ?? '15', 10),
  }
}

// ─── Membership Payments ─────────────────────────────────

export async function getUserMembershipPayment(
  userId: string,
  year: number
) {
  const result = await db
    .select()
    .from(membershipPayments)
    .where(
      and(
        eq(membershipPayments.userId, userId),
        eq(membershipPayments.periodYear, year),
        eq(membershipPayments.status, 'completed')
      )
    )
    .limit(1)

  return result[0] ?? null
}

export async function getUserMembershipPayments(userId: string) {
  return db
    .select()
    .from(membershipPayments)
    .where(eq(membershipPayments.userId, userId))
    .orderBy(desc(membershipPayments.periodYear))
}

export async function getMembershipPaymentByStripeSession(sessionId: string) {
  const result = await db
    .select()
    .from(membershipPayments)
    .where(eq(membershipPayments.stripeSessionId, sessionId))
    .limit(1)

  return result[0] ?? null
}

export async function getVolunteerPaymentStatuses(year: number) {
  const result = await db
    .select({
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      paymentId: membershipPayments.id,
      paymentStatus: membershipPayments.status,
      paidAt: membershipPayments.paidAt,
      amountCents: membershipPayments.amountCents,
      notes: membershipPayments.notes,
    })
    .from(users)
    .leftJoin(
      membershipPayments,
      and(
        eq(membershipPayments.userId, users.id),
        eq(membershipPayments.periodYear, year),
        eq(membershipPayments.status, 'completed')
      )
    )
    .where(
      and(
        eq(users.status, 'active'),
        sql`(${users.userType} = 'volontario' OR ${users.adminLevel} IN ('admin', 'super_admin'))`
      )
    )
    .orderBy(users.lastName, users.firstName)

  return result
}

export async function getUnpaidVolunteersForReminder(year: number) {
  const result = await db
    .select({
      userId: users.id,
      firstName: users.firstName,
      email: users.email,
    })
    .from(users)
    .where(
      and(
        eq(users.status, 'active'),
        sql`(${users.userType} = 'volontario' OR ${users.adminLevel} IN ('admin', 'super_admin'))`,
        sql`NOT EXISTS (
          SELECT 1 FROM membership_payments mp
          WHERE mp.user_id = ${users.id}
          AND mp.period_year = ${year}
          AND mp.status = 'completed'
        )`
      )
    )

  return result
}

// ─── Donations ───────────────────────────────────────────

export async function getDonationByStripeSession(sessionId: string) {
  const result = await db
    .select()
    .from(donations)
    .where(eq(donations.stripeSessionId, sessionId))
    .limit(1)

  return result[0] ?? null
}

export async function getRecentDonations(limit = 50) {
  return db
    .select()
    .from(donations)
    .where(eq(donations.status, 'completed'))
    .orderBy(desc(donations.paidAt))
    .limit(limit)
}

export async function getDonationTotalForYear(year: number) {
  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${donations.amountCents}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(donations)
    .where(
      and(
        eq(donations.status, 'completed'),
        sql`EXTRACT(YEAR FROM ${donations.paidAt}) = ${year}`
      )
    )

  return {
    totalCents: Number(result[0]?.total ?? 0),
    count: Number(result[0]?.count ?? 0),
  }
}
