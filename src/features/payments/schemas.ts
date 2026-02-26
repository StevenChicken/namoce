import { z } from 'zod'

export const createMembershipCheckoutSchema = z.object({
  periodYear: z.number().int().min(2024).max(2100),
})

export const createDonationCheckoutSchema = z.object({
  amountCents: z.number().int().min(100).max(100_000_00), // min EUR 1, max EUR 100,000
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().email().max(255).optional(),
  message: z.string().trim().max(500).optional(),
})

export const markManualPaymentSchema = z.object({
  userId: z.string().uuid(),
  periodYear: z.number().int().min(2024).max(2100),
  notes: z.string().trim().max(500).optional(),
})

export const updateMembershipSettingsSchema = z.object({
  amountCents: z.number().int().min(100).max(100_000_00),
  deadlineMonth: z.number().int().min(1).max(12),
  deadlineDay: z.number().int().min(1).max(31),
})
