import {
  Calendar,
  LayoutDashboard,
  User,
  Users,
  FileText,
  Download,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: typeof Calendar
  adminOnly?: boolean
}

export const mainNavItems: NavItem[] = [
  { label: 'CALENDARIO', href: '/calendario', icon: Calendar },
  { label: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
  { label: 'PROFILO', href: '/profilo', icon: User },
]

export const adminNavItems: NavItem[] = [
  { label: 'UTENTI', href: '/admin/utenti', icon: Users, adminOnly: true },
  { label: 'EVENTI', href: '/admin/eventi', icon: Calendar, adminOnly: true },
  { label: 'AUDIT', href: '/admin/audit', icon: FileText, adminOnly: true },
  { label: 'EXPORT', href: '/admin/export', icon: Download, adminOnly: true },
]
