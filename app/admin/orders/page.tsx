'use client'

import { useState, useMemo } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/store/api/ordersApi'
import { useRefundOrderMutation } from '@/store/api/paymentsApi'
import { Order } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Package, Edit, Copy, Check, Truck, Eye, User, MapPin, CreditCard, Calendar, ShoppingBag, Info, RefreshCw, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

const trackingSchema = Yup.object().shape({
  trackingNumber: Yup.string()
    .trim()
    .min(1, 'Tracking number is required')
    .required('Tracking number is required'),
})

const refundSchema = Yup.object().shape({
  amount: Yup.number()
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least ₹1'),
  reason: Yup.string().trim(),
})

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null)
  
  // Reset page to 1 when status changes
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    setPage(1)
  }
  
  // Build query parameters conditionally to avoid undefined values
  // Memoize to ensure RTK Query properly detects parameter changes
  const queryParams = useMemo(() => {
    // If filtering by COD, fetch all orders and filter on frontend
    if (status === 'cod') {
      return { page, limit: 100 } // Fetch more to account for filtering
    }
    return status === 'all' 
      ? { page, limit: 10 }
      : { page, limit: 10, status }
  }, [status, page])
  
  const { data: allOrdersData, isLoading } = useGetAllOrdersQuery(queryParams)
  
  // Filter COD orders on frontend if COD filter is selected
  const data = useMemo(() => {
    if (status === 'cod' && allOrdersData) {
      const codOrders = allOrdersData.data.filter((order) => order.paymentMethod === 'cod')
      // Calculate pagination for filtered results
      const startIndex = (page - 1) * 10
      const endIndex = startIndex + 10
      const paginatedCodOrders = codOrders.slice(startIndex, endIndex)
      
      return {
        data: paginatedCodOrders,
        meta: {
          page,
          limit: 10,
          total: codOrders.length,
          totalPages: Math.ceil(codOrders.length / 10),
        },
      }
    }
    return allOrdersData
  }, [status, allOrdersData, page])
  const [updateStatus] = useUpdateOrderStatusMutation()
  const [refundOrder] = useRefundOrderMutation()
  const { toast } = useToast()
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [refundOrderData, setRefundOrderData] = useState<Order | null>(null)

  const handleOrderStatusChange = async (order: Order, newStatus: string) => {
    // Handle both 'id' and '_id' (MongoDB) fields
    const orderId = (order as any).id || (order as any)._id
    if (!orderId) {
      toast({
        title: 'Error',
        description: 'Order ID not found',
        variant: 'destructive',
      })
      return
    }
    try {
      await updateStatus({ id: orderId, data: { status: newStatus as any } }).unwrap()
      toast({
        title: 'Order updated',
        description: 'Order status has been updated successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update order',
        variant: 'destructive',
      })
    }
  }

  const handleOpenTrackingDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  const handleOpenDetailDialog = (order: Order) => {
    setDetailOrder(order)
    setIsDetailDialogOpen(true)
  }

  const handleSaveTracking = async (values: { trackingNumber: string }) => {
    if (!selectedOrder) return
    
    const orderId = (selectedOrder as any).id || (selectedOrder as any)._id
    if (!orderId) {
      toast({
        title: 'Error',
        description: 'Order ID not found',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateStatus({ 
        id: orderId, 
        data: { 
          status: selectedOrder.status,
          trackingNumber: values.trackingNumber.trim()
        } 
      }).unwrap()
      toast({
        title: 'Tracking updated',
        description: 'Tracking number has been updated successfully.',
      })
      setIsDialogOpen(false)
      setSelectedOrder(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update tracking number',
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

  const handleOpenRefundDialog = (order: Order) => {
    setRefundOrderData(order)
    setIsRefundDialogOpen(true)
  }

  const handleProcessRefund = async (values: { amount?: number; reason?: string }) => {
    if (!refundOrderData) return

    const orderId = (refundOrderData as any).id || (refundOrderData as any)._id
    if (!orderId) {
      toast({
        title: 'Error',
        description: 'Order ID not found',
        variant: 'destructive',
      })
      return
    }

    try {
      await refundOrder({
        orderId,
        data: values.amount ? { amount: values.amount, reason: values.reason } : { reason: values.reason },
      }).unwrap()
      toast({
        title: 'Refund processed',
        description: 'Refund has been processed successfully.',
      })
      setIsRefundDialogOpen(false)
      setRefundOrderData(null)
    } catch (error: any) {
      toast({
        title: 'Refund failed',
        description: error?.data?.message || 'Failed to process refund',
        variant: 'destructive',
      })
    }
  }

  const getRefundStatusBadge = (order: Order) => {
    if (order.paymentStatus === 'refunded') {
      if (order.refundStatus === 'processed') {
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400 border border-green-500/20">
            <Check className="h-3 w-3" />
            Refunded
          </span>
        )
      } else if (order.refundStatus === 'failed') {
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20">
            <XCircle className="h-3 w-3" />
            Refund Failed
          </span>
        )
      } else {
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400 border border-yellow-500/20">
            <RefreshCw className="h-3 w-3" />
            Refund Pending
          </span>
        )
      }
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Orders</h1>
        <p className="mt-2 text-muted-foreground">Manage customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="cod">COD Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((order) => {
                const orderId = (order as any).id || (order as any)._id || order.orderNumber
                return (
                <div
                  key={orderId}
                  className={`rounded-lg border border-border p-4 ${
                    order.status === 'cancelled' 
                      ? 'bg-red-500/10' 
                      : order.status === 'pending' 
                      ? 'bg-gray-500/10'
                      : order.status === 'processing'
                      ? 'bg-yellow-500/10'
                      : order.status === 'delivered'
                      ? 'bg-green-500/10'
                      : order.status === 'shipped'
                      ? 'bg-blue-500/10'
                      : order.status === 'refunded'
                      ? 'bg-orange-500/10'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleOrderStatusChange(order, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">
                                Paid{order.paymentMethod === 'cod' && ' (COD)'}
                              </SelectItem>
                              <SelectItem value="pending">
                                Pending{order.paymentMethod === 'cod' && ' (COD)'}
                              </SelectItem>
                              <SelectItem value="processing">
                                Processing{order.paymentMethod === 'cod' && ' (COD)'}
                              </SelectItem>
                              <SelectItem value="shipped">
                                Shipped{order.paymentMethod === 'cod' && ' (COD)'}
                              </SelectItem>
                              <SelectItem value="delivered">
                                Delivered{order.paymentMethod === 'cod' && ' (COD)'}
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled{order.paymentMethod === 'cod' && ' (COD)'}
                              </SelectItem>
                              <SelectItem value="refunded">
                                Refunded{order.paymentMethod === 'cod' && ' (COD)'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {order.paymentMethod === 'cod' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-500/20">
                              <Package className="h-3 w-3" />
                              COD
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)} • {order.items.length} items
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {(order as any).customer?.firstName || (order.shippingAddress as any).firstName || ''} {(order as any).customer?.lastName || (order.shippingAddress as any).lastName || ''}
                      </p>
                      <div className="mt-2 flex items-center gap-4 flex-wrap">
                        <p className="text-lg font-semibold">
                          Total: {formatPrice(order.total)}
                        </p>
                        {order.paymentMethod === 'cod' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-500/20">
                            <Package className="h-3 w-3" />
                            COD
                          </span>
                        )}
                        {order.paymentStatus === 'paid' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400 border border-green-500/20">
                            <CreditCard className="h-3 w-3" />
                            Paid
                          </span>
                        )}
                        {getRefundStatusBadge(order)}
                        {order.trackingNumber && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Truck className="h-4 w-4" />
                            <span>Tracking: {order.trackingNumber}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
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
                        )}
                      </div>
                      {/* Payment Status Warning Messages */}
                      {order.paymentMethod === 'cod' && (
                        <div className="mt-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
                          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                            💰 Cash on Delivery (COD) Order — Payment will be collected upon delivery. Please verify the order before dispatch.
                          </p>
                        </div>
                      )}
                      {order.paymentMethod !== 'cod' && (() => {
                        const paymentStatus = order.paymentStatus?.toUpperCase()
                        if (paymentStatus === 'PENDING') {
                          return (
                            <div className="mt-3 rounded-md bg-red-500/10 border border-red-500/20 p-3">
                              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                ⚠️ Payment Not Initiated — This order was created but payment hasn&apos;t been started yet. The customer hasn&apos;t been redirected to the payment gateway.
                              </p>
                            </div>
                          )
                        } else if (paymentStatus === 'CREATED') {
                          return (
                            <div className="mt-3 rounded-md bg-red-500/10 border border-red-500/20 p-3">
                              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                ⚠️ Payment Incomplete — The customer was redirected to the payment page but hasn&apos;t completed the payment yet. They may have closed the payment window or cancelled the transaction.
                              </p>
                            </div>
                          )
                        } else if (paymentStatus === 'VERIFICATION_PENDING') {
                          return (
                            <div className="mt-3 rounded-md bg-red-500/10 border border-red-500/20 p-3">
                              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                ⚠️ Payment Verification Pending — The customer claims payment was successful, but we&apos;re still waiting for confirmation from the payment gateway. Please verify manually if needed.
                              </p>
                            </div>
                          )
                        }
                        return null
                      })()}
                      {order.trackingNumber && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Copy the Tracking and track the shipment in the Delhivery App.
                        </div>
                      )}
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetailDialog(order)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenTrackingDialog(order)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {order.trackingNumber ? 'Edit Tracking' : 'Add Tracking'}
                        </Button>
                        {order.paymentStatus === 'paid' && order.refundStatus !== 'processed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRefundDialog(order)}
                            className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
              
              {/* Pagination */}
              {data?.meta && data.meta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total orders)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                    disabled={page === data.meta.totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog 
        open={isDetailDialogOpen} 
        onOpenChange={(open) => {
          setIsDetailDialogOpen(open)
          if (!open) {
            setDetailOrder(null)
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{detailOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-6 py-4">
              {/* Customer Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {(detailOrder as any).customer?.firstName || ''} {(detailOrder as any).customer?.lastName || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{(detailOrder as any).customer?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{(detailOrder as any).customer?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer ID</p>
                      <p className="font-medium text-xs">{(detailOrder as any).customer?.id || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium whitespace-pre-line">
                      {detailOrder.shippingAddress.street}
                    </p>
                    <p className="text-muted-foreground">
                      {detailOrder.shippingAddress.city}, {detailOrder.shippingAddress.state} {detailOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-muted-foreground">{detailOrder.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Items ({detailOrder.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detailOrder.items.map((item) => {
                      const product = item.product
                      const productName = product?.name || 'Product'
                      const productImages = product?.images || []
                      const firstImage = productImages[0]
                      
                      return (
                        <div key={item.id || item.product?.id || Math.random()} className="flex gap-4 pb-4 border-b border-border last:border-0">
                          <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
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
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground">{productName}</h3>
                            {item.variantName && (
                              <p className="text-xs text-muted-foreground mt-1">Variant: {item.variantName}</p>
                            )}
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Quantity: {item.quantity}</span>
                              <span>Price: {formatPrice(item.price)}</span>
                            </div>
                            <p className="mt-2 font-semibold">Total: {formatPrice((item as any).total || (item.price * item.quantity))}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(detailOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">{formatPrice(detailOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">{formatPrice(detailOrder.shipping)}</span>
                    </div>
                    {detailOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span className="font-medium">-{formatPrice(detailOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">{formatPrice(detailOrder.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Tracking Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{(detailOrder as any).paymentMethod || detailOrder.paymentMethod || 'N/A'}</p>
                        {detailOrder.paymentMethod === 'cod' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-500/20">
                            <Package className="h-3 w-3" />
                            COD Order
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{detailOrder.paymentStatus}</p>
                        {getRefundStatusBadge(detailOrder)}
                      </div>
                    </div>
                    {/* COD Status Information */}
                    {detailOrder.paymentMethod === 'cod' && (
                      <div className="pt-2 border-t border-border space-y-2">
                        <p className="text-xs text-muted-foreground font-semibold">COD Status</p>
                        {(detailOrder as any).codVerifiedAt ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm font-medium text-green-700 dark:text-green-400">Verified</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Verified on: {formatDate((detailOrder as any).codVerifiedAt)}
                            </p>
                            {(detailOrder as any).codVerifiedBy && (
                              <p className="text-xs text-muted-foreground">
                                Verified by: {(detailOrder as any).codVerifiedBy?.firstName || 'Admin'} {(detailOrder as any).codVerifiedBy?.lastName || ''}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Not Verified</span>
                          </div>
                        )}
                        {(detailOrder as any).codRefused && (
                          <div className="mt-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              <span className="text-sm font-semibold text-red-700 dark:text-red-400">Delivery Refused</span>
                            </div>
                            {(detailOrder as any).codRefusedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Refused on: {formatDate((detailOrder as any).codRefusedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {detailOrder.paymentStatus === 'paid' && detailOrder.refundStatus !== 'processed' && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRefundDialog(detailOrder)}
                          className="w-full text-orange-600 hover:text-orange-700 dark:text-orange-400"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Process Refund
                        </Button>
                      </div>
                    )}
                    {/* Refund Details */}
                    {detailOrder.refundId && (
                      <div className="pt-2 border-t border-border space-y-1">
                        <p className="text-xs text-muted-foreground font-semibold">Refund Details</p>
                        {detailOrder.refundAmount && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Amount:</span>{' '}
                            <span className="font-medium">{formatPrice(detailOrder.refundAmount)}</span>
                          </p>
                        )}
                        {detailOrder.refundId && (
                          <p className="text-xs text-muted-foreground">
                            Refund ID: {detailOrder.refundId}
                          </p>
                        )}
                        {detailOrder.refundedAt && (
                          <p className="text-xs text-muted-foreground">
                            Refunded: {formatDate(detailOrder.refundedAt)}
                          </p>
                        )}
                        {detailOrder.refundError && (
                          <div className="flex items-start gap-2 mt-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 dark:text-red-400">
                              <span className="font-semibold">Error:</span> {detailOrder.refundError}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Status</p>
                      <p className="font-medium capitalize">{detailOrder.status}</p>
                    </div>
                    {detailOrder.trackingNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{detailOrder.trackingNumber}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleCopyTracking(detailOrder.trackingNumber!, (detailOrder as any).id || (detailOrder as any)._id || detailOrder.orderNumber)}
                            title="Copy tracking number"
                          >
                            {copiedTrackingId === ((detailOrder as any).id || (detailOrder as any)._id || detailOrder.orderNumber) ? (
                              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Dates Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Order Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Created</p>
                      <p className="font-medium">{formatDate(detailOrder.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{formatDate(detailOrder.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false)
                setDetailOrder(null)
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            // Reset state when dialog closes
            setSelectedOrder(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tracking Number</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Add or update the tracking number for Order #${selectedOrder.orderNumber}`}
            </DialogDescription>
          </DialogHeader>
          <Formik
            initialValues={{
              trackingNumber: selectedOrder?.trackingNumber || '',
            }}
            validationSchema={trackingSchema}
            onSubmit={handleSaveTracking}
            enableReinitialize
            validateOnBlur
            validateOnChange
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Field
                      as={Input}
                      id="trackingNumber"
                      name="trackingNumber"
                      placeholder="Enter tracking number"
                      className={errors.trackingNumber && touched.trackingNumber ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    <ErrorMessage name="trackingNumber" component="p" className="text-sm text-destructive" />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setSelectedOrder(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Save Tracking
                  </Button>
                </DialogFooter>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog 
        open={isRefundDialogOpen} 
        onOpenChange={(open) => {
          setIsRefundDialogOpen(open)
          if (!open) {
            setRefundOrderData(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              {refundOrderData && (
                <>
                  Process refund for Order #{refundOrderData.orderNumber}
                  <br />
                  <span className="font-semibold">Total Amount: {formatPrice(refundOrderData.total)}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Formik
            initialValues={{
              amount: refundOrderData?.total || 0,
              reason: '',
            }}
            validationSchema={refundSchema}
            onSubmit={handleProcessRefund}
            enableReinitialize
            validateOnBlur
            validateOnChange
          >
            {({ isSubmitting, errors, touched, values, setFieldValue }) => (
              <Form>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Refund Amount (₹)</Label>
                    <Field
                      as={Input}
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      max={refundOrderData?.total || 0}
                      step="0.01"
                      placeholder="Enter refund amount"
                      className={errors.amount && touched.amount ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFieldValue('amount', refundOrderData?.total || 0)}
                        className="h-7 text-xs"
                      >
                        Full Refund
                      </Button>
                      {refundOrderData && values.amount !== refundOrderData.total && (
                        <span className="text-xs text-muted-foreground">
                          Partial refund: {formatPrice(values.amount || 0)} of {formatPrice(refundOrderData.total)}
                        </span>
                      )}
                    </div>
                    <ErrorMessage name="amount" component="p" className="text-sm text-destructive" />
                    {refundOrderData && values.amount > refundOrderData.total && (
                      <p className="text-sm text-destructive">
                        Amount cannot exceed order total ({formatPrice(refundOrderData.total)})
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Field
                      as="textarea"
                      id="reason"
                      name="reason"
                      rows={3}
                      placeholder="Enter reason for refund"
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <ErrorMessage name="reason" component="p" className="text-sm text-destructive" />
                  </div>
                  {refundOrderData && (
                    <div className="rounded-md bg-blue-500/10 p-3 border border-blue-500/20">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-900 dark:text-blue-100 space-y-1">
                          <p className="font-semibold">Refund Information:</p>
                          <ul className="list-disc list-inside space-y-0.5 ml-2">
                            <li>Refund will be processed via Razorpay</li>
                            <li>Customer will receive refund in 5-7 business days</li>
                            <li>Refund ID will be stored for tracking</li>
                            {values.amount < refundOrderData.total && (
                              <li className="font-semibold text-orange-600 dark:text-orange-400">
                                This is a partial refund
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsRefundDialogOpen(false)
                      setRefundOrderData(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || (refundOrderData ? values.amount > refundOrderData.total : false)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Process Refund
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  )
}

