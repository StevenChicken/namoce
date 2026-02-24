'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { mainNavItems } from './nav-items'
import { Shield } from 'lucide-react'

interface MobileNavProps {
  isAdmin: boolean
}

export function MobileNav({ isAdmin }: MobileNavProps) {
  const pathname = usePathname()

  const items = isAdmin
    ? [...mainNavItems, { label: 'ADMIN', href: '/admin/utenti', icon: Shield, adminOnly: true }]
    : mainNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.adminOnly && pathname.startsWith('/admin'))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 px-2 py-3 text-xs transition-colors',
                isActive
                  ? 'text-namo-cyan'
                  : 'text-namo-charcoal/50 hover:text-namo-charcoal'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-b-full bg-namo-cyan" />
              )}
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
