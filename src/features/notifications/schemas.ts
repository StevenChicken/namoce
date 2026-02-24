import { z } from 'zod'

export const notificationPreferencesSchema = z.object({
  informationalEmailsEnabled: z.boolean(),
})
