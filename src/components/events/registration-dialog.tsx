'use client'

import { useState, useTransition } from 'react'
import { Clock, MapPin, Users, AlertTriangle, CheckCircle2, ListOrdered, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { registerForEvent, confirmWaitlistJoin } from '@/features/registrations/actions'

type DialogStep =
  | 'confirm'
  | 'overlap'
  | 'waitlist-offer'
  | 'success'
  | 'error'

interface OverlapConflict {
  eventId: string
  eventTitle: string
  startAt: string
  endAt: string
}

interface EventSummary {
  id: string
  title: string
  startAt: string | Date
  endAt: string | Date
  location: string | null
  capacity: number | null
  confirmedCount: number
}

interface RegistrationDialogProps {
  event: EventSummary
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function RegistrationDialog({
  event,
  open,
  onOpenChange,
}: RegistrationDialogProps) {
  const [step, setStep] = useState<DialogStep>('confirm')
  const [conflicts, setConflicts] = useState<OverlapConflict[]>([])
  const [waitlistPosition, setWaitlistPosition] = useState<number>(0)
  const [finalStatus, setFinalStatus] = useState<'confirmed' | 'waitlist'>('confirmed')
  const [errorMessage, setErrorMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const startAt = new Date(event.startAt)
  const endAt = new Date(event.endAt)
  function resetAndClose() {
    onOpenChange(false)
    // Reset after animation
    setTimeout(() => {
      setStep('confirm')
      setConflicts([])
      setWaitlistPosition(0)
      setErrorMessage('')
    }, 200)
  }

  function handleRegister(acceptOverlap: boolean) {
    startTransition(async () => {
      try {
        const result = await registerForEvent({
          eventId: event.id,
          acceptOverlap,
        })

        if ('needsOverlapConfirmation' in result) {
          setConflicts(result.conflicts as OverlapConflict[])
          setStep('overlap')
        } else if ('needsWaitlistConfirmation' in result) {
          setWaitlistPosition(result.position as number)
          setStep('waitlist-offer')
        } else {
          setFinalStatus('confirmed')
          setStep('success')
          toast.success('Iscrizione confermata!')
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Errore durante l'iscrizione"
        )
        setStep('error')
      }
    })
  }

  function handleWaitlistJoin() {
    startTransition(async () => {
      try {
        const result = await confirmWaitlistJoin({ eventId: event.id })
        setWaitlistPosition(result.position ?? waitlistPosition)
        setFinalStatus('waitlist')
        setStep('success')
        toast.success("Aggiunto alla lista d'attesa!")
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Errore durante l'iscrizione alla lista d'attesa"
        )
        setStep('error')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Step: Confirm */}
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Conferma iscrizione</DialogTitle>
              <DialogDescription>
                Stai per iscriverti a questo evento
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
              <p className="font-semibold text-foreground">{event.title}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  {formatDate(startAt)}, {formatTime(startAt)} –{' '}
                  {formatTime(endAt)}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                {event.capacity === null ? (
                  <span>Posti illimitati</span>
                ) : (
                  <span>
                    {event.confirmedCount}/{event.capacity} posti occupati
                  </span>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="rounded-full">
                  Annulla
                </Button>
              </DialogClose>
              <Button
                onClick={() => handleRegister(false)}
                disabled={isPending}
                className="rounded-full bg-namo-cyan text-white hover:bg-namo-cyan/90"
              >
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Conferma iscrizione
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step: Overlap Warning */}
        {step === 'overlap' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-namo-orange" />
                Sovrapposizione orario
              </DialogTitle>
              <DialogDescription>
                Sei già iscritto a un evento nello stesso orario
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {conflicts.map((c) => {
                const cStart = new Date(c.startAt)
                const cEnd = new Date(c.endAt)
                return (
                  <div
                    key={c.eventId}
                    className="rounded-lg border border-namo-orange/20 bg-namo-orange/5 p-3"
                  >
                    <p className="font-medium text-foreground">
                      {c.eventTitle}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatTime(cStart)} – {formatTime(cEnd)}
                    </p>
                  </div>
                )
              })}
              <p className="text-sm text-muted-foreground">
                Vuoi iscriverti comunque?
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetAndClose}
                className="rounded-full"
              >
                Annulla
              </Button>
              <Button
                onClick={() => handleRegister(true)}
                disabled={isPending}
                className="rounded-full bg-namo-orange text-white hover:bg-namo-orange/90"
              >
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Iscriviti comunque
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step: Waitlist Offer */}
        {step === 'waitlist-offer' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-namo-orange" />
                Evento al completo
              </DialogTitle>
              <DialogDescription>
                Puoi unirti alla lista d&apos;attesa
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-namo-orange/20 bg-namo-orange/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Questo evento è al completo. Desideri unirti alla lista
                d&apos;attesa?
              </p>
              <p className="mt-2 text-lg font-bold text-namo-orange">
                Posizione #{waitlistPosition}
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetAndClose}
                className="rounded-full"
              >
                Annulla
              </Button>
              <Button
                onClick={handleWaitlistJoin}
                disabled={isPending}
                className="rounded-full bg-namo-orange text-white hover:bg-namo-orange/90"
              >
                {isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Unisciti alla lista d&apos;attesa
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <>
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-namo-green/10">
                <CheckCircle2 className="h-6 w-6 text-namo-green" />
              </div>
              <DialogTitle className="text-center">
                {finalStatus === 'confirmed'
                  ? 'Iscrizione confermata!'
                  : "Aggiunto alla lista d'attesa"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {finalStatus === 'confirmed'
                  ? `Sei iscritto a "${event.title}"`
                  : `Sei in posizione #${waitlistPosition} per "${event.title}"`}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="sm:justify-center">
              <Button
                onClick={resetAndClose}
                className="rounded-full bg-namo-cyan text-white hover:bg-namo-cyan/90"
              >
                Chiudi
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <>
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-namo-red/10">
                <AlertTriangle className="h-6 w-6 text-namo-red" />
              </div>
              <DialogTitle className="text-center">Errore</DialogTitle>
              <DialogDescription className="text-center">
                {errorMessage}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="sm:justify-center">
              <Button
                variant="outline"
                onClick={resetAndClose}
                className="rounded-full"
              >
                Chiudi
              </Button>
              <Button
                onClick={() => {
                  setStep('confirm')
                  setErrorMessage('')
                }}
                className="rounded-full bg-namo-cyan text-white hover:bg-namo-cyan/90"
              >
                Riprova
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
