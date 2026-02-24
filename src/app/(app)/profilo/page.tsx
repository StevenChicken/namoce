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
      return 'bg-[#00d084]/10 text-[#00d084] border-[#00d084]/20'
    case 'pending':
      return 'bg-[#ff6900]/10 text-[#ff6900] border-[#ff6900]/20'
    case 'suspended':
    case 'deactivated':
      return 'bg-[#cf2e2e]/10 text-[#cf2e2e] border-[#cf2e2e]/20'
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
  const sectors = user.sectorsOfInterest ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold text-[#32373c]">Il mio profilo</h1>

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-0">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0693e3]/10 text-lg font-semibold text-[#0693e3]">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="truncate text-lg font-semibold text-[#32373c]">
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

          {sectors.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#32373c]">
                  Settori di interesse
                </p>
                <div className="flex flex-wrap gap-2">
                  {sectors.map((sector) => (
                    <Badge
                      key={sector}
                      variant="outline"
                      className="border-[#0693e3]/20 bg-[#0693e3]/10 text-[#0693e3]"
                    >
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {sectors.length === 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#32373c]">
                  Settori di interesse
                </p>
                <p className="text-muted-foreground text-xs">
                  Nessun settore selezionato
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#0693e3]" />
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
      <Card className="border-[#cf2e2e]/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#cf2e2e]" />
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
