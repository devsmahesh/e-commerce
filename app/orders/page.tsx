'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGetOrdersQuery, useCancelOrderMutation } from '@/store/api/ordersApi'
import { formatPrice, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Package, X } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export default function OrdersPage() {
  const { data, isLoading } = useGetOrdersQuery({ page: 1 })
  const [cancelOrder] = useCancelOrderMutation()
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-success'
      case 'shipped':
        return 'text-accent'
      case 'processing':
        return 'text-blue-500'
      case 'cancelled':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-4xl font-bold">My Orders</h1>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.paymentStatus}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                          <p className="text-lg font-semibold">
                            Total: {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:flex-row">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        {order.status === 'pending' && (
                          <Button
                            variant="destructive"
                            onClick={() => handleCancel(order.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-semibold">No orders yet</h2>
              <p className="mb-6 text-muted-foreground">
                Start shopping to see your orders here
              </p>
              <Link href={ROUTES.PRODUCTS}>
                <Button>Start Shopping</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

