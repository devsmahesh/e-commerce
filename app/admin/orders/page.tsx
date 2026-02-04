'use client'

import { useState } from 'react'
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
import { Package, Edit } from 'lucide-react'

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingNumber, setTrackingNumber] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
    setTrackingNumber(order.trackingNumber || '')
    setIsDialogOpen(true)
  }

  const handleSaveTracking = async () => {
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
          trackingNumber: trackingNumber.trim() || undefined
        } 
      }).unwrap()
      toast({
        title: 'Tracking updated',
        description: 'Tracking number has been updated successfully.',
      })
      setIsDialogOpen(false)
      setSelectedOrder(null)
      setTrackingNumber('')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update tracking number',
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
                        Customer: {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <p className="text-lg font-semibold">
                          Total: {formatPrice(order.total)}
                        </p>
                        {order.trackingNumber && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span>Tracking: {order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
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

      {/* Tracking Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            // Reset state when dialog closes
            setSelectedOrder(null)
            setTrackingNumber('')
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
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTracking()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setSelectedOrder(null)
                setTrackingNumber('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTracking}>
              Save Tracking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

