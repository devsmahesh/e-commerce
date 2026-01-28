'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppSelector } from '@/store/hooks'
import { formatPrice } from '@/lib/utils'
import { useGetAddressesQuery, useCreateOrderMutation } from '@/store/api/ordersApi'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/constants'
import { Loader2 } from 'lucide-react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutForm } from '@/components/checkout/checkout-form'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const items = useAppSelector((state) => state.cart.items)
  const { data: addresses } = useGetAddressesQuery()
  const [createOrder, { isLoading }] = useCreateOrderMutation()
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + tax + shipping

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
              <p className="mb-6 text-muted-foreground">
                Add items to your cart before checkout
              </p>
              <Button onClick={() => router.push(ROUTES.PRODUCTS)}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-4xl font-bold">Checkout</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses && addresses.length > 0 ? (
                    <div className="space-y-2">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex cursor-pointer items-start space-x-3 rounded-lg border-2 p-4 transition-colors ${
                            selectedAddress === address.id
                              ? 'border-accent bg-accent/5'
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddress === address.id}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.address1}
                              {address.address2 && `, ${address.address2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="text-sm text-muted-foreground">{address.country}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No saved addresses. Please add an address to continue.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payment */}
              {selectedAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                      <Elements stripe={stripePromise}>
                        <CheckoutForm
                          addressId={selectedAddress}
                          total={total}
                          onSuccess={() => {
                            toast({
                              title: 'Order placed!',
                              description: 'Your order has been placed successfully.',
                            })
                            router.push(`${ROUTES.ORDERS}?success=true`)
                          }}
                        />
                      </Elements>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                        </p>
                        <Button
                          onClick={async () => {
                            try {
                              await createOrder({
                                shippingAddressId: selectedAddress,
                                billingAddressId: selectedAddress,
                                paymentMethod: 'cash',
                              }).unwrap()
                              toast({
                                title: 'Order placed!',
                                description: 'Your order has been placed successfully.',
                              })
                              router.push(`${ROUTES.ORDERS}?success=true`)
                            } catch (error: any) {
                              toast({
                                title: 'Error',
                                description: error?.data?.message || 'Failed to place order',
                                variant: 'destructive',
                              })
                            }
                          }}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Place Order
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 border-t border-border pt-4 text-sm">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

