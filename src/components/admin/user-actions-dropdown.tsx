'use client'

import { useState } from 'react'
import { MoreHorizontal, Pause, Play, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmUserActionDialog } from './confirm-user-action-dialog'

type UserAction = 'suspend' | 'reactivate' | 'deactivate' | 'gdpr_delete'

interface UserActionsDropdownProps {
  userId: string
  userName: string
  userStatus: string
  userRole: string
  currentUserId: string
}

export function UserActionsDropdown({
  userId,
  userName,
  userStatus,
  userRole,
  currentUserId,
}: UserActionsDropdownProps) {
  const [dialogAction, setDialogAction] = useState<UserAction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Don't show actions for self or other super_admins
  if (userId === currentUserId || userRole === 'super_admin') {
    return null
  }

  function openDialog(action: UserAction) {
    setDialogAction(action)
    setDialogOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Azioni</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {userStatus === 'active' && (
            <>
              <DropdownMenuItem onClick={() => openDialog('suspend')}>
                <Pause className="mr-2 h-4 w-4 text-namo-orange" />
                Sospendi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialog('deactivate')}>
                <XCircle className="mr-2 h-4 w-4 text-namo-red" />
                Disattiva
              </DropdownMenuItem>
            </>
          )}
          {userStatus === 'suspended' && (
            <>
              <DropdownMenuItem onClick={() => openDialog('reactivate')}>
                <Play className="mr-2 h-4 w-4 text-namo-green" />
                Riattiva
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialog('deactivate')}>
                <XCircle className="mr-2 h-4 w-4 text-namo-red" />
                Disattiva
              </DropdownMenuItem>
            </>
          )}
          {userStatus === 'deactivated' && (
            <>
              <DropdownMenuItem onClick={() => openDialog('reactivate')}>
                <Play className="mr-2 h-4 w-4 text-namo-green" />
                Riattiva
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialog('gdpr_delete')}>
                <Trash2 className="mr-2 h-4 w-4 text-namo-red" />
                Elimina dati (GDPR)
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmUserActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        action={dialogAction}
        userId={userId}
        userName={userName}
      />
    </>
  )
}
