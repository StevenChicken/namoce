import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { UserMenu } from '@/components/layout/user-menu'
import Image from 'next/image'
import Link from 'next/link'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/accedi')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name, email, role, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status === 'pending') {
    redirect('/in-attesa')
  }

  const isAdmin = profile.role === 'super_admin'

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar isAdmin={isAdmin} />

      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/calendario">
              <Image
                src="/logo.png"
                alt="Namo APS"
                width={80}
                height={32}
                className="h-auto w-auto"
              />
            </Link>
          </div>
          <div className="hidden md:block" />
          <UserMenu
            firstName={profile.first_name}
            lastName={profile.last_name}
            email={profile.email}
          />
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 pb-24 md:px-6 md:pb-6">
          {children}
        </main>
      </div>

      <MobileNav isAdmin={isAdmin} />
    </div>
  )
}
