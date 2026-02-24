'use client'

import { useState, useTransition, useMemo } from 'react'
import { adminRegisterVolunteer } from '@/features/registrations/actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Search, Loader2, AlertTriangle, UserPlus } from 'lucide-react'

export interface ActiveVolunteer {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
}

interface AdminAddVolunteerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  volunteers: ActiveVolunteer[]
  isFull: boolean
}

export function AdminAddVolunteerDialog({
  open,
  onOpenChange,
  eventId,
  volunteers,
  isFull,
}: AdminAddVolunteerDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedVolunteer, setSelectedVolunteer] = useState<ActiveVolunteer | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredVolunteers = useMemo(() => {
    if (!search.trim()) return volunteers
    const term = search.toLowerCase()
    return volunteers.filter(
      (v) =>
        v.firstName?.toLowerCase().includes(term) ||
        v.lastName?.toLowerCase().includes(term) ||
        v.email.toLowerCase().includes(term)
    )
  }, [volunteers, search])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSearch('')
      setSelectedVolunteer(null)
    }
    onOpenChange(nextOpen)
  }

  function handleConfirm() {
    if (!selectedVolunteer) return

    startTransition(async () => {
      try {
        await adminRegisterVolunteer(eventId, selectedVolunteer.id)
        toast.success(
          `${selectedVolunteer.firstName ?? ''} ${selectedVolunteer.lastName ?? ''} iscritto con successo`
        )
        handleOpenChange(false)
        window.location.reload()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Errore durante l'iscrizione"
        )
      }
    })
  }

  const volunteerName = selectedVolunteer
    ? [selectedVolunteer.firstName, selectedVolunteer.lastName].filter(Boolean).join(' ')
    : ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-namo-charcoal">
            <UserPlus className="h-5 w-5" />
            Aggiungi volontario
          </DialogTitle>
          <DialogDescription>
            Cerca e seleziona un volontario da iscrivere all&apos;evento.
          </DialogDescription>
        </DialogHeader>

        {!selectedVolunteer ? (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {/* Volunteer list */}
            <ScrollArea className="h-[280px]">
              {filteredVolunteers.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {search
                    ? 'Nessun volontario trovato'
                    : 'Nessun volontario attivo'}
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredVolunteers.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVolunteer(v)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-namo-cyan/10 text-sm font-semibold text-namo-cyan">
                        {(v.firstName?.[0] ?? v.email[0]).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-namo-charcoal">
                          {[v.firstName, v.lastName].filter(Boolean).join(' ') || v.email}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {v.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <>
            {/* Confirmation view */}
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-namo-cyan/10 text-sm font-semibold text-namo-cyan">
                  {(selectedVolunteer.firstName?.[0] ?? selectedVolunteer.email[0]).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-namo-charcoal">
                    {volunteerName || selectedVolunteer.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVolunteer.email}
                  </p>
                </div>
              </div>

              {isFull && (
                <div className="flex items-start gap-2 rounded-lg border border-namo-orange/30 bg-namo-orange/5 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-namo-orange" />
                  <div className="text-sm">
                    <p className="font-medium text-namo-orange">
                      L&apos;evento è al completo
                    </p>
                    <p className="text-muted-foreground">
                      Vuoi aggiungere comunque? L&apos;iscrizione sarà registrata
                      come override admin.
                    </p>
                  </div>
                </div>
              )}

              <Badge className="bg-namo-cyan/10 text-namo-cyan hover:bg-namo-cyan/20">
                Override admin
              </Badge>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setSelectedVolunteer(null)}
                disabled={isPending}
              >
                Indietro
              </Button>
              <Button
                className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iscrizione...
                  </>
                ) : (
                  'Conferma iscrizione'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
