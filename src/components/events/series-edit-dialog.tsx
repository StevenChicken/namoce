'use client'

import { useState } from 'react'
import type { Event } from '@/db/schema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Layers } from 'lucide-react'
import { EventFormDialog } from './event-form-dialog'

type SeriesScope = 'single' | 'future' | 'all'

interface SeriesEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event
  onSuccess: () => void
}

export function SeriesEditDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
}: SeriesEditDialogProps) {
  const [scope, setScope] = useState<SeriesScope>('single')
  const [showForm, setShowForm] = useState(false)

  function handleProceed() {
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    onOpenChange(false)
    setScope('single')
  }

  function handleFormSuccess() {
    setShowForm(false)
    onOpenChange(false)
    setScope('single')
    onSuccess()
  }

  if (showForm && event) {
    return (
      <EventFormDialog
        open={true}
        onOpenChange={(open) => {
          if (!open) handleFormClose()
        }}
        event={event}
        seriesScope={scope}
        onSuccess={handleFormSuccess}
      />
    )
  }

  const options: { value: SeriesScope; label: string; description: string }[] =
    [
      {
        value: 'single',
        label: 'Solo questo evento',
        description: 'Le modifiche verranno applicate solo a questo evento.',
      },
      {
        value: 'future',
        label: 'Questo e i futuri',
        description:
          'Le modifiche verranno applicate a questo evento e a tutti gli eventi futuri della serie.',
      },
      {
        value: 'all',
        label: 'Tutti gli eventi della serie',
        description:
          'Le modifiche verranno applicate a tutti gli eventi della serie.',
      },
    ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Modifica evento della serie
          </DialogTitle>
          <DialogDescription>
            Questo evento fa parte di una serie. Scegli quali eventi vuoi
            modificare.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                scope === option.value
                  ? 'border-namo-cyan bg-namo-cyan/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                name="seriesScope"
                value={option.value}
                checked={scope === option.value}
                onChange={(e) => setScope(e.target.value as SeriesScope)}
                className="mt-0.5 accent-namo-cyan"
              />
              <div>
                <Label className="cursor-pointer font-medium">
                  {option.label}
                </Label>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </Button>
          <Button
            className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
            onClick={handleProceed}
          >
            Continua
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
