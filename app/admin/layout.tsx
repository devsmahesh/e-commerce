'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGetProfileQuery } from '@/store/api/usersApi'
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Image as ImageIcon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { useLogoutMutation } from '@/store/api/authApi'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { tokenManager } from '@/lib/token'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  // Only fetch profile on client-side to avoid hydration mismatch
  const { data: user, isLoading } = useGetProfileQuery(undefined, {
    skip: !mounted || !tokenManager.getAccessToken(),
  })
  const [logoutMutation] = useLogoutMutation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && (!user || user.role !== 'admin')) {
      router.push(ROUTES.HOME)
    }
  }, [user, isLoading, router, mounted])

  const handleLogout = async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken()
      if (refreshToken) {
        await logoutMutation({ refreshToken }).unwrap()
      }
      tokenManager.clearTokens()
      dispatch(logout())
      router.push(ROUTES.HOME)
    } catch (error) {
      console.error('Logout failed:', error)
      tokenManager.clearTokens()
      dispatch(logout())
      router.push(ROUTES.HOME)
    }
  }

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: ROUTES.ADMIN.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { href: ROUTES.ADMIN.PRODUCTS, label: 'Products', icon: Package },
    { href: ROUTES.ADMIN.ORDERS, label: 'Orders', icon: ShoppingBag },
    { href: ROUTES.ADMIN.USERS, label: 'Users', icon: Users },
    { href: ROUTES.ADMIN.COUPONS, label: 'Coupons', icon: Tag },
    { href: ROUTES.ADMIN.BANNERS, label: 'Banners', icon: ImageIcon },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white border-r border-slate-800">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="p-6">
            <h2 className="mb-8 text-xl font-bold text-white">Admin Panel</h2>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className="block"
                  >
                    <div
                      className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                        isActive
                          ? 'bg-amber-500 text-slate-900 font-medium'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="mt-auto border-t border-slate-800 p-6">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}

