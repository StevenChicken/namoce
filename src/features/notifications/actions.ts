'use server'

import { db } from '@/db'
import { notificationPreferences } from '@/db/schema'
import { requireAuthenticated } from '@/lib/auth'
import { notificationPreferencesSchema } from './schemas'

export async function updateNotificationPreferences(data: unknown) {
  const userId = await requireAuthenticated()

  const parsed = notificationPreferencesSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await db
    .insert(notificationPreferences)
    .values({
      userId,
      informationalEmailsEnabled: parsed.data.informationalEmailsEnabled,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: {
        informationalEmailsEnabled: parsed.data.informationalEmailsEnabled,
        updatedAt: new Date(),
      },
    })
}
