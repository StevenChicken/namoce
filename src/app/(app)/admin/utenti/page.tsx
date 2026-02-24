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
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Users className="h-7 w-7 text-namo-charcoal" />
        <h1 className="text-2xl font-bold">Gestione utenti</h1>
      </div>

      {/* Pending approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Richieste in attesa
            {pendingUsers.length > 0 && (
              <Badge variant="secondary" className="bg-namo-orange/10 text-namo-orange">
                {pendingUsers.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nessuna richiesta in attesa
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Settori</TableHead>
                    <TableHead className="hidden md:table-cell">Data registrazione</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((pendingUser) => (
                    <TableRow key={pendingUser.id}>
                      <TableCell className="font-medium">
                        {pendingUser.firstName} {pendingUser.lastName}
                      </TableCell>
                      <TableCell>{pendingUser.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {pendingUser.sectorsOfInterest?.join(', ') ?? '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
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
                              className="rounded-full text-namo-red hover:bg-namo-red/10"
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
      <Card>
        <CardHeader>
          <CardTitle>Tutti gli utenti</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUsersView users={allUsers} currentUserId={currentUserId} />
        </CardContent>
      </Card>
    </div>
  )
}
