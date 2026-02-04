'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { useGetOrdersQuery, useCancelOrderMutation } from '@/store/api/ordersApi'
import { formatPrice, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Package, X, Calendar, ShoppingBag, CheckCircle2, Clock, Truck, Ban, XCircle, RefreshCw, Copy, Check, Info } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export default function OrdersPage() {
  const { data, isLoading } = useGetOrdersQuery({ page: 1 })
  const [cancelOrder] = useCancelOrderMutation()
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder(orderId).unwrap()
      toast({
        title: 'Order cancelled',
        description: 'Your order has been cancelled successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to cancel order',
        variant: 'destructive',
      })
    }
  }

  const handleCopyTracking = async (trackingNumber: string, orderId: string) => {
    try {
      await navigator.clipboard.writeText(trackingNumber)
      setCopiedTrackingId(orderId)
      toast({
        title: 'Copied!',
        description: 'Tracking number copied to clipboard',
      })
      setTimeout(() => setCopiedTrackingId(null), 2000)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy tracking number',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 dark:border-green-500/30'
      case 'shipped':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30'
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 dark:border-yellow-500/30'
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 dark:border-red-500/30'
      default:
        return 'bg-muted text-muted-foreground border border-border'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-3.5 w-3.5" />
      case 'shipped':
        return <Truck className="h-3.5 w-3.5" />
      case 'processing':
        return <Clock className="h-3.5 w-3.5" />
      case 'cancelled':
        return <Ban className="h-3.5 w-3.5" />
      default:
        return <Clock className="h-3.5 w-3.5" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || ''
    switch (normalizedStatus) {
      case 'paid':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 dark:border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 dark:border-yellow-500/30'
      case 'failed':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 dark:border-red-500/30'
      case 'refunded':
        return 'bg-muted text-muted-foreground border border-border'
      default:
        return 'bg-muted text-muted-foreground border border-border'
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || ''
    switch (normalizedStatus) {
      case 'paid':
        return <CheckCircle2 className="h-3.5 w-3.5" />
      case 'pending':
        return <Clock className="h-3.5 w-3.5" />
      case 'failed':
        return <XCircle className="h-3.5 w-3.5" />
      case 'refunded':
        return <RefreshCw className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">My Orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              View and manage all your orders
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={`skeleton-${i}`} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((order) => {
                // Prioritize ID fields - only use orderNumber if no ID exists
                // Note: orderNumber is human-readable (e.g., "ORD-123456"), not an ObjectId
                const orderId = (order as any).id || (order as any)._id
                // If no ID, we can't create a proper detail link - skip the link
                if (!orderId) {
                  console.warn('Order missing ID:', order)
                }
                return (
                <Card key={orderId} className="overflow-hidden border-2 transition-all hover:border-accent hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                      {/* Header Section */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-foreground">
                                Order #{order.orderNumber}
                              </h3>
                              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(order.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span key={`status-${orderId}`} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                              {order.paymentStatus && (
                                <span key={`payment-${orderId}`} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                                  {getPaymentStatusIcon(order.paymentStatus)}
                                  <span>{order.paymentStatus}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ShoppingBag className="h-4 w-4" />
                            <span>
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold text-foreground">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>
                        {order.trackingNumber && (
                          <>
                            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Tracking:</span>
                              <span className="text-sm font-medium text-foreground">{order.trackingNumber}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 ml-auto"
                                onClick={() => handleCopyTracking(order.trackingNumber!, orderId)}
                                title="Copy tracking number"
                              >
                                {copiedTrackingId === orderId ? (
                                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                            <div className="mt-2 flex items-center gap-2 rounded-md bg-blue-500/10 p-2">
                              <Info className="h-4 w-4 text-blue-700 dark:text-blue-400 flex-shrink-0" />
                              <span className="text-xs text-blue-900 dark:text-blue-100">
                                Copy the Tracking ID and track the shipment in the Delhivery App.
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                        {order.status === 'pending' && orderId && (
                          <Button
                            variant="destructive"
                            onClick={() => handleCancel(orderId)}
                            className="w-full sm:w-auto"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel Order
                          </Button>
                        )}
                        {orderId ? (
                          <Link 
                            href={`/orders/${orderId}`}
                            className={buttonVariants({ variant: 'outline', className: 'w-full sm:w-auto' })}
                          >
                            View Details
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">Order ID missing</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-6 rounded-full bg-muted p-6">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-foreground">No orders yet</h2>
                <p className="mb-6 max-w-md text-center text-muted-foreground">
                  Start shopping to see your orders here. Browse our collection of premium ghee products.
                </p>
                <Link 
                  href={ROUTES.PRODUCTS}
                  className={buttonVariants({ size: 'lg', className: 'gap-2 inline-flex' })}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Start Shopping
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

