'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGetProfileQuery } from '@/store/api/usersApi'
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Image as ImageIcon, FolderTree, LogOut, Menu, X, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { useLogoutMutation } from '@/store/api/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { tokenManager } from '@/lib/token'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Only fetch profile on client-side to avoid hydration mismatch
  const { data: user, isLoading } = useGetProfileQuery(undefined, {
    skip: !mounted || !tokenManager.getAccessToken(),
  })
  const [logoutMutation] = useLogoutMutation()
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && (!user || user.role !== 'admin')) {
      router.push(ROUTES.HOME)
    }
  }, [user, isLoading, router, mounted])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on window resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    { href: ROUTES.ADMIN.CATEGORIES, label: 'Categories', icon: FolderTree },
    { href: ROUTES.ADMIN.ORDERS, label: 'Orders', icon: ShoppingBag },
    { href: ROUTES.ADMIN.USERS, label: 'Users', icon: Users },
    { href: ROUTES.ADMIN.COUPONS, label: 'Coupons', icon: Tag },
    { href: ROUTES.ADMIN.BANNERS, label: 'Banners', icon: ImageIcon },
    { href: ROUTES.ADMIN.CONTACTS, label: 'Contacts', icon: MessageSquare },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          bg-slate-900 text-white border-r border-slate-800
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-16 md:w-16'}
        `}
      >
        <div className="sticky top-0 flex h-screen flex-col">
          {/* Header with toggle button */}
          <div className={`p-6 ${sidebarOpen ? '' : 'px-3'}`}>
            <div className="flex items-center justify-between mb-8">
              {sidebarOpen && (
                <h2 className="text-xl font-bold text-white whitespace-nowrap">Ghee Store Admin</h2>
              )}
              <div className="flex items-center gap-2">
                {/* Desktop collapse button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex h-8 w-8 text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => dispatch(toggleSidebar())}
                >
                  {sidebarOpen ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                {/* Mobile close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8 text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className="block"
                    onClick={() => setMobileMenuOpen(false)}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <div
                      className={`
                        flex items-center rounded-lg px-4 py-3 transition-all duration-200
                        ${sidebarOpen ? 'space-x-3' : 'justify-center'}
                        ${
                          isActive
                            ? 'bg-amber-500 text-slate-900 font-medium'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className={`mt-auto border-t border-slate-800 ${sidebarOpen ? 'p-6' : 'p-3'}`}>
            <Button 
              variant="ghost" 
              className={`w-full text-slate-300 hover:bg-slate-800 hover:text-white ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
              onClick={handleLogout}
              title={!sidebarOpen ? 'Logout' : undefined}
            >
              <LogOut className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? 'mr-2' : ''}`} />
              {sidebarOpen && <span className="whitespace-nowrap">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {/* Mobile menu button */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 md:hidden">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold text-slate-900">Ghee Store Admin</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Desktop header with collapse button */}
        <div className="hidden md:block sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleSidebar())}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">{children}</div>
      </main>
    </div>
  )
}

