import { requireAuthenticated } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getNotificationPreferences } from '@/features/notifications/queries'
import { NotificationPreferencesForm } from '@/components/profile/notification-preferences-form'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Bell, Calendar, Mail, Shield, Heart } from 'lucide-react'
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog'
import { MembershipPaymentCard } from '@/components/profile/membership-payment-card'
import { Suspense } from 'react'

function formatDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ''
  const l = lastName?.charAt(0)?.toUpperCase() ?? ''
  return f + l || '?'
}

function getUserTypeLabel(userType: string): string {
  return userType === 'volontario' ? 'Volontario' : 'Utente'
}

function getAdminLevelLabel(adminLevel: string): string {
  switch (adminLevel) {
    case 'super_admin':
      return 'Super Admin'
    case 'admin':
      return 'Admin'
    default:
      return ''
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Attivo'
    case 'suspended':
      return 'Sospeso'
    case 'deactivated':
      return 'Disattivato'
    default:
      return status
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-namo-green/10 text-namo-green border-namo-green/20'
    case 'suspended':
    case 'deactivated':
      return 'bg-namo-red/10 text-namo-red border-namo-red/20'
    default:
      return ''
  }
}

export default async function ProfiloPage() {
  const userId = await requireAuthenticated()

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const user = result[0]
  if (!user) {
    throw new Error('Utente non trovato')
  }

  const prefs = await getNotificationPreferences(userId)
  const informationalEnabled = prefs?.informationalEmailsEnabled ?? true

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-namo-charcoal">Il mio profilo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestisci le tue informazioni e preferenze
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-0">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-namo-cyan/10 text-lg font-semibold text-namo-cyan shadow-sm">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="truncate text-lg font-semibold text-namo-charcoal">
                {fullName || 'Nome non impostato'}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={getStatusColor(user.status)}
                >
                  {getStatusLabel(user.status)}
                </Badge>
                <Badge variant="secondary">
                  {getUserTypeLabel(user.userType)}
                </Badge>
                {user.adminLevel !== 'none' && (
                  <Badge variant="default" className="bg-namo-charcoal">
                    {getAdminLevelLabel(user.adminLevel)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-muted-foreground">
                {user.email}
              </span>
            </div>
            {user.clownName && (
              <div className="flex items-center gap-3 text-sm">
                <Heart className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Nome Clown: <span className="font-medium text-namo-charcoal">{user.clownName}</span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                Membro dal {formatDate(user.createdAt)}
              </span>
            </div>
            {user.adminLevel !== 'none' && (
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">Amministratore</span>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Membership Payment Card */}
      {(user.userType === 'volontario' || user.adminLevel !== 'none') && (
        <Suspense fallback={
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Caricamento...</p>
            </CardContent>
          </Card>
        }>
          <MembershipPaymentCard userId={userId} />
        </Suspense>
      )}

      {/* Notification Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-namo-cyan" />
            <CardTitle>Preferenze notifiche</CardTitle>
          </div>
          <CardDescription>
            Gestisci come vuoi essere contattato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPreferencesForm initialEnabled={informationalEnabled} />
        </CardContent>
      </Card>

      {/* Account Deletion Card */}
      <Card className="border-namo-red/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-namo-red" />
            <CardTitle>Eliminazione account</CardTitle>
          </div>
          <CardDescription>
            Puoi richiedere l&apos;eliminazione del tuo account e di tutti i
            dati personali associati. La richiesta verrà elaborata entro 30
            giorni.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  )
}
