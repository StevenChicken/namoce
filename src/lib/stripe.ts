import 'server-only'
import Stripe from 'stripe'

// Lazy-init Stripe client (same pattern as Resend — don't instantiate at module scope)
let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  }
  return stripeClient
}
