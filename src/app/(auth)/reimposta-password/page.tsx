'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updatePassword, type AuthActionResult } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

export default function ReimpostaPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult, FormData>(
    updatePassword,
    {}
  )

  if (state.success) {
    return (
      <Card className="border-0 shadow-[6px_6px_9px_rgba(0,0,0,0.08)]">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-namo-green/10">
            <CheckCircle2 className="h-8 w-8 text-namo-green" />
          </div>
          <CardTitle className="text-2xl font-bold text-namo-charcoal">Password aggiornata</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-8 text-muted-foreground">
            La tua password è stata aggiornata con successo.
          </p>
          <Link href="/accedi">
            <Button className="rounded-full px-8 font-semibold">Vai al login</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-[6px_6px_9px_rgba(0,0,0,0.08)]">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-2xl font-bold text-namo-charcoal">Nuova password</CardTitle>
        <CardDescription>Inserisci la tua nuova password</CardDescription>
      </CardHeader>
      <CardContent>
        {state.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Nuova password</Label>
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

          <Button type="submit" disabled={isPending} className="mt-1 h-11 w-full rounded-full text-base font-semibold">
            {isPending ? 'Aggiornamento in corso...' : 'Aggiorna password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
