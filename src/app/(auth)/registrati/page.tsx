'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register, signInWithGoogle, type AuthActionResult } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

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

        <form action={signInWithGoogle}>
          <Button
            type="submit"
            variant="outline"
            className="h-11 w-full rounded-full font-medium transition-colors hover:bg-secondary"
          >
            <GoogleIcon />
            Registrati con Google
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs uppercase tracking-wider text-namo-muted">
              oppure compila il modulo
            </span>
          </div>
        </div>

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
