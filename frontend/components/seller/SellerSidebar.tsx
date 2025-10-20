'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Megaphone, 
  Users, 
  Settings, 
  HelpCircle,
  TrendingUp,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const navigation = [
  {
    name: 'Dashboard',
    href: '/seller',
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: 'Analytics',
    href: '/seller/analytics',
    icon: BarChart3,
    badge: 'New'
  },
  {
    name: 'Products',
    href: '/seller/products',
    icon: Package,
    children: [
      { name: 'All Products', href: '/seller/products' },
      { name: 'Create Product', href: '/seller/products/create' },
      { name: 'Inventory', href: '/seller/products/inventory' }
    ]
  },
  {
    name: 'Orders',
    href: '/seller/orders',
    icon: ShoppingCart,
    badge: '3' // Pending orders count
  },
  {
    name: 'Payments',
    href: '/seller/payments',
    icon: CreditCard
  },
  {
    name: 'Promotions',
    href: '/seller/promotions',
    icon: Megaphone
  },
  {
    name: 'Customers',
    href: '/seller/customers',
    icon: Users
  },
  {
    name: 'Settings',
    href: '/seller/settings',
    icon: Settings
  }
]

interface NavigationItemProps {
  item: typeof navigation[0]
  collapsed: boolean
}

function NavigationItem({ item, collapsed }: NavigationItemProps) {
  const pathname = usePathname()
  const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href))
  
  return (
    <div className="space-y-1">
      <Link
        href={item.href as any}
        className={cn(
          'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
          isActive
            ? 'bg-orange-100 text-orange-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <item.icon className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3')} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
      
      {/* Sub-navigation items */}
      {!collapsed && item.children && (
        <div className="ml-6 space-y-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href as any}
              className={cn(
                'flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                pathname === child.href
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              )}
            >
              <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

interface SellerSidebarProps {
  open: boolean
  collapsed: boolean
  onToggle: () => void
  onClose: () => void
}

export function SellerSidebar({ open, collapsed, onToggle, onClose }: SellerSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300",
        open ? (collapsed ? "w-16" : "w-64") : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AE</span>
              </div>
              <span className="font-semibold text-gray-900">Seller Portal</span>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavigationItem key={item.name} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link 
            href="/seller/help"
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            {!collapsed && <span>Help & Support</span>}
          </Link>
        </div>
      </div>
    </>
  )
}
