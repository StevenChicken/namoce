'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerExternalUser } from '@/features/registrations/actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'

const formSchema = z.object({
  firstName: z.string().min(1, 'Il nome è obbligatorio'),
  lastName: z.string().min(1, 'Il cognome è obbligatorio'),
  email: z.string().email('Indirizzo email non valido'),
  phone: z.string().optional(),
  privacy: z.boolean().refine((val) => val === true, {
    message: 'Devi accettare il trattamento dei dati personali',
  }),
})

type FormValues = z.infer<typeof formSchema>

interface ExternalRegistrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  eventTitle: string
}

type DialogState = 'form' | 'success' | 'full' | 'duplicate'

export function ExternalRegistrationDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
}: ExternalRegistrationDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [dialogState, setDialogState] = useState<DialogState>('form')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      privacy: false,
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      // Reset state when closing
      setTimeout(() => {
        setDialogState('form')
        form.reset()
      }, 200)
    }
    onOpenChange(nextOpen)
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await registerExternalUser({
          eventId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
        })
        setDialogState('success')
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Errore durante l'iscrizione"

        if (message.includes('al completo')) {
          setDialogState('full')
        } else if (message.includes('già iscritto')) {
          setDialogState('duplicate')
        } else {
          form.setError('root', { message })
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {dialogState === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-namo-charcoal">
                Iscriviti all&apos;evento
              </DialogTitle>
              <DialogDescription>
                Non serve un account — registrati in 30 secondi
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mario"
                            autoComplete="given-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cognome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rossi"
                            autoComplete="family-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="mario.rossi@email.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Telefono{' '}
                        <span className="font-normal text-muted-foreground">
                          (opzionale)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+39 333 1234567"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Acconsento al trattamento dei dati personali ai sensi
                          del GDPR per la gestione dell&apos;iscrizione
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <p className="text-sm font-medium text-namo-red">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => handleOpenChange(false)}
                    disabled={isPending}
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iscrizione...
                      </>
                    ) : (
                      'Iscriviti'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}

        {dialogState === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-namo-green/10">
              <CheckCircle2 className="h-8 w-8 text-namo-green" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-namo-charcoal">
                Iscrizione confermata!
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Riceverai un&apos;email di conferma per{' '}
                <span className="font-medium text-namo-charcoal">
                  {eventTitle}
                </span>
                .
              </p>
            </div>
            <Button
              className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
              onClick={() => handleOpenChange(false)}
            >
              Chiudi
            </Button>
          </div>
        )}

        {dialogState === 'full' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-namo-red/10">
              <svg
                className="h-8 w-8 text-namo-red"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-namo-charcoal">
                Evento al completo
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Non è stato possibile iscriverti. Tutti i posti sono esauriti.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => handleOpenChange(false)}
            >
              Chiudi
            </Button>
          </div>
        )}

        {dialogState === 'duplicate' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-namo-orange/10">
              <svg
                className="h-8 w-8 text-namo-orange"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-namo-charcoal">
                Già iscritto
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sei già iscritto a questo evento con questa email.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => handleOpenChange(false)}
            >
              Chiudi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
