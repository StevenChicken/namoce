'use client'

import { signOut } from '@/features/auth/actions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  firstName: string | null
  lastName: string | null
  email: string
}

export function UserMenu({ firstName, lastName, email }: UserMenuProps) {
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join('')

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-secondary">
        <Avatar className="h-8 w-8 ring-2 ring-namo-cyan/20">
          <AvatarFallback className="bg-namo-charcoal text-xs font-semibold text-white">
            {initials || email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium text-namo-charcoal md:inline">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 shadow-[6px_6px_9px_rgba(0,0,0,0.08)]">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold text-namo-charcoal">{displayName}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profilo" className="flex items-center gap-2.5 py-2">
            <User className="h-4 w-4" />
            Il mio profilo
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOut} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2.5 py-0.5">
              <LogOut className="h-4 w-4" />
              Esci
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
