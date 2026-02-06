'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from '@/store/api/productsApi'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null)
  const { data, isLoading, error, isError } = useGetProductsQuery({ 
    page: 1, 
    ...(search.trim() && { search: search.trim() })
  })
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  const { toast } = useToast()

  React.useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error loading products',
        description: (error as any)?.data?.message || 'Failed to load products. Please try again.',
        variant: 'destructive',
      })
    }
  }, [isError, error, toast])

  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete.id).unwrap()
      toast({
        title: 'Product deleted',
        description: 'The product has been deleted successfully.',
      })
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete product',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Ghee Products</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">Manage your ghee product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ghee products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <p className="text-destructive">Error loading products. Please try again.</p>
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start sm:items-center gap-3 sm:gap-4 rounded-lg border border-border p-4 bg-white shadow-sm"
                >
                  {/* Image */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 64px, 80px"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      {product.category.name} • {formatPrice(product.price)}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Stock: {product.stock}
                    </p>
                  </div>
                  
                  {/* Icons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleDeleteClick(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

