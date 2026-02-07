'use client'

import { useState, useMemo } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { useGetOrdersQuery, useCancelOrderMutation } from '@/store/api/ordersApi'
import { formatPrice, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Package, X, Calendar, ShoppingBag, CheckCircle2, Clock, Truck, Copy, Check, Info, Filter, X as XIcon } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function OrdersPage() {
  const { data, isLoading } = useGetOrdersQuery({ page: 1 })
  const [cancelOrder] = useCancelOrderMutation()
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

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

  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    if (!data?.data) return []
    
    let filtered = [...data.data]
    
    // Filter by order status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }
    
    // Filter by payment status (case-insensitive)
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.paymentStatus?.toLowerCase() === paymentStatusFilter.toLowerCase()
      )
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      const last90Days = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        switch (dateFilter) {
          case 'today':
            return orderDate >= today
          case 'last7days':
            return orderDate >= last7Days
          case 'last30days':
            return orderDate >= last30Days
          case 'last90days':
            return orderDate >= last90Days
          default:
            return true
        }
      })
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [data?.data, statusFilter, paymentStatusFilter, dateFilter])

  const hasActiveFilters = statusFilter !== 'all' || paymentStatusFilter !== 'all' || dateFilter !== 'all'
  
  const resetFilters = () => {
    setStatusFilter('all')
    setPaymentStatusFilter('all')
    setDateFilter('all')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1e293b] mb-2">My Orders</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all your orders
            </p>
          </div>

          {/* Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {hasActiveFilters && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="gap-2 text-muted-foreground"
                >
                  <XIcon className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {showFilters && (
              <Card className="mt-4 border-2">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Order Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Order Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Payment Status</label>
                      <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Payment Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payment Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Date Range</label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="last7days">Last 7 Days</SelectItem>
                          <SelectItem value="last30days">Last 30 Days</SelectItem>
                          <SelectItem value="last90days">Last 90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={`skeleton-${i}`} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order, index) => {
                // Prioritize ID fields - only use orderNumber if no ID exists
                // Note: orderNumber is human-readable (e.g., "ORD-123456"), not an ObjectId
                const orderId = (order as any).id || (order as any)._id
                // If no ID, we can't create a proper detail link - skip the link
                if (!orderId) {
                  console.warn('Order missing ID:', order)
                }
                
                // Highlight first order (most recent)
                const isFirstOrder = index === 0
                
                return (
                <Card 
                  key={orderId} 
                  className={`overflow-hidden border-2 transition-all hover:shadow-lg ${
                    isFirstOrder 
                      ? 'border-orange-500 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                      {/* Header Section */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 space-y-3">
                            <h3 className="text-xl font-bold text-[#1e293b]">
                              Order #{order.orderNumber}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ShoppingBag className="h-4 w-4" />
                              <span>
                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Status Badges */}
                          <div className="flex flex-col items-end gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                              order.status === 'pending' 
                                ? 'text-gray-600 bg-gray-50' 
                                : 'text-gray-600 bg-gray-50'
                            }`}>
                              <Clock className="h-3.5 w-3.5" />
                              {order.status === 'pending' ? 'Pending' : 
                               order.status === 'processing' ? 'Processing' :
                               order.status === 'shipped' ? 'Shipped' :
                               order.status === 'delivered' ? 'Delivered' :
                               order.status === 'cancelled' ? 'Cancelled' : order.status}
                            </span>
                            {order.paymentStatus && (
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase ${
                                order.paymentStatus.toLowerCase() === 'paid'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {order.paymentStatus.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Images Section */}
                        {order.items.length > 0 && (
                          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Products:</span>
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex -space-x-2">
                                {order.items.slice(0, 4).map((item, idx) => {
                                  const product = item.product
                                  const productImages = product?.images || []
                                  const firstImage = productImages[0]
                                  const productName = product?.name || 'Product'
                                  
                                  return (
                                    <div
                                      key={item.id || idx}
                                      className="relative h-14 w-14 rounded-lg border-2 border-white overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm hover:z-10 transition-transform hover:scale-110"
                                      title={productName}
                                    >
                                      {firstImage ? (
                                        <Image
                                          src={firstImage}
                                          alt={productName}
                                          fill
                                          className="object-cover"
                                          unoptimized
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center h-full">
                                          <Package className="h-5 w-5 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                              {order.items.length > 4 && (
                                <div className="flex items-center justify-center h-14 w-14 rounded-lg border-2 border-white bg-gray-100 text-xs font-semibold text-gray-600 shadow-sm">
                                  +{order.items.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Total Amount and Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-[#1e40af]">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          {/* Show cancel button for pending/processing orders or when payment is paid (before shipping) */}
                          {((order.status === 'pending' || order.status === 'processing') || 
                            (order.paymentStatus?.toLowerCase() === 'paid' && 
                             order.status !== 'shipped' && 
                             order.status !== 'delivered' && 
                             order.status !== 'cancelled')) && orderId && (
                            <Button
                              variant="destructive"
                              onClick={() => handleCancel(orderId)}
                              className="gap-2"
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                              Cancel Order
                            </Button>
                          )}
                          {orderId ? (
                            <Link 
                              href={`/orders/${orderId}`}
                              className={buttonVariants({ 
                                variant: 'outline', 
                                className: 'gap-2 bg-gray-50 hover:bg-gray-100 border-gray-200' 
                              })}
                            >
                              View Details
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">Order ID missing</span>
                          )}
                        </div>
                      </div>

                      {/* Refund Info for Refunded Orders */}
                      {order.paymentStatus?.toLowerCase() === 'refunded' && (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-900 mb-1">
                                Refund Information
                              </p>
                              <p className="text-xs text-amber-800">
                                Your refund will be processed within 3-5 business days. The amount will be credited back to your original payment method.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tracking Info */}
                      {order.trackingNumber && (
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="h-4 w-4 text-blue-700" />
                            <span className="text-sm font-medium text-blue-900">Tracking Number:</span>
                            <span className="text-sm font-semibold text-blue-900">{order.trackingNumber}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 ml-auto"
                              onClick={() => handleCopyTracking(order.trackingNumber!, orderId)}
                              title="Copy tracking number"
                            >
                              {copiedTrackingId === orderId ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-blue-700" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-700 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-blue-800">
                              Copy the Tracking ID and track the shipment in the Delhivery App.
                            </span>
                          </div>
                        </div>
                      )}
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
                <h2 className="mb-2 text-2xl font-semibold text-foreground">
                  {hasActiveFilters ? 'No orders match your filters' : 'No orders yet'}
                </h2>
                <p className="mb-6 max-w-md text-center text-muted-foreground">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more orders.'
                    : 'Start shopping to see your orders here. Browse our collection of premium ghee products.'}
                </p>
                {hasActiveFilters ? (
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <XIcon className="h-4 w-4" />
                    Clear Filters
                  </Button>
                ) : (
                  <Link 
                    href={ROUTES.PRODUCTS}
                    className={buttonVariants({ size: 'lg', className: 'gap-2 inline-flex' })}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Start Shopping
                  </Link>
                )}
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

