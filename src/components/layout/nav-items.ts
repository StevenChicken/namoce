import {
  Calendar,
  CalendarHeart,
  LayoutDashboard,
  User,
  Users,
  FileText,
  Download,
  CreditCard,
  Settings,
  Heart,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: typeof Calendar
  adminOnly?: boolean
  superAdminOnly?: boolean
  requiresVolunteerOrAdmin?: boolean
}

export const mainNavItems: NavItem[] = [
  { label: 'CALENDARIO EVENTI', href: '/calendario_eventi', icon: Calendar },
  { label: 'CALENDARIO VOLONTARIO', href: '/calendario_del_volontario', icon: CalendarHeart, requiresVolunteerOrAdmin: true },
  { label: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
  { label: 'PROFILO', href: '/profilo', icon: User },
]

export const adminNavItems: NavItem[] = [
  { label: 'EVENTI', href: '/admin/eventi', icon: Calendar, adminOnly: true },
  { label: 'UTENTI', href: '/admin/utenti', icon: Users, superAdminOnly: true },
  { label: 'PAGAMENTI', href: '/admin/pagamenti', icon: CreditCard, superAdminOnly: true },
  { label: 'DONAZIONI', href: '/admin/donazioni', icon: Heart, adminOnly: true },
  { label: 'AUDIT', href: '/admin/audit', icon: FileText, adminOnly: true },
  { label: 'EXPORT', href: '/admin/export', icon: Download, adminOnly: true },
  { label: 'IMPOSTAZIONI', href: '/admin/impostazioni', icon: Settings, superAdminOnly: true },
]
