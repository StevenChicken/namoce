'use client'

import { useState } from 'react'
import { MoreHorizontal, Pause, Play, Trash2, XCircle, UserCog, Heart, FolderCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmUserActionDialog } from './confirm-user-action-dialog'
import { RoleManagementDialog } from './role-management-dialog'
import { ClownNameDialog } from './clown-name-dialog'
import { CategoryPermissionsDialog } from './category-permissions-dialog'

type UserAction = 'suspend' | 'reactivate' | 'deactivate' | 'gdpr_delete'

interface UserActionsDropdownProps {
  userId: string
  userName: string
  userStatus: string
  userType: string
  adminLevel: string
  clownName: string | null
  currentUserId: string
}

export function UserActionsDropdown({
  userId,
  userName,
  userStatus,
  userType,
  adminLevel,
  clownName,
  currentUserId,
}: UserActionsDropdownProps) {
  const [dialogAction, setDialogAction] = useState<UserAction | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [clownNameOpen, setClownNameOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  // Don't show actions for self
  if (userId === currentUserId) {
    return null
  }

  function openConfirmDialog(action: UserAction) {
    setDialogAction(action)
    setConfirmOpen(true)
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
          {/* Role management */}
          <DropdownMenuItem onClick={() => setRoleOpen(true)}>
            <UserCog className="mr-2 h-4 w-4 text-namo-cyan" />
            Gestisci ruolo
          </DropdownMenuItem>

          {/* Clown name (only for volontario) */}
          {userType === 'volontario' && (
            <DropdownMenuItem onClick={() => setClownNameOpen(true)}>
              <Heart className="mr-2 h-4 w-4 text-namo-cyan" />
              Modifica Nome Clown
            </DropdownMenuItem>
          )}

          {/* Category permissions (only for admin-level users) */}
          {(adminLevel === 'admin' || adminLevel === 'super_admin') && (
            <DropdownMenuItem onClick={() => setCategoryOpen(true)}>
              <FolderCog className="mr-2 h-4 w-4 text-namo-cyan" />
              Gestisci categorie evento
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Status actions */}
          {userStatus === 'active' && (
            <>
              <DropdownMenuItem onClick={() => openConfirmDialog('suspend')}>
                <Pause className="mr-2 h-4 w-4 text-namo-orange" />
                Sospendi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openConfirmDialog('deactivate')}>
                <XCircle className="mr-2 h-4 w-4 text-namo-red" />
                Disattiva
              </DropdownMenuItem>
            </>
          )}
          {userStatus === 'suspended' && (
            <>
              <DropdownMenuItem onClick={() => openConfirmDialog('reactivate')}>
                <Play className="mr-2 h-4 w-4 text-namo-green" />
                Riattiva
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openConfirmDialog('deactivate')}>
                <XCircle className="mr-2 h-4 w-4 text-namo-red" />
                Disattiva
              </DropdownMenuItem>
            </>
          )}
          {userStatus === 'deactivated' && (
            <>
              <DropdownMenuItem onClick={() => openConfirmDialog('reactivate')}>
                <Play className="mr-2 h-4 w-4 text-namo-green" />
                Riattiva
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openConfirmDialog('gdpr_delete')}>
                <Trash2 className="mr-2 h-4 w-4 text-namo-red" />
                Elimina dati (GDPR)
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmUserActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        action={dialogAction}
        userId={userId}
        userName={userName}
      />

      <RoleManagementDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        userId={userId}
        userName={userName}
        currentUserType={userType}
        currentAdminLevel={adminLevel}
      />

      <ClownNameDialog
        open={clownNameOpen}
        onOpenChange={setClownNameOpen}
        userId={userId}
        userName={userName}
        currentClownName={clownName}
      />

      <CategoryPermissionsDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        userId={userId}
        userName={userName}
      />
    </>
  )
}
