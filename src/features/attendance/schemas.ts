import { z } from 'zod'

export const correctAttendanceSchema = z.object({
  registrationId: z.string().uuid('ID iscrizione non valido'),
  newStatus: z.enum(['present', 'absent', 'no_show'], {
    message: 'Stato presenza non valido',
  }),
})

export type CorrectAttendanceData = z.infer<typeof correctAttendanceSchema>
