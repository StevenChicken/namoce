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

export default function RegistratiPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult, FormData>(register, {})

  if (state.success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Registrazione completata</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">
            Il tuo account è stato creato con successo. Un amministratore dovrà approvare la tua registrazione prima che tu possa accedere.
          </p>
          <p className="mb-6 text-muted-foreground">
            Riceverai una email quando il tuo account sarà attivato.
          </p>
          <Link href="/accedi">
            <Button className="rounded-full">Torna al login</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Registrati</CardTitle>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">Nome *</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Cognome *</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="la-tua@email.it"
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Almeno 6 caratteri</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input id="nickname" name="nickname" />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Settori di interesse</Label>
            <div className="flex flex-col gap-2">
              {Sectors.map((sector) => (
                <label key={sector} className="flex items-center gap-2 text-sm">
                  <Checkbox name="sectorsOfInterest" value={sector} />
                  {sector}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea id="notes" name="notes" placeholder="Informazioni aggiuntive (opzionale)" />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox id="privacy" name="privacy" required />
            <Label htmlFor="privacy" className="text-sm leading-snug">
              Accetto il trattamento dei dati personali ai sensi del GDPR *
            </Label>
          </div>

          <Button type="submit" disabled={isPending} className="w-full rounded-full">
            {isPending ? 'Registrazione in corso...' : 'Registrati'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Hai già un account?{' '}
          <Link href="/accedi" className="text-namo-cyan hover:underline">
            Accedi
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
