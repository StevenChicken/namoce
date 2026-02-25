'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Inserisci un indirizzo email valido'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
})

const registerSchema = z.object({
  email: z.string().email('Inserisci un indirizzo email valido'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
  firstName: z.string().min(1, 'Il nome è obbligatorio'),
  lastName: z.string().min(1, 'Il cognome è obbligatorio'),
  nickname: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  privacy: z.literal(true, { message: 'Devi accettare il trattamento dei dati personali' }),
})

const resetPasswordSchema = z.object({
  email: z.string().email('Inserisci un indirizzo email valido'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
})

export type AuthActionResult = {
  error?: string
  success?: boolean
}

export async function login(
  _prevState: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Email o password non validi' }
  }

  redirect('/calendario')
}

export async function register(
  _prevState: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  try {
    const raw = {
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      nickname: formData.get('nickname') || undefined,
      phone: formData.get('phone') || undefined,
      notes: formData.get('notes') || undefined,
      privacy: formData.get('privacy') === 'on',
    }

    const parsed = registerSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const supabase = await createServerClient()

    // Pass profile data as user metadata so the DB trigger can populate public.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          nickname: parsed.data.nickname || null,
          phone_encrypted: parsed.data.phone || null,
          notes: parsed.data.notes || null,
        },
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return { error: 'Questa email è già registrata' }
      }
      return { error: 'Errore durante la registrazione. Riprova più tardi.' }
    }

    // Fallback: update public.users via admin client (bypasses RLS)
    if (authData.user) {
      const admin = createAdminClient()
      const { error: updateError } = await admin
        .from('users')
        .update({
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          nickname: parsed.data.nickname || null,
          phone_encrypted: parsed.data.phone || null,
          notes: parsed.data.notes || null,
        })
        .eq('id', authData.user.id)

      if (updateError) {
        console.error('Failed to update user profile:', updateError)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Errore durante la registrazione. Riprova più tardi.' }
  }
}

export async function requestPasswordReset(
  _prevState: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const raw = { email: formData.get('email') }
  const parsed = resetPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createServerClient()

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reimposta-password`,
  })

  // Always return success to not reveal whether the email exists
  return { success: true }
}

export async function updatePassword(
  _prevState: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const raw = { password: formData.get('password') }
  const parsed = updatePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createServerClient()

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Errore durante il cambio password. Il link potrebbe essere scaduto.' }
  }

  return { success: true }
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error || !data.url) {
    redirect('/accedi?error=google_auth')
  }

  redirect(data.url)
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/accedi')
}
