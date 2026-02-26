import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getStripeClient } from '@/lib/stripe'
import { db } from '@/db'
import { donations } from '@/db/schema'
import { createDonationCheckoutSchema } from '@/features/payments/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createDonationCheckoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { amountCents, firstName, lastName, email, message } = parsed.data
    const stripe = getStripeClient()

    // Create pending donation row
    const [donation] = await db
      .insert(donations)
      .values({
        amountCents,
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        message: message || null,
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
            unit_amount: amountCents,
            product_data: {
              name: 'Donazione a Namo APS',
              description: message
                ? `Donazione con messaggio: "${message.slice(0, 100)}"`
                : 'Donazione libera a sostegno di Namo APS',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'donation',
        donationId: donation.id,
      },
      customer_email: email || undefined,
      success_url: `${appUrl}/donazioni/grazie`,
      cancel_url: `${appUrl}/donazioni`,
    })

    // Update with stripe session ID
    await db
      .update(donations)
      .set({ stripeSessionId: session.id })
      .where(eq(donations.id, donation.id))

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error) {
    console.error('Errore creazione checkout donazione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
