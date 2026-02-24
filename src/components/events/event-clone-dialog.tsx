'use client'

import { useState, useTransition } from 'react'
import type { Event } from '@/db/schema'
import { cloneEvent, bulkCloneEvents } from '@/features/events/actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Copy, CalendarDays } from 'lucide-react'
import { it } from 'date-fns/locale'

interface EventCloneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event
  onSuccess: () => void
}

function toDateStr(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function EventCloneDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
}: EventCloneDialogProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined)
  const [bulkDates, setBulkDates] = useState<Date[]>([])
  const [isPending, startTransition] = useTransition()

  function handleClone() {
    if (!event) return

    startTransition(async () => {
      try {
        if (mode === 'single') {
          if (!singleDate) {
            toast.error('Seleziona una data')
            return
          }
          await cloneEvent(event.id, toDateStr(singleDate))
          toast.success('Evento clonato')
        } else {
          if (bulkDates.length === 0) {
            toast.error('Seleziona almeno una data')
            return
          }
          const dateStrs = bulkDates.map(toDateStr)
          await bulkCloneEvents(event.id, dateStrs)
          toast.success(`${bulkDates.length} eventi clonati`)
        }
        onOpenChange(false)
        setSingleDate(undefined)
        setBulkDates([])
        onSuccess()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Errore nella clonazione'
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-namo-charcoal">
            <Copy className="h-5 w-5" />
            Clona evento
          </DialogTitle>
          {event && (
            <DialogDescription>
              Clona &ldquo;{event.title}&rdquo; in nuove date. Gli eventi
              clonati saranno creati come bozza.
            </DialogDescription>
          )}
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as 'single' | 'bulk')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Data singola</TabsTrigger>
            <TabsTrigger value="bulk">Date multiple</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={singleDate}
                onSelect={setSingleDate}
                locale={it}
                disabled={(date) => date < new Date()}
              />
            </div>
            {singleDate && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Data selezionata:{' '}
                <span className="font-medium text-foreground">
                  {singleDate.toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </p>
            )}
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            <div className="flex justify-center">
              <Calendar
                mode="multiple"
                selected={bulkDates}
                onSelect={(dates) => setBulkDates(dates ?? [])}
                locale={it}
                disabled={(date) => date < new Date()}
              />
            </div>
            {bulkDates.length > 0 && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {bulkDates.length}{' '}
                  {bulkDates.length === 1 ? 'data selezionata' : 'date selezionate'}
                </span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annulla
          </Button>
          <Button
            className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
            onClick={handleClone}
            disabled={
              isPending ||
              (mode === 'single' && !singleDate) ||
              (mode === 'bulk' && bulkDates.length === 0)
            }
          >
            {isPending
              ? 'Clonazione...'
              : mode === 'single'
                ? 'Clona'
                : `Clona ${bulkDates.length || ''} eventi`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
