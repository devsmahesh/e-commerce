'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { closeCart, removeItem, updateQuantity } from '@/store/slices/cartSlice'
import { formatPrice } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ROUTES } from '@/lib/constants'
import { LoginModal } from '@/components/auth/login-modal'
import { tokenManager } from '@/lib/token'

export function CartDrawer() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const isOpen = useAppSelector((state) => state.cart.isOpen)
  const items = useAppSelector((state) => state.cart.items)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  const handleQuantityChange = (id: string, delta: number) => {
    const item = items.find((item) => item.id === id)
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta)
      dispatch(updateQuantity({ id, quantity: newQuantity }))
    }
  }

  const handleRemove = (id: string) => {
    dispatch(removeItem(id))
  }

  const handleProceedToCheckout = (e: React.MouseEvent) => {
    e.preventDefault()
    const hasAuth = mounted && (isAuthenticated || tokenManager.getAccessToken())
    
    if (!hasAuth) {
      setShowLoginModal(true)
    } else {
      dispatch(closeCart())
      router.push(ROUTES.CHECKOUT)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => dispatch(closeCart())}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(closeCart())}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
                    <p className="mb-2 text-lg font-semibold">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground">
                      Start adding items to your cart
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-lg border border-border p-4"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.product.images[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemove(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleProceedToCheckout}
                    >
                      Proceed to Checkout
                    </Button>
                    <Link href={ROUTES.CART} onClick={() => dispatch(closeCart())}>
                      <Button variant="outline" className="w-full">
                        View Cart
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
        onCancel={() => dispatch(closeCart())}
      />
    </AnimatePresence>
  )
}

