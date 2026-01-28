'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useGetBannersQuery,
  useDeleteBannerMutation,
} from '@/store/api/adminApi'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function AdminBannersPage() {
  const { data, isLoading } = useGetBannersQuery()
  const [deleteBanner] = useDeleteBannerMutation()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setBannerToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return

    try {
      await deleteBanner(bannerToDelete).unwrap()
      toast({
        title: 'Banner deleted',
        description: 'The banner has been deleted successfully.',
      })
      setBannerToDelete(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete banner',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Banners</h1>
          <p className="mt-2 text-muted-foreground">Manage promotional banners</p>
        </div>
        <Link href="/admin/banners/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.map((banner) => (
                <div
                  key={banner.id}
                  className="relative overflow-hidden rounded-lg border border-border"
                >
                  <div className="relative aspect-video w-full bg-muted">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{banner.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Position: {banner.position} •{' '}
                      {banner.active ? 'Active' : 'Inactive'}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {banner.startDate && `Starts: ${new Date(banner.startDate).toLocaleDateString()}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/banners/${banner.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No banners found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Banner"
        description="Are you sure you want to delete this banner? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}

