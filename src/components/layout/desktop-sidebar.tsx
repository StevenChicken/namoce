'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { mainNavItems, adminNavItems } from './nav-items'

interface DesktopSidebarProps {
  isAdmin: boolean
}

export function DesktopSidebar({ isAdmin }: DesktopSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border/60 md:bg-card">
      <div className="flex h-16 items-center border-b border-border/60 px-6">
        <Link href="/calendario" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Namo APS"
            width={100}
            height={40}
            className="h-auto w-auto"
          />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'border-l-[3px] border-namo-cyan bg-namo-cyan/8 pl-[9px] text-namo-cyan'
                  : 'border-l-[3px] border-transparent pl-[9px] text-namo-charcoal/70 hover:bg-secondary hover:text-namo-charcoal'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-border/60" />
            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-widest text-namo-muted">
              Amministrazione
            </p>
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'border-l-[3px] border-namo-cyan bg-namo-cyan/8 pl-[9px] text-namo-cyan'
                      : 'border-l-[3px] border-transparent pl-[9px] text-namo-charcoal/70 hover:bg-secondary hover:text-namo-charcoal'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="border-t border-border/60 px-4 py-3">
        <p className="text-center text-[11px] text-namo-muted">
          Namo APS
        </p>
      </div>
    </aside>
  )
}
