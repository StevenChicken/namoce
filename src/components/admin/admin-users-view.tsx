'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserActionsDropdown } from './user-actions-dropdown'

interface UserRow {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  status: string
  createdAt: Date
}

interface AdminUsersViewProps {
  users: UserRow[]
  currentUserId: string
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tutti' },
  { value: 'active', label: 'Attivo' },
  { value: 'suspended', label: 'Sospeso' },
  { value: 'deactivated', label: 'Disattivato' },
] as const

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-namo-green/10 text-namo-green hover:bg-namo-green/20">
          Attivo
        </Badge>
      )
    case 'suspended':
      return (
        <Badge className="bg-namo-orange/10 text-namo-orange hover:bg-namo-orange/20">
          Sospeso
        </Badge>
      )
    case 'deactivated':
      return (
        <Badge className="bg-namo-red/10 text-namo-red hover:bg-namo-red/20">
          Disattivato
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function AdminUsersView({ users, currentUserId }: AdminUsersViewProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUsers = useMemo(() => {
    const nonPending = users.filter((u) => u.status !== 'pending')
    return nonPending.filter((u) => {
      // Status filter
      if (statusFilter !== 'all' && u.status !== statusFilter) return false

      // Search filter
      if (search) {
        const q = search.toLowerCase()
        const matchesName =
          (u.firstName?.toLowerCase().includes(q) ?? false) ||
          (u.lastName?.toLowerCase().includes(q) ?? false)
        const matchesEmail = u.email.toLowerCase().includes(q)
        if (!matchesName && !matchesEmail) return false
      }

      return true
    })
  }, [users, search, statusFilter])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
            <Search className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nessun utente trovato
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Ruolo</TableHead>
                <TableHead className="font-semibold">Stato</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {u.firstName} {u.lastName}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === 'super_admin' ? 'default' : 'secondary'}
                      className={
                        u.role === 'super_admin' ? 'bg-namo-charcoal' : ''
                      }
                    >
                      {u.role === 'super_admin' ? 'Admin' : 'Volontario'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>
                  <TableCell>
                    <UserActionsDropdown
                      userId={u.id}
                      userName={`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()}
                      userStatus={u.status}
                      userRole={u.role}
                      currentUserId={currentUserId}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {filteredUsers.length} utent{filteredUsers.length === 1 ? 'e' : 'i'}
        {statusFilter !== 'all' || search ? ' (filtrati)' : ''}
      </p>
    </div>
  )
}
