'use server'

import { db } from '@/db'
import { users, notificationPreferences } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createAuditEntry } from '@/lib/audit'
import { requireAuthenticated, requireSuperAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAccountApprovedEmail } from '@/features/notifications/send-account-approved'
import { revalidatePath } from 'next/cache'

export async function approveVolunteer(userId: string) {
  const actorId = await requireSuperAdmin()

  // Get current state for audit
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  if (currentUser[0].status !== 'pending') {
    throw new Error('L\'utente non è in attesa di approvazione')
  }

  const beforeState = {
    status: currentUser[0].status,
    role: currentUser[0].role,
  }

  // Update status
  await db
    .update(users)
    .set({
      status: 'active',
      approvedAt: new Date(),
      approvedBy: actorId,
    })
    .where(eq(users.id, userId))

  // Confirm the user's email in auth.users (ensures login works even if
  // email confirmations are enabled in the Supabase dashboard)
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(userId, { email_confirm: true })

  // Create audit log
  await createAuditEntry({
    actorId,
    actionType: 'USER_APPROVED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { status: 'active' },
  })

  // Send approval email
  await sendAccountApprovedEmail({
    email: currentUser[0].email,
    firstName: currentUser[0].firstName ?? 'Volontario',
  })

  revalidatePath('/admin/utenti')
}

export async function rejectVolunteer(userId: string) {
  const actorId = await requireSuperAdmin()

  // Get current state for audit
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  const beforeState = {
    status: currentUser[0].status,
    role: currentUser[0].role,
  }

  // Update status to deactivated
  await db
    .update(users)
    .set({ status: 'deactivated' })
    .where(eq(users.id, userId))

  // Create audit log
  await createAuditEntry({
    actorId,
    actionType: 'USER_DEACTIVATED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { status: 'deactivated' },
  })

  revalidatePath('/admin/utenti')
}

export async function suspendUser(userId: string) {
  const actorId = await requireSuperAdmin()

  if (actorId === userId) {
    throw new Error('Non puoi sospendere il tuo stesso account')
  }

  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  if (currentUser[0].status !== 'active') {
    throw new Error("L'utente non è attivo")
  }

  const beforeState = {
    status: currentUser[0].status,
    role: currentUser[0].role,
  }

  await db
    .update(users)
    .set({ status: 'suspended', updatedAt: new Date() })
    .where(eq(users.id, userId))

  await createAuditEntry({
    actorId,
    actionType: 'USER_SUSPENDED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { status: 'suspended' },
  })

  revalidatePath('/admin/utenti')
}

export async function reactivateUser(userId: string) {
  const actorId = await requireSuperAdmin()

  if (actorId === userId) {
    throw new Error('Non puoi riattivare il tuo stesso account')
  }

  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  if (currentUser[0].status !== 'suspended' && currentUser[0].status !== 'deactivated') {
    throw new Error("L'utente non è sospeso o disattivato")
  }

  const beforeState = {
    status: currentUser[0].status,
    role: currentUser[0].role,
  }

  await db
    .update(users)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(users.id, userId))

  await createAuditEntry({
    actorId,
    actionType: 'USER_APPROVED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { status: 'active' },
  })

  revalidatePath('/admin/utenti')
}

export async function deactivateUser(userId: string) {
  const actorId = await requireSuperAdmin()

  if (actorId === userId) {
    throw new Error('Non puoi disattivare il tuo stesso account')
  }

  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  if (currentUser[0].status === 'deactivated') {
    throw new Error("L'utente è già disattivato")
  }

  const beforeState = {
    status: currentUser[0].status,
    role: currentUser[0].role,
  }

  await db
    .update(users)
    .set({ status: 'deactivated', updatedAt: new Date() })
    .where(eq(users.id, userId))

  await createAuditEntry({
    actorId,
    actionType: 'USER_DEACTIVATED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { status: 'deactivated' },
  })

  revalidatePath('/admin/utenti')
}

export async function requestAccountDeletion() {
  const userId = await requireAuthenticated()

  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  const beforeState = {
    status: currentUser[0].status,
    email: currentUser[0].email,
  }

  await db
    .update(users)
    .set({ status: 'deactivated', updatedAt: new Date() })
    .where(eq(users.id, userId))

  await createAuditEntry({
    actorId: userId,
    actionType: 'ACCOUNT_DELETION_REQUESTED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { status: 'deactivated' },
  })

  revalidatePath('/profilo')
  return { success: true }
}

export async function deleteUserData(userId: string) {
  const actorId = await requireSuperAdmin()

  if (actorId === userId) {
    throw new Error('Non puoi eliminare i tuoi stessi dati')
  }

  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  const beforeState = {
    firstName: currentUser[0].firstName,
    lastName: currentUser[0].lastName,
    email: currentUser[0].email,
    nickname: currentUser[0].nickname,
    status: currentUser[0].status,
    sectorsOfInterest: currentUser[0].sectorsOfInterest,
  }

  const anonymizedEmail = `rimosso-${userId.substring(0, 8)}@deleted.namo.app`

  // Anonymize user data (preserve row for FK integrity)
  await db
    .update(users)
    .set({
      firstName: '[Rimosso]',
      lastName: '[Rimosso]',
      email: anonymizedEmail,
      nickname: null,
      phoneEncrypted: null,
      sectorsOfInterest: null,
      notes: null,
      status: 'deactivated',
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  // Delete notification preferences
  await db
    .delete(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))

  await createAuditEntry({
    actorId,
    actionType: 'USER_DELETED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { anonymized: true },
  })

  revalidatePath('/admin/utenti')
  return { success: true }
}
