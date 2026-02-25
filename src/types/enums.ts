export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  VOLONTARIO: 'volontario',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const UserStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DEACTIVATED: 'deactivated',
} as const
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export const EventType = {
  INTERNO: 'interno',
  APERTO: 'aperto',
} as const
export type EventType = (typeof EventType)[keyof typeof EventType]

export const EventStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived',
} as const
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]

export const RegistrationStatus = {
  CONFIRMED: 'confirmed',
  WAITLIST: 'waitlist',
  CANCELLED: 'cancelled',
} as const
export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus]

export const CancellationType = {
  NORMAL: 'normal',
  LATE: 'late',
} as const
export type CancellationType = (typeof CancellationType)[keyof typeof CancellationType]

export const AttendanceStatus = {
  PRESENT: 'present',
  ABSENT: 'absent',
  NO_SHOW: 'no_show',
} as const
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus]

export const ExternalRegistrationStatus = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const
export type ExternalRegistrationStatus = (typeof ExternalRegistrationStatus)[keyof typeof ExternalRegistrationStatus]

export const AuditActionType = {
  EVENT_CREATED: 'EVENT_CREATED',
  EVENT_UPDATED: 'EVENT_UPDATED',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  EVENT_DELETED: 'EVENT_DELETED',
  REGISTRATION_CREATED: 'REGISTRATION_CREATED',
  REGISTRATION_CANCELLED_BY_ADMIN: 'REGISTRATION_CANCELLED_BY_ADMIN',
  REGISTRATION_CANCELLED_BY_VOLUNTEER: 'REGISTRATION_CANCELLED_BY_VOLUNTEER',
  WAITLIST_PROMOTION: 'WAITLIST_PROMOTION',
  WAITLIST_PROMOTION_DECLINED: 'WAITLIST_PROMOTION_DECLINED',
  EXTERNAL_REGISTRATION_CREATED: 'EXTERNAL_REGISTRATION_CREATED',
  EXTERNAL_REGISTRATION_CANCELLED: 'EXTERNAL_REGISTRATION_CANCELLED',
  ATTENDANCE_CORRECTED: 'ATTENDANCE_CORRECTED',
  CAPACITY_OVERRIDE: 'CAPACITY_OVERRIDE',
  USER_APPROVED: 'USER_APPROVED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  USER_DELETED: 'USER_DELETED',
  ACCOUNT_DELETION_REQUESTED: 'ACCOUNT_DELETION_REQUESTED',
  WAITLIST_ORDER_OVERRIDE: 'WAITLIST_ORDER_OVERRIDE',
  ROLE_CHANGED: 'ROLE_CHANGED',
} as const
export type AuditActionType = (typeof AuditActionType)[keyof typeof AuditActionType]

export const EventCategories = [
  'Servizi in ospedale o altre strutture',
  'Laboratori di formazione',
  'Eventi dedicati ai volontari',
  'Eventi di raccolta fondi',
  'Altro tipo di evento',
] as const
export type EventCategory = (typeof EventCategories)[number]
