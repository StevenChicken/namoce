import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/auth'
import { getAllUsers } from '@/features/users/queries'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminUsersView } from '@/components/admin/admin-users-view'

export default async function AdminUtentiPage() {
  let currentUserId: string
  try {
    currentUserId = await requireSuperAdmin()
  } catch {
    redirect('/calendario_eventi')
  }

  const allUsers = await getAllUsers()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-namo-charcoal/5">
          <Users className="h-5 w-5 text-namo-charcoal" />
        </div>
        <h1 className="text-2xl font-bold text-namo-charcoal">Gestione utenti</h1>
      </div>

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
