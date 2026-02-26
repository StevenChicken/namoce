import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'
import { db } from '@/db'
import { membershipPayments, donations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  getMembershipPaymentByStripeSession,
  getDonationByStripeSession,
} from '@/features/payments/queries'
import { sendMembershipPaymentConfirmation } from '@/features/notifications/send-membership-payment-confirmation'
import { sendDonationThankYou } from '@/features/notifications/send-donation-thank-you'
import { users } from '@/db/schema'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripeClient()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const type = session.metadata?.type

        if (type === 'membership') {
          await handleMembershipCompleted(session)
        } else if (type === 'donation') {
          await handleDonationCompleted(session)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const type = session.metadata?.type

        if (type === 'membership') {
          const payment = await getMembershipPaymentByStripeSession(session.id)
          if (payment && payment.status === 'pending') {
            await db
              .update(membershipPayments)
              .set({ status: 'failed', updatedAt: new Date() })
              .where(eq(membershipPayments.id, payment.id))
          }
        } else if (type === 'donation') {
          const donation = await getDonationByStripeSession(session.id)
          if (donation && donation.status === 'pending') {
            await db
              .update(donations)
              .set({ status: 'failed' })
              .where(eq(donations.id, donation.id))
          }
        }
        break
      }
    }
  } catch (err) {
    console.error('Stripe webhook processing error:', err)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

async function handleMembershipCompleted(session: Stripe.Checkout.Session) {
  const payment = await getMembershipPaymentByStripeSession(session.id)
  if (!payment || payment.status === 'completed') return // idempotent

  await db
    .update(membershipPayments)
    .set({
      status: 'completed',
      stripePaymentIntentId: session.payment_intent as string,
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(membershipPayments.id, payment.id))

  // Send confirmation email (fire-and-forget)
  const user = await db
    .select({ email: users.email, firstName: users.firstName })
    .from(users)
    .where(eq(users.id, payment.userId))
    .limit(1)

  if (user[0]) {
    sendMembershipPaymentConfirmation({
      email: user[0].email,
      firstName: user[0].firstName || 'Volontario',
      periodYear: payment.periodYear,
      amountCents: payment.amountCents,
    })
  }
}

async function handleDonationCompleted(session: Stripe.Checkout.Session) {
  const donation = await getDonationByStripeSession(session.id)
  if (!donation || donation.status === 'completed') return // idempotent

  await db
    .update(donations)
    .set({
      status: 'completed',
      stripePaymentIntentId: session.payment_intent as string,
      paidAt: new Date(),
    })
    .where(eq(donations.id, donation.id))

  // Send thank-you email (fire-and-forget)
  if (donation.email) {
    sendDonationThankYou({
      email: donation.email,
      firstName: donation.firstName || undefined,
      amountCents: donation.amountCents,
    })
  }
}
