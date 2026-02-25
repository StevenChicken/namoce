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
import { AlertTriangle, Bell, Calendar, Mail, Shield } from 'lucide-react'
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog'

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

function getRoleLabel(role: string): string {
  return role === 'super_admin' ? 'Super Admin' : 'Volontario'
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Attivo'
    case 'pending':
      return 'In attesa'
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
    case 'pending':
      return 'bg-namo-orange/10 text-namo-orange border-namo-orange/20'
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
                <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">
                Membro dal {formatDate(user.createdAt)}
              </span>
            </div>
            {user.role === 'super_admin' && (
              <div className="flex items-center gap-3 text-sm">
                <Shield className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="text-muted-foreground">Amministratore</span>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

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
