import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth'
import { getPendingUsers, getAllUsers } from '@/features/users/queries'
import { approveVolunteer, rejectVolunteer } from '@/features/users/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, UserCheck, UserX } from 'lucide-react'
import { AdminUsersView } from '@/components/admin/admin-users-view'

export default async function AdminUtentiPage() {
  let currentUserId: string
  try {
    currentUserId = await requireSuperAdmin()
  } catch {
    redirect('/calendario')
  }

  const [pendingUsers, allUsers] = await Promise.all([
    getPendingUsers(),
    getAllUsers(),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-namo-charcoal/5">
          <Users className="h-5 w-5 text-namo-charcoal" />
        </div>
        <h1 className="text-2xl font-bold text-namo-charcoal">Gestione utenti</h1>
      </div>

      {/* Pending approvals */}
      <Card className="overflow-hidden rounded-xl border shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-base">
            Richieste in attesa
            {pendingUsers.length > 0 && (
              <Badge variant="secondary" className="bg-namo-orange/10 text-namo-orange">
                {pendingUsers.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <UserCheck className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nessuna richiesta in attesa
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Settori</TableHead>
                    <TableHead className="hidden md:table-cell">Data registrazione</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((pendingUser) => (
                    <TableRow key={pendingUser.id} className="transition-colors hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {pendingUser.firstName} {pendingUser.lastName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{pendingUser.email}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {pendingUser.sectorsOfInterest?.join(', ') ?? '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {new Date(pendingUser.createdAt).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <form action={approveVolunteer.bind(null, pendingUser.id)}>
                            <Button size="sm" className="rounded-full bg-namo-green hover:bg-namo-green/90">
                              <UserCheck className="mr-1 h-4 w-4" />
                              Approva
                            </Button>
                          </form>
                          <form action={rejectVolunteer.bind(null, pendingUser.id)}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-namo-red hover:bg-namo-red/10 hover:text-namo-red"
                            >
                              <UserX className="mr-1 h-4 w-4" />
                              Rifiuta
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All users */}
      <Card className="overflow-hidden rounded-xl border shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">Tutti gli utenti</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <AdminUsersView users={allUsers} currentUserId={currentUserId} />
        </CardContent>
      </Card>
    </div>
  )
}
