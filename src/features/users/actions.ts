'use server'

import { db } from '@/db'
import { users, adminCategoryPermissions, notificationPreferences } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { createAuditEntry } from '@/lib/audit'
import { requireAuthenticated, requireSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import {
  changeUserTypeSchema,
  changeAdminLevelSchema,
  updateClownNameSchema,
  assignCategoryPermissionSchema,
  removeCategoryPermissionSchema,
} from './schemas'
import { sendPromotedToVolontario } from '@/features/notifications/send-promoted-to-volontario'

// ─── changeUserType ─────────────────────────────────────

export async function changeUserType(data: unknown) {
  const actorId = await requireSuperAdmin()

  const parsed = changeUserTypeSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { userId, userType } = parsed.data

  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  const beforeState = {
    userType: currentUser[0].userType,
  }

  await db
    .update(users)
    .set({ userType, updatedAt: new Date() })
    .where(eq(users.id, userId))

  await createAuditEntry({
    actorId,
    actionType: 'USER_TYPE_CHANGED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { userType },
  })

  // Send promotion email when promoting to volontario
  if (userType === 'volontario' && currentUser[0].userType !== 'volontario') {
    sendPromotedToVolontario({
      email: currentUser[0].email,
      firstName: currentUser[0].firstName ?? 'Utente',
    }).catch((err: unknown) => console.error('Errore invio email promozione volontario:', err))
  }

  revalidatePath('/admin/utenti')
}

// ─── changeAdminLevel ───────────────────────────────────

export async function changeAdminLevel(data: unknown) {
  const actorId = await requireSuperAdmin()

  const parsed = changeAdminLevelSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { userId, adminLevel } = parsed.data

  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  // Last super_admin protection: if demoting a super_admin, ensure at least one other exists
  if (
    currentUser[0].adminLevel === 'super_admin' &&
    adminLevel !== 'super_admin'
  ) {
    const [superAdminCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.adminLevel, 'super_admin'))

    if ((superAdminCount?.count ?? 0) <= 1) {
      throw new Error(
        'Non è possibile rimuovere l\'ultimo super admin. Promuovi prima un altro utente.'
      )
    }
  }

  const beforeState = {
    adminLevel: currentUser[0].adminLevel,
  }

  await db
    .update(users)
    .set({ adminLevel, updatedAt: new Date() })
    .where(eq(users.id, userId))

  await createAuditEntry({
    actorId,
    actionType: 'ADMIN_LEVEL_CHANGED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { adminLevel },
  })

  revalidatePath('/admin/utenti')
}

// ─── updateClownName ────────────────────────────────────

export async function updateClownName(data: unknown) {
  const actorId = await requireSuperAdmin()

  const parsed = updateClownNameSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { userId, clownName } = parsed.data

  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!currentUser[0]) {
    throw new Error('Utente non trovato')
  }

  if (currentUser[0].userType !== 'volontario') {
    throw new Error('Solo i volontari possono avere un Nome Clown')
  }

  const beforeState = {
    clownName: currentUser[0].clownName,
  }

  await db
    .update(users)
    .set({ clownName, updatedAt: new Date() })
    .where(eq(users.id, userId))

  await createAuditEntry({
    actorId,
    actionType: 'CLOWN_NAME_UPDATED',
    entityType: 'user',
    entityId: userId,
    beforeState,
    afterState: { clownName },
  })

  revalidatePath('/admin/utenti')
}

// ─── assignCategoryPermission ───────────────────────────

export async function assignCategoryPermission(data: unknown) {
  const actorId = await requireSuperAdmin()

  const parsed = assignCategoryPermissionSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { userId, category } = parsed.data

  // Verify user exists and is admin
  const targetUser = await db
    .select({ adminLevel: users.adminLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!targetUser[0]) {
    throw new Error('Utente non trovato')
  }

  if (targetUser[0].adminLevel !== 'admin') {
    throw new Error('Le autorizzazioni per categoria sono solo per gli admin')
  }

  await db
    .insert(adminCategoryPermissions)
    .values({
      userId,
      category,
      assignedBy: actorId,
    })
    .onConflictDoNothing()

  await createAuditEntry({
    actorId,
    actionType: 'CATEGORY_PERMISSION_ASSIGNED',
    entityType: 'admin_category_permission',
    entityId: userId,
    afterState: { userId, category },
  })

  revalidatePath('/admin/utenti')
}

// ─── removeCategoryPermission ───────────────────────────

export async function removeCategoryPermission(data: unknown) {
  const actorId = await requireSuperAdmin()

  const parsed = removeCategoryPermissionSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { userId, category } = parsed.data

  await db
    .delete(adminCategoryPermissions)
    .where(
      and(
        eq(adminCategoryPermissions.userId, userId),
        eq(adminCategoryPermissions.category, category)
      )
    )

  await createAuditEntry({
    actorId,
    actionType: 'CATEGORY_PERMISSION_REMOVED',
    entityType: 'admin_category_permission',
    entityId: userId,
    beforeState: { userId, category },
  })

  revalidatePath('/admin/utenti')
}

// ─── fetchUserCategoryPermissions ────────────────────────
// Server action wrapper so client components can fetch category permissions

export async function fetchUserCategoryPermissions(userId: string) {
  await requireSuperAdmin()

  const perms = await db
    .select({
      id: adminCategoryPermissions.id,
      userId: adminCategoryPermissions.userId,
      category: adminCategoryPermissions.category,
    })
    .from(adminCategoryPermissions)
    .where(eq(adminCategoryPermissions.userId, userId))
    .orderBy(adminCategoryPermissions.category)

  return perms
}

// ─── suspendUser ────────────────────────────────────────

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
    userType: currentUser[0].userType,
    adminLevel: currentUser[0].adminLevel,
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

// ─── reactivateUser ─────────────────────────────────────

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
    userType: currentUser[0].userType,
    adminLevel: currentUser[0].adminLevel,
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

// ─── deactivateUser ─────────────────────────────────────

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
    userType: currentUser[0].userType,
    adminLevel: currentUser[0].adminLevel,
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

// ─── requestAccountDeletion ─────────────────────────────

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

// ─── deleteUserData ─────────────────────────────────────

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
    clownName: currentUser[0].clownName,
    status: currentUser[0].status,
  }

  const anonymizedEmail = `rimosso-${userId.substring(0, 8)}@deleted.namo.app`

  // Anonymize user data (preserve row for FK integrity)
  await db
    .update(users)
    .set({
      firstName: '[Rimosso]',
      lastName: '[Rimosso]',
      email: anonymizedEmail,
      clownName: null,
      phoneEncrypted: null,
      notes: null,
      status: 'deactivated',
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  // Delete notification preferences
  await db
    .delete(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))

  // Delete category permissions
  await db
    .delete(adminCategoryPermissions)
    .where(eq(adminCategoryPermissions.userId, userId))

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
