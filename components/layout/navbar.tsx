'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Search, User, Menu, X, Moon, Sun, LogOut, UserCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { toggleCart, openCart } from '@/store/slices/cartSlice'
import { toggleMobileMenu } from '@/store/slices/uiSlice'
import { useLogoutMutation } from '@/store/api/authApi'
import { useGetProfileQuery } from '@/store/api/usersApi'
import { tokenManager } from '@/lib/token'
import { ROUTES } from '@/lib/constants'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Get user from Redux auth state as primary source
  const authUser = useAppSelector((state) => state.auth.user)
  
  // Only fetch profile on client-side to avoid hydration mismatch (as fallback)
  const { data: profileUser } = useGetProfileQuery(undefined, {
    skip: !mounted || !tokenManager.getAccessToken() || !!authUser,
  })
  
  // Use auth user from Redux if available, otherwise use profile query result
  const user = authUser || profileUser
  
  const [logout] = useLogoutMutation()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  const cartItemsCount = useAppSelector((state) => state.cart.items.length)
  const mobileMenuOpen = useAppSelector((state) => state.ui.mobileMenuOpen)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken()
      if (refreshToken) {
        await logout({ refreshToken }).unwrap()
      }
      tokenManager.clearTokens()
      window.location.href = ROUTES.HOME
    } catch (error) {
      console.error('Logout failed:', error)
      // Clear tokens anyway on error
      tokenManager.clearTokens()
      window.location.href = ROUTES.HOME
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const navLinks = [
    { href: ROUTES.HOME, label: 'Home' },
    { href: ROUTES.PRODUCTS, label: 'Products' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center">
            <img 
              src="/assests/runiche-logo.png" 
              alt="Runiche Logo" 
              className="h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  pathname === link.href ? 'text-accent' : 'text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex lg:flex-1 lg:max-w-md lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search ghee products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {!mounted ? (
                <Moon className="h-5 w-5" />
              ) : theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(openCart())}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex md:items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-accent">
                      <User className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="end">
                    <div className="space-y-1">
                      <Link
                        href={user.role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.PROFILE}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                      >
                        <UserCircle className="h-4 w-4" />
                        My Profile
                      </Link>
                      <Link
                        href={ROUTES.ORDERS}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-2">
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => dispatch(toggleMobileMenu())}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => dispatch(toggleMobileMenu())}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href={user.role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.PROFILE}
                    className="block px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted"
                    onClick={() => dispatch(toggleMobileMenu())}
                  >
                    Profile
                  </Link>
                  <Link
                    href={ROUTES.ORDERS}
                    className="block px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted"
                    onClick={() => dispatch(toggleMobileMenu())}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      dispatch(toggleMobileMenu())
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.LOGIN}
                    className="block px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted"
                    onClick={() => dispatch(toggleMobileMenu())}
                  >
                    Login
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    className="block px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted"
                    onClick={() => dispatch(toggleMobileMenu())}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

