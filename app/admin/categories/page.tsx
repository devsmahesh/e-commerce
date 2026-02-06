'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from '@/store/api/categoriesApi'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import Image from 'next/image'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useGetCategoriesQuery({ includeInactive: true })
  const [deleteCategory] = useDeleteCategoryMutation()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)

  // Filter categories by search term
  // Ensure data is an array before filtering
  const categories = Array.isArray(data) ? data : []
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleDeleteClick = (id: string, name: string) => {
    setCategoryToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      await deleteCategory(categoryToDelete.id).unwrap()
      toast({
        title: 'Category deleted',
        description: 'The category has been deleted successfully.',
      })
      setCategoryToDelete(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete category',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Categories</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">Manage product categories</p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
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
          ) : filteredCategories.length > 0 ? (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-start sm:items-center gap-3 sm:gap-4 rounded-lg border border-border p-4 bg-white shadow-sm"
                >
                  {/* Image/Icon */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 64px, 80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-base sm:text-lg">{category.name}</h3>
                      <span
                        className={`rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                          category.isActive !== false
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {category.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Slug: {category.slug}
                    </p>
                    {category.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                    {category.parentId && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Parent ID: {category.parentId}
                      </p>
                    )}
                  </div>
                  
                  {/* Icons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleDeleteClick(category.id, category.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}

