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

export const externalRegistrationSchema = z.object({
  eventId: z.string().uuid('ID evento non valido'),
  firstName: z.string().min(1, 'Il nome è obbligatorio'),
  lastName: z.string().min(1, 'Il cognome è obbligatorio'),
  email: z.string().email('Indirizzo email non valido'),
  phone: z.string().optional(),
})

export type RegisterForEventData = z.infer<typeof registerForEventSchema>
export type ConfirmWaitlistJoinData = z.infer<typeof confirmWaitlistJoinSchema>
export type CancelRegistrationData = z.infer<typeof cancelRegistrationSchema>
export type ExternalRegistrationData = z.infer<typeof externalRegistrationSchema>
