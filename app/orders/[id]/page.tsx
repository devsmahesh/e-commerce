'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { useGetOrderQuery, useGetOrderByOrderNumberQuery, useCancelOrderMutation } from '@/store/api/ordersApi'
import { formatPrice, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Ban,
  X,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import Image from 'next/image'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderIdOrNumber = params?.id as string
  const [copiedTracking, setCopiedTracking] = useState(false)
  
  // Check if it looks like an order number (starts with "ORD-") or an ID (MongoDB ObjectId or UUID)
  const isOrderNumber = orderIdOrNumber?.startsWith('ORD-')
  
  // Fetch by ID (for MongoDB ObjectId or UUID)
  const { data: orderById, isLoading: isLoadingById } = useGetOrderQuery(orderIdOrNumber, { 
    skip: !orderIdOrNumber || isOrderNumber
  })
  
  // Fetch by order number (only if it's a human-readable order number)
  const { data: orderByNumber, isLoading: isLoadingByNumber } = useGetOrderByOrderNumberQuery(orderIdOrNumber, {
    skip: !orderIdOrNumber || !isOrderNumber || !!orderById
  })
  
  const order = orderById || orderByNumber
  const isLoading = isLoadingById || isLoadingByNumber
  const [cancelOrder] = useCancelOrderMutation()
  const { toast } = useToast()

  const handleCancel = async () => {
    if (!order) return
    // Handle both 'id' and '_id' (MongoDB) fields, fallback to orderNumber
    const orderId = (order as any).id || (order as any)._id || order.orderNumber
    if (!orderId) return
    try {
      await cancelOrder(orderId).unwrap()
      toast({
        title: 'Order cancelled',
        description: 'Your order has been cancelled successfully.',
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to cancel order',
        variant: 'destructive',
      })
    }
  }

  const handleCopyTracking = async () => {
    if (!order?.trackingNumber) return
    try {
      await navigator.clipboard.writeText(order.trackingNumber)
      setCopiedTracking(true)
      toast({
        title: 'Copied!',
        description: 'Tracking number copied to clipboard',
      })
      setTimeout(() => setCopiedTracking(false), 2000)
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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
          <div className="container mx-auto px-4">
            <Skeleton className="h-12 w-64 mb-8" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-2xl font-semibold">Order not found</h2>
                <p className="mb-6 text-muted-foreground">
                  The order you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Link href={ROUTES.ORDERS} className={buttonVariants({ variant: 'outline' })}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Link>
              </CardContent>
            </Card>
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
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={ROUTES.ORDERS}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Order #{order.orderNumber}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
                {order.paymentStatus && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {getPaymentStatusIcon(order.paymentStatus)}
                    <span>{order.paymentStatus}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => {
                      const product = item.product
                      const productName = product?.name || 'Product'
                      const productImages = product?.images || []
                      const firstImage = productImages[0]
                      
                      return (
                      <div key={item.id || item.product?.id || Math.random()} className="flex gap-4 pb-4 border-b border-border last:border-0">
                        <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          {firstImage ? (
                            <Image
                              src={firstImage}
                              alt={productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{productName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{order.shippingAddress.street}</p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          -{formatPrice(order.discount)}
                        </span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="font-medium">{formatPrice(order.tax)}</span>
                      </div>
                    )}
                    {order.shipping > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">{formatPrice(order.shipping)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Placed: {formatDate(order.createdAt)}</span>
                  </div>
                  {order.trackingNumber && (
                    <>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Tracking:</span>
                        <span className="font-medium text-foreground">{order.trackingNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={handleCopyTracking}
                          title="Copy tracking number"
                        >
                          {copiedTracking ? (
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
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
                  {order.paymentMethod && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>Payment: {order.paymentMethod}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              {order.status === 'pending' && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

