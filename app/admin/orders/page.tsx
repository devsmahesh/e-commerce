'use client'

import { useState } from 'react'
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
import { Order } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Package, Edit, Copy, Check, Truck, Eye, User, MapPin, CreditCard, Calendar, ShoppingBag, Info } from 'lucide-react'
import Image from 'next/image'

const trackingSchema = Yup.object().shape({
  trackingNumber: Yup.string()
    .trim()
    .min(1, 'Tracking number is required')
    .required('Tracking number is required'),
})

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null)
  const { data, isLoading } = useGetAllOrdersQuery({ 
    page: 1, 
    status: status === 'all' ? undefined : status 
  })
  const [updateStatus] = useUpdateOrderStatusMutation()
  const { toast } = useToast()

  const handleStatusChange = async (order: Order, newStatus: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Orders</h1>
        <p className="mt-2 text-muted-foreground">Manage customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)} • {order.items.length} items
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {(order as any).customer?.firstName || (order.shippingAddress as any).firstName || ''} {(order as any).customer?.lastName || (order.shippingAddress as any).lastName || ''}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <p className="text-lg font-semibold">
                          Total: {formatPrice(order.total)}
                        </p>
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
                      {order.trackingNumber && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Copy the Tracking and track the shipment in the Delhivery App.
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
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
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
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
                      <p className="font-medium capitalize">{(detailOrder as any).paymentMethod || detailOrder.paymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <p className="font-medium capitalize">{detailOrder.paymentStatus}</p>
                    </div>
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
    </div>
  )
}

