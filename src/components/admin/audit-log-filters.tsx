'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

interface Actor {
  id: string
  firstName: string | null
  lastName: string | null
}

interface AuditLogFiltersProps {
  actors: Actor[]
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  EVENT_CREATED: 'Evento creato',
  EVENT_UPDATED: 'Evento modificato',
  EVENT_CANCELLED: 'Evento annullato',
  EVENT_DELETED: 'Evento eliminato',
  REGISTRATION_CREATED: 'Iscrizione creata',
  REGISTRATION_CANCELLED_BY_ADMIN: 'Iscrizione annullata (admin)',
  REGISTRATION_CANCELLED_BY_VOLUNTEER: 'Iscrizione annullata (volontario)',
  WAITLIST_PROMOTION: 'Promozione da lista attesa',
  WAITLIST_PROMOTION_DECLINED: 'Promozione rifiutata',
  ATTENDANCE_CORRECTED: 'Presenza corretta',
  CAPACITY_OVERRIDE: 'Override capacità',
  USER_APPROVED: 'Utente approvato',
  USER_SUSPENDED: 'Utente sospeso',
  USER_DEACTIVATED: 'Utente disattivato',
  USER_DELETED: 'Utente eliminato',
  ROLE_CHANGED: 'Ruolo modificato',
  EXTERNAL_REGISTRATION_CREATED: 'Iscrizione esterna creata',
  EXTERNAL_REGISTRATION_CANCELLED: 'Iscrizione esterna annullata',
}

export function AuditLogFilters({ actors }: AuditLogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentActor = searchParams.get('actor') ?? ''
  const currentAction = searchParams.get('actionType') ?? ''
  const currentStartDate = searchParams.get('startDate') ?? ''
  const currentEndDate = searchParams.get('endDate') ?? ''

  const hasFilters = currentActor || currentAction || currentStartDate || currentEndDate

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 on filter change
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  function clearFilters() {
    router.push(pathname)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attore</label>
        <Select
          value={currentActor || 'all'}
          onValueChange={(v) => updateParams('actor', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Tutti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            {actors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Azione</label>
        <Select
          value={currentAction || 'all'}
          onValueChange={(v) => updateParams('actionType', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-full sm:w-[260px]">
            <SelectValue placeholder="Tutte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte</SelectItem>
            {Object.entries(ACTION_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Da</label>
        <Input
          type="date"
          value={currentStartDate}
          onChange={(e) => updateParams('startDate', e.target.value)}
          className="w-full sm:w-[160px]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">A</label>
        <Input
          type="date"
          value={currentEndDate}
          onChange={(e) => updateParams('endDate', e.target.value)}
          className="w-full sm:w-[160px]"
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="self-end rounded-full text-muted-foreground hover:text-namo-red"
        >
          <X className="mr-1 h-4 w-4" />
          Cancella filtri
        </Button>
      )}
    </div>
  )
}

export { ACTION_TYPE_LABELS }
