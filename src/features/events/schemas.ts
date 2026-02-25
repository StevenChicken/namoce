import { z } from 'zod'

const eventFormBaseSchema = z.object({
  title: z.string().min(1, 'Il titolo è obbligatorio'),
  type: z.enum(['interno', 'aperto'], {
    message: 'Il tipo evento deve essere "interno" o "aperto"',
  }),
  category: z.string().nullable().optional(),
  startAt: z.coerce.date({ message: 'La data di inizio non è valida' }),
  endAt: z.coerce.date({ message: 'La data di fine non è valida' }),
  location: z.string().min(1, 'La posizione è obbligatoria'),
  capacity: z.number({ message: 'La capienza deve essere un numero' })
    .int('La capienza deve essere un numero intero')
    .positive('La capienza deve essere maggiore di zero'),
  minVolunteers: z
    .number({ message: 'Il numero minimo deve essere un numero' })
    .int('Il numero minimo deve essere un numero intero')
    .positive('Il numero minimo deve essere maggiore di zero')
    .nullish(),
  requiredTags: z.array(z.string().uuid('Tag non valido')).optional(),
  notes: z.string().nullish(),
  cancellationDeadlineHours: z
    .number({ message: 'Le ore di scadenza devono essere un numero' })
    .int('Le ore di scadenza devono essere un numero intero')
    .positive('Le ore di scadenza devono essere maggiori di zero')
    .nullish(),
  waitlistLimit: z
    .number({ message: "Il limite lista d'attesa deve essere un numero" })
    .int("Il limite lista d'attesa deve essere un numero intero")
    .positive("Il limite lista d'attesa deve essere maggiore di zero")
    .nullish(),
  reminderHours: z
    .number({ message: 'Le ore di promemoria devono essere un numero' })
    .int('Le ore di promemoria devono essere un numero intero')
    .positive('Le ore di promemoria devono essere maggiori di zero')
    .nullish(),
  attendanceGracePeriodHours: z
    .number({ message: 'Le ore del periodo di correzione devono essere un numero' })
    .int('Le ore del periodo di correzione devono essere un numero intero')
    .positive('Le ore del periodo di correzione devono essere maggiori di zero')
    .nullish(),
})

export const eventFormSchema = eventFormBaseSchema.refine(
  (data) => data.endAt > data.startAt,
  {
    message: 'La data di fine deve essere successiva alla data di inizio',
    path: ['endAt'],
  }
)

export const eventSeriesUpdateSchema = eventFormBaseSchema.omit({
  startAt: true,
  endAt: true,
})

export type EventFormData = z.infer<typeof eventFormSchema>
export type EventSeriesUpdateData = z.infer<typeof eventSeriesUpdateSchema>
