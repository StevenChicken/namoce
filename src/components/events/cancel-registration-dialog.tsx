'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cancelRegistration } from '@/features/registrations/actions'

interface CancelRegistrationDialogProps {
  registrationId: string
  eventTitle: string
  eventStartAt: string | Date
  cancellationDeadlineHours: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelRegistrationDialog({
  registrationId,
  eventTitle,
  eventStartAt,
  cancellationDeadlineHours,
  open,
  onOpenChange,
}: CancelRegistrationDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const startAt = new Date(eventStartAt)
  const now = new Date()
  const hoursUntilEvent = (startAt.getTime() - now.getTime()) / (1000 * 60 * 60)
  const isLateCancellation =
    cancellationDeadlineHours !== null &&
    hoursUntilEvent < cancellationDeadlineHours

  function handleCancel() {
    startTransition(async () => {
      try {
        await cancelRegistration({ registrationId })
        toast.success('Iscrizione annullata')
        onOpenChange(false)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Errore durante l'annullamento"
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Annulla iscrizione</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler annullare l&apos;iscrizione a &ldquo;{eventTitle}&rdquo;?
          </DialogDescription>
        </DialogHeader>

        {isLateCancellation && (
          <div className="flex items-start gap-2.5 rounded-lg bg-namo-orange/5 p-3 text-sm text-namo-orange">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Questa è una cancellazione tardiva e verrà segnalata.
              L&apos;evento inizia tra meno di {cancellationDeadlineHours} ore.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-namo-red/5 p-3 text-sm text-namo-red">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-full"
          >
            Torna indietro
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-full"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Annulla iscrizione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
