'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register, type AuthActionResult } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sectors } from '@/types/enums'
import { CheckCircle2 } from 'lucide-react'

export default function RegistratiPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult, FormData>(register, {})

  if (state.success) {
    return (
      <Card className="border-0 shadow-[6px_6px_9px_rgba(0,0,0,0.08)]">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-namo-green/10">
            <CheckCircle2 className="h-8 w-8 text-namo-green" />
          </div>
          <CardTitle className="text-2xl font-bold text-namo-charcoal">Registrazione completata</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-2 text-muted-foreground">
            Il tuo account è stato creato con successo.
          </p>
          <p className="mb-8 text-muted-foreground">
            Un amministratore dovrà approvare la tua registrazione. Riceverai una email quando il tuo account sarà attivato.
          </p>
          <Link href="/accedi">
            <Button className="rounded-full px-8 font-semibold">Torna al login</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-[6px_6px_9px_rgba(0,0,0,0.08)]">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-2xl font-bold text-namo-charcoal">Registrati</CardTitle>
        <CardDescription>Crea il tuo account volontario</CardDescription>
      </CardHeader>
      <CardContent>
        {state.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">Nome *</Label>
              <Input id="firstName" name="firstName" required className="h-11" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Cognome *</Label>
              <Input id="lastName" name="lastName" required className="h-11" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="la-tua@email.it"
              required
              autoComplete="email"
              className="h-11"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              autoComplete="new-password"
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">Almeno 6 caratteri</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefono</Label>
            <Input id="phone" name="phone" type="tel" className="h-11" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nickname">Nickname</Label>
            <Input id="nickname" name="nickname" className="h-11" />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Settori di interesse</Label>
            <div className="flex flex-col gap-2.5 rounded-lg border border-border p-3">
              {Sectors.map((sector) => (
                <label key={sector} className="flex items-center gap-2.5 text-sm">
                  <Checkbox name="sectorsOfInterest" value={sector} />
                  {sector}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Note</Label>
            <Textarea id="notes" name="notes" placeholder="Informazioni aggiuntive (opzionale)" />
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
            <Checkbox id="privacy" name="privacy" required className="mt-0.5" />
            <Label htmlFor="privacy" className="text-sm leading-snug">
              Accetto il trattamento dei dati personali ai sensi del GDPR *
            </Label>
          </div>

          <Button type="submit" disabled={isPending} className="mt-1 h-11 w-full rounded-full text-base font-semibold">
            {isPending ? 'Registrazione in corso...' : 'Registrati'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Hai già un account?{' '}
          <Link href="/accedi" className="font-medium text-namo-cyan transition-colors hover:text-namo-cyan/80 hover:underline">
            Accedi
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
