'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels: { [key: string]: string } = {
  '/seller': 'Dashboard',
  '/seller/analytics': 'Analytics',
  '/seller/products': 'Products',
  '/seller/products/create': 'Create Product',
  '/seller/products/inventory': 'Inventory',
  '/seller/orders': 'Orders',
  '/seller/payments': 'Payments',
  '/seller/promotions': 'Promotions',
  '/seller/customers': 'Customers',
  '/seller/settings': 'Settings',
  '/seller/profile': 'Profile',
  '/seller/help': 'Help & Support'
}

export function SellerBreadcrumbs() {
  const pathname = usePathname()
  
  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/')
    const label = routeLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1)
    
    return {
      path,
      label,
      isLast: index === pathSegments.length - 1
    }
  })

  // Don't show breadcrumbs on the main dashboard
  if (pathname === '/seller') {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center space-x-2 text-sm">
        <Link 
          href="/seller" 
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.path} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {breadcrumb.isLast ? (
              <span className="text-gray-900 font-medium">
                {breadcrumb.label}
              </span>
            ) : (
              <Link 
                href={breadcrumb.path as any}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {breadcrumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
