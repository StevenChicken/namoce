'use client'

import { Suspense } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login, signInWithGoogle, type AuthActionResult } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function AccediForm() {
  const searchParams = useSearchParams()
  const suspendedError = searchParams.get('error') === 'account_suspended'
  const [state, formAction, isPending] = useActionState<AuthActionResult, FormData>(login, {})

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Accedi</CardTitle>
        <CardDescription>Inserisci le tue credenziali per accedere</CardDescription>
      </CardHeader>
      <CardContent>
        {suspendedError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Il tuo account è stato sospeso. Contatta un amministratore.
            </AlertDescription>
          </Alert>
        )}

        {state.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full rounded-full">
            {isPending ? 'Accesso in corso...' : 'Accedi'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">oppure</span>
          </div>
        </div>

        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" className="w-full rounded-full">
            Accedi con Google
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <Link
            href="/recupera-password"
            className="text-namo-cyan hover:underline"
          >
            Password dimenticata?
          </Link>
          <p className="text-muted-foreground">
            Non hai un account?{' '}
            <Link href="/registrati" className="text-namo-cyan hover:underline">
              Registrati
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AccediPage() {
  return (
    <Suspense>
      <AccediForm />
    </Suspense>
  )
}
