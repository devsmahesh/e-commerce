'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useGetCouponsQuery,
  useDeleteCouponMutation,
} from '@/store/api/couponsApi'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function AdminCouponsPage() {
  const { data, isLoading } = useGetCouponsQuery({})
  const [deleteCoupon] = useDeleteCouponMutation()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setCouponToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return

    try {
      await deleteCoupon(couponToDelete).unwrap()
      toast({
        title: 'Coupon deleted',
        description: 'The coupon has been deleted successfully.',
      })
      setCouponToDelete(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete coupon',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Coupons</h1>
          <p className="mt-2 text-muted-foreground">Manage discount coupons</p>
        </div>
        <Link href="/admin/coupons/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-4">
              {data.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <h3 className="font-semibold">{coupon.code}</h3>
                    <p className="text-sm text-muted-foreground">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`} off
                      {coupon.expiresAt && ` • Expires: ${formatDate(coupon.expiresAt)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Used {coupon.usedCount} / {coupon.usageLimit || '∞'} times
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                        coupon.isExpired
                          ? 'bg-destructive/10 text-destructive'
                          : coupon.active
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {coupon.isExpired ? 'Expired' : coupon.active ? 'Active' : 'Inactive'}
                    </span>
                    <Link href={`/admin/coupons/${coupon.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(coupon.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No coupons found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}

