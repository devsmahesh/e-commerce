'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useGetAllFlashDealsQuery,
  useDeleteFlashDealMutation,
} from '@/store/api/flashDealsApi'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function AdminFlashDealsPage() {
  const { data, isLoading } = useGetAllFlashDealsQuery({})
  const [deleteFlashDeal] = useDeleteFlashDealMutation()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dealToDelete, setDealToDelete] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setDealToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!dealToDelete) return

    try {
      await deleteFlashDeal(dealToDelete).unwrap()
      toast({
        title: 'Flash deal deleted',
        description: 'The flash deal has been deleted successfully.',
      })
      setDealToDelete(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete flash deal',
        variant: 'destructive',
      })
    }
  }

  const isActive = (deal: any) => {
    if (!deal.active) return false
    const now = new Date()
    const startDate = new Date(deal.startDate)
    const endDate = new Date(deal.endDate)
    return now >= startDate && now <= endDate
  }

  const isExpired = (deal: any) => {
    const now = new Date()
    const endDate = new Date(deal.endDate)
    return now > endDate
  }

  const isScheduled = (deal: any) => {
    const now = new Date()
    const startDate = new Date(deal.startDate)
    return now < startDate
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Flash Deals</h1>
          <p className="mt-2 text-muted-foreground">Manage time-limited promotional offers</p>
        </div>
        <Link href="/admin/flash-deals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Flash Deal
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-4">
              {data.map((deal) => {
                const active = isActive(deal)
                const expired = isExpired(deal)
                const scheduled = isScheduled(deal)
                
                return (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{deal.title}</h3>
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                            expired
                              ? 'bg-destructive/10 text-destructive'
                              : active
                              ? 'bg-success/10 text-success'
                              : scheduled
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {expired ? 'Expired' : active ? 'Active' : scheduled ? 'Scheduled' : 'Inactive'}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {deal.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{deal.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                          <strong>Start:</strong> {formatDate(deal.startDate)}
                        </span>
                        <span>
                          <strong>End:</strong> {formatDate(deal.endDate)}
                        </span>
                        {deal.priority !== undefined && (
                          <span>
                            <strong>Priority:</strong> {deal.priority}
                          </span>
                        )}
                        {deal.discountPercentage && (
                          <span>
                            <strong>Discount:</strong> {deal.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/flash-deals/${deal.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteClick(deal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No flash deals found</p>
              <Link href="/admin/flash-deals/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Flash Deal
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Flash Deal"
        description="Are you sure you want to delete this flash deal? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}

