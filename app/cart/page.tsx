'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { removeItem, updateQuantity } from '@/store/slices/cartSlice'
import { formatPrice } from '@/lib/utils'
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { LoginModal } from '@/components/auth/login-modal'
import { tokenManager } from '@/lib/token'

export default function CartPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
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

  const handleProceedToCheckout = () => {
    const hasAuth = mounted && (isAuthenticated || tokenManager.getAccessToken())
    
    if (!hasAuth) {
      setShowLoginModal(true)
    } else {
      router.push(ROUTES.CHECKOUT)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-4xl font-bold">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-semibold">Your cart is empty</h2>
              <p className="mb-6 text-muted-foreground">
                Start adding items to your cart to continue shopping
              </p>
              <Link href={ROUTES.PRODUCTS}>
                <Button size="lg">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.product.images[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                href={`/product/${item.product.slug}`}
                                className="text-lg font-semibold hover:text-accent"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(item.price)} each
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleRemove(item.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={item.product.stock}
                                value={item.quantity}
                                onChange={(e) =>
                                  dispatch(
                                    updateQuantity({
                                      id: item.id,
                                      quantity: Math.max(
                                        1,
                                        Math.min(item.product.stock, parseInt(e.target.value) || 1)
                                      ),
                                    })
                                  )
                                }
                                className="w-20 text-center"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-lg font-semibold">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      <div className="border-t border-border pt-2">
                        <div className="flex justify-between text-base font-semibold">
                          <span>Total</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleProceedToCheckout}
                      >
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Link href={ROUTES.PRODUCTS}>
                        <Button variant="outline" className="w-full">
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
      />
    </>
  )
}

