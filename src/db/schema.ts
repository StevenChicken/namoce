import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ──────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['super_admin', 'volontario'])
export const userStatusEnum = pgEnum('user_status', [
  'pending',
  'active',
  'suspended',
  'deactivated',
])
export const eventTypeEnum = pgEnum('event_type', ['interno', 'aperto'])
export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'published',
  'cancelled',
  'archived',
])
export const registrationStatusEnum = pgEnum('registration_status', [
  'confirmed',
  'waitlist',
  'cancelled',
])
export const cancellationTypeEnum = pgEnum('cancellation_type', [
  'normal',
  'late',
])
export const attendanceStatusEnum = pgEnum('attendance_status', [
  'present',
  'absent',
  'no_show',
])
export const externalRegistrationStatusEnum = pgEnum(
  'external_registration_status',
  ['confirmed', 'cancelled']
)

// ─── Tables ─────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  nickname: text('nickname'),
  role: userRoleEnum('role').notNull().default('volontario'),
  status: userStatusEnum('status').notNull().default('pending'),
  phoneEncrypted: text('phone_encrypted'),
  sectorsOfInterest: text('sectors_of_interest').array(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  approvedBy: uuid('approved_by'),
})

export const userTags = pgTable('user_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const userTagAssignments = pgTable('user_tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => userTags.id),
  assignedBy: uuid('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  type: eventTypeEnum('type').notNull(),
  status: eventStatusEnum('status').notNull().default('draft'),
  sectors: text('sectors').array(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  location: text('location'),
  capacity: integer('capacity'),
  minVolunteers: integer('min_volunteers'),
  requiredTags: uuid('required_tags').array(),
  notes: text('notes'),
  fileUrl: text('file_url'),
  cancellationDeadlineHours: integer('cancellation_deadline_hours'),
  waitlistLimit: integer('waitlist_limit'),
  reminderHours: integer('reminder_hours'),
  attendanceGracePeriodHours: integer('attendance_grace_period_hours').default(48),
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  cloneSeriesId: uuid('clone_series_id'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const registrations = pgTable('registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  status: registrationStatusEnum('status').notNull().default('confirmed'),
  registeredAt: timestamp('registered_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancellationType: cancellationTypeEnum('cancellation_type'),
  isAdminOverride: boolean('is_admin_override').notNull().default(false),
  attendanceStatus: attendanceStatusEnum('attendance_status'),
  attendanceCorrectedBy: uuid('attendance_corrected_by').references(
    () => users.id
  ),
  attendanceCorrectedAt: timestamp('attendance_corrected_at', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const externalRegistrations = pgTable('external_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phoneEncrypted: text('phone_encrypted'),
  status: externalRegistrationStatusEnum('status')
    .notNull()
    .default('confirmed'),
  cancelToken: uuid('cancel_token').notNull().defaultRandom().unique(),
  registeredAt: timestamp('registered_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
})

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id')
    .notNull()
    .references(() => users.id),
  actionType: text('action_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  beforeState: jsonb('before_state'),
  afterState: jsonb('after_state'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const notificationPreferences = pgTable('notification_preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  informationalEmailsEnabled: boolean('informational_emails_enabled')
    .notNull()
    .default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// ─── Relations ──────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  tags: many(userTagAssignments),
  registrations: many(registrations),
  notificationPreferences: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId],
  }),
  approvedByUser: one(users, {
    fields: [users.approvedBy],
    references: [users.id],
  }),
}))

export const userTagsRelations = relations(userTags, ({ many, one }) => ({
  assignments: many(userTagAssignments),
  createdByUser: one(users, {
    fields: [userTags.createdBy],
    references: [users.id],
  }),
}))

export const userTagAssignmentsRelations = relations(
  userTagAssignments,
  ({ one }) => ({
    user: one(users, {
      fields: [userTagAssignments.userId],
      references: [users.id],
    }),
    tag: one(userTags, {
      fields: [userTagAssignments.tagId],
      references: [userTags.id],
    }),
    assignedByUser: one(users, {
      fields: [userTagAssignments.assignedBy],
      references: [users.id],
    }),
  })
)

export const eventsRelations = relations(events, ({ many, one }) => ({
  registrations: many(registrations),
  externalRegistrations: many(externalRegistrations),
  createdByUser: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
}))

export const registrationsRelations = relations(registrations, ({ one }) => ({
  event: one(events, {
    fields: [registrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [registrations.userId],
    references: [users.id],
  }),
  correctedByUser: one(users, {
    fields: [registrations.attendanceCorrectedBy],
    references: [users.id],
  }),
}))

export const externalRegistrationsRelations = relations(
  externalRegistrations,
  ({ one }) => ({
    event: one(events, {
      fields: [externalRegistrations.eventId],
      references: [events.id],
    }),
  })
)

// ─── Inferred Types ─────────────────────────────────────

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Registration = typeof registrations.$inferSelect
export type NewRegistration = typeof registrations.$inferInsert
export type ExternalRegistration = typeof externalRegistrations.$inferSelect
export type NewExternalRegistration = typeof externalRegistrations.$inferInsert
export type AuditLogEntry = typeof auditLog.$inferSelect
export type NewAuditLogEntry = typeof auditLog.$inferInsert
export type UserTag = typeof userTags.$inferSelect
export type NewUserTag = typeof userTags.$inferInsert
export type UserTagAssignment = typeof userTagAssignments.$inferSelect
export type NotificationPreference = typeof notificationPreferences.$inferSelect
