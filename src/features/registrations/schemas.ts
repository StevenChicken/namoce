import { z } from 'zod'

export const registerForEventSchema = z.object({
  eventId: z.string().uuid('ID evento non valido'),
  acceptOverlap: z.boolean().optional().default(false),
})

export const confirmWaitlistJoinSchema = z.object({
  eventId: z.string().uuid('ID evento non valido'),
})

export const cancelRegistrationSchema = z.object({
  registrationId: z.string().uuid('ID iscrizione non valido'),
})

export type RegisterForEventData = z.infer<typeof registerForEventSchema>
export type ConfirmWaitlistJoinData = z.infer<typeof confirmWaitlistJoinSchema>
export type CancelRegistrationData = z.infer<typeof cancelRegistrationSchema>
