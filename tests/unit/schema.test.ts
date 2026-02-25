import { describe, it, expect } from 'vitest'
import {
  UserRole,
  UserStatus,
  EventType,
  EventStatus,
  RegistrationStatus,
  CancellationType,
  AttendanceStatus,
  ExternalRegistrationStatus,
  AuditActionType,
  EventCategories,
} from '@/types/enums'

describe('Enums', () => {
  it('UserRole has expected values', () => {
    expect(UserRole.SUPER_ADMIN).toBe('super_admin')
    expect(UserRole.VOLONTARIO).toBe('volontario')
    expect(Object.values(UserRole)).toHaveLength(2)
  })

  it('UserStatus has expected values', () => {
    expect(UserStatus.PENDING).toBe('pending')
    expect(UserStatus.ACTIVE).toBe('active')
    expect(UserStatus.SUSPENDED).toBe('suspended')
    expect(UserStatus.DEACTIVATED).toBe('deactivated')
    expect(Object.values(UserStatus)).toHaveLength(4)
  })

  it('EventType has expected values', () => {
    expect(EventType.INTERNO).toBe('interno')
    expect(EventType.APERTO).toBe('aperto')
    expect(Object.values(EventType)).toHaveLength(2)
  })

  it('EventStatus has expected values', () => {
    expect(EventStatus.DRAFT).toBe('draft')
    expect(EventStatus.PUBLISHED).toBe('published')
    expect(EventStatus.CANCELLED).toBe('cancelled')
    expect(EventStatus.ARCHIVED).toBe('archived')
    expect(Object.values(EventStatus)).toHaveLength(4)
  })

  it('RegistrationStatus has expected values', () => {
    expect(RegistrationStatus.CONFIRMED).toBe('confirmed')
    expect(RegistrationStatus.WAITLIST).toBe('waitlist')
    expect(RegistrationStatus.CANCELLED).toBe('cancelled')
    expect(Object.values(RegistrationStatus)).toHaveLength(3)
  })

  it('CancellationType has expected values', () => {
    expect(CancellationType.NORMAL).toBe('normal')
    expect(CancellationType.LATE).toBe('late')
    expect(Object.values(CancellationType)).toHaveLength(2)
  })

  it('AttendanceStatus has expected values', () => {
    expect(AttendanceStatus.PRESENT).toBe('present')
    expect(AttendanceStatus.ABSENT).toBe('absent')
    expect(AttendanceStatus.NO_SHOW).toBe('no_show')
    expect(Object.values(AttendanceStatus)).toHaveLength(3)
  })

  it('ExternalRegistrationStatus has expected values', () => {
    expect(ExternalRegistrationStatus.CONFIRMED).toBe('confirmed')
    expect(ExternalRegistrationStatus.CANCELLED).toBe('cancelled')
    expect(Object.values(ExternalRegistrationStatus)).toHaveLength(2)
  })

  it('AuditActionType has all expected action types', () => {
    const expectedActions = [
      'EVENT_CREATED',
      'EVENT_UPDATED',
      'EVENT_CANCELLED',
      'EVENT_DELETED',
      'REGISTRATION_CANCELLED_BY_ADMIN',
      'ATTENDANCE_CORRECTED',
      'CAPACITY_OVERRIDE',
      'USER_APPROVED',
      'USER_SUSPENDED',
      'USER_DEACTIVATED',
      'USER_DELETED',
      'WAITLIST_ORDER_OVERRIDE',
      'ROLE_CHANGED',
    ]
    expect(Object.keys(AuditActionType)).toEqual(expectedActions)
  })

  it('EventCategories has all expected categories', () => {
    expect(EventCategories).toContain('Servizi in ospedale o altre strutture')
    expect(EventCategories).toContain('Laboratori di formazione')
    expect(EventCategories).toContain('Eventi dedicati ai volontari')
    expect(EventCategories).toContain('Eventi di raccolta fondi')
    expect(EventCategories).toContain('Altro tipo di evento')
    expect(EventCategories).toHaveLength(5)
  })
})
