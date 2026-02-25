'use client'

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import type { Event } from '@/db/schema'
import { EventCategories } from '@/types/enums'
import {
  createEvent,
  updateEvent,
  updateSeriesEvents,
} from '@/features/events/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface FormValues {
  title: string
  type: 'interno' | 'aperto'
  category: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  location: string
  capacity: string
  minVolunteers: string
  notes: string
  cancellationDeadlineHours: string
  waitlistLimit: string
  reminderHours: string
  attendanceGracePeriodHours: string
}

function toLocalDateStr(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toLocalTimeStr(date: Date): string {
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function parseOptionalInt(value: string): number | null {
  if (!value || value.trim() === '') return null
  const n = parseInt(value, 10)
  return isNaN(n) ? null : n
}

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event
  seriesScope?: 'single' | 'future' | 'all'
  onSuccess: () => void
  allowedCategories?: string[]
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  seriesScope,
  onSuccess,
  allowedCategories,
}: EventFormDialogProps) {
  const availableCategories = allowedCategories ?? EventCategories
  const isEdit = !!event
  const [isPending, startTransition] = useTransition()

  const emptyValues: FormValues = {
    title: '',
    type: 'interno',
    category: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    capacity: '',
    minVolunteers: '',
    notes: '',
    cancellationDeadlineHours: '',
    waitlistLimit: '',
    reminderHours: '',
    attendanceGracePeriodHours: '48',
  }

  function eventToFormValues(e: Event): FormValues {
    return {
      title: e.title,
      type: e.type,
      category: e.sectors?.[0] ?? '',
      startDate: toLocalDateStr(e.startAt),
      startTime: toLocalTimeStr(e.startAt),
      endDate: toLocalDateStr(e.endAt),
      endTime: toLocalTimeStr(e.endAt),
      location: e.location ?? '',
      capacity: String(e.capacity ?? ''),
      minVolunteers: e.minVolunteers ? String(e.minVolunteers) : '',
      notes: e.notes ?? '',
      cancellationDeadlineHours: e.cancellationDeadlineHours
        ? String(e.cancellationDeadlineHours)
        : '',
      waitlistLimit: e.waitlistLimit ? String(e.waitlistLimit) : '',
      reminderHours: e.reminderHours ? String(e.reminderHours) : '',
      attendanceGracePeriodHours: e.attendanceGracePeriodHours
        ? String(e.attendanceGracePeriodHours)
        : '',
    }
  }

  const form = useForm<FormValues>({
    defaultValues: event ? eventToFormValues(event) : emptyValues,
  })

  // Reset form values when dialog opens or event changes
  useEffect(() => {
    if (open) {
      form.reset(event ? eventToFormValues(event) : emptyValues)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event])

  const watchType = form.watch('type')

  function validate(values: FormValues): string | null {
    if (!values.title.trim()) return 'Il titolo è obbligatorio'
    if (!values.location.trim()) return 'La posizione è obbligatoria'
    if (!values.startDate || !values.startTime)
      return 'La data e ora di inizio sono obbligatorie'
    if (!values.endDate || !values.endTime)
      return 'La data e ora di fine sono obbligatorie'

    const capacity = parseInt(values.capacity, 10)
    if (isNaN(capacity) || capacity <= 0)
      return 'La capienza deve essere maggiore di zero'

    const start = new Date(`${values.startDate}T${values.startTime}`)
    const end = new Date(`${values.endDate}T${values.endTime}`)
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      return 'Date non valide'
    if (end <= start)
      return 'La data di fine deve essere successiva alla data di inizio'

    return null
  }

  function onSubmit(values: FormValues) {
    const error = validate(values)
    if (error) {
      toast.error(error)
      return
    }

    const payload = {
      title: values.title.trim(),
      type: values.type,
      category: values.category || null,
      startAt: new Date(`${values.startDate}T${values.startTime}`),
      endAt: new Date(`${values.endDate}T${values.endTime}`),
      location: values.location.trim(),
      capacity: parseInt(values.capacity, 10),
      minVolunteers: parseOptionalInt(values.minVolunteers),
      notes: values.notes.trim() || null,
      cancellationDeadlineHours: parseOptionalInt(
        values.cancellationDeadlineHours
      ),
      waitlistLimit: parseOptionalInt(values.waitlistLimit),
      reminderHours: parseOptionalInt(values.reminderHours),
      attendanceGracePeriodHours: parseOptionalInt(
        values.attendanceGracePeriodHours
      ),
    }

    startTransition(async () => {
      try {
        if (isEdit) {
          if (seriesScope && seriesScope !== 'single') {
            await updateSeriesEvents(event.id, seriesScope, payload)
            toast.success('Serie aggiornata')
          } else {
            await updateEvent(event.id, payload)
            toast.success('Evento aggiornato')
          }
        } else {
          await createEvent(payload)
          toast.success('Evento creato come bozza')
        }
        onOpenChange(false)
        form.reset()
        onSuccess()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Errore nel salvataggio'
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-[600px] p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-namo-charcoal">
            {isEdit ? 'Modifica evento' : 'Nuovo evento'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] px-6 pb-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titolo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome dell'evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type + Location row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleziona tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="interno">Interno</SelectItem>
                          <SelectItem value="aperto">Aperto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Luogo</FormLabel>
                      <FormControl>
                        <Input placeholder="Indirizzo o luogo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category (only for interno events) */}
              {watchType === 'interno' && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleziona categoria (opzionale)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Start date/time */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data inizio</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ora inizio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* End date/time */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data fine</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ora fine</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Capacity + Min Volunteers */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capienza</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Numero massimo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchType === 'interno' && (
                  <FormField
                    control={form.control}
                    name="minVolunteers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimo volontari</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Opzionale"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Note aggiuntive (opzionale)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Advanced settings */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cancellationDeadlineHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scadenza cancellazione (ore)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="es. 24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waitlistLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite lista d&apos;attesa</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Opzionale"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reminderHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promemoria (ore prima)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="es. 48"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attendanceGracePeriodHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correzione presenze (ore)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="es. 48"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
                  disabled={isPending}
                >
                  {isPending
                    ? 'Salvataggio...'
                    : isEdit
                      ? 'Salva modifiche'
                      : 'Salva come bozza'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
