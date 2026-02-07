'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { SidebarBanner } from './sidebar-banner'

interface FiltersSidebarProps {
  category: string
  onCategoryChange: (category: string) => void
  sort: string
  onSortChange: (sort: string) => void
  gheeType?: string
  onGheeTypeChange?: (gheeType: string) => void
}

export function FiltersSidebar({
  category,
  onCategoryChange,
  sort,
  onSortChange,
  gheeType,
  onGheeTypeChange,
}: FiltersSidebarProps) {
  const { data: categoriesResponse } = useGetCategoriesQuery({})
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse as any)?.data || []

  return (
    <div className="flex flex-col gap-6">
      {/* Sidebar Banner - Show first on mobile (order-1), after filters on desktop (order-2) */}
      <div className="order-1 lg:order-2">
        <SidebarBanner />
      </div>
      
      {/* Filters Card - Show after banner on mobile (order-2), first on desktop (order-1) */}
      <Card className="order-2 lg:order-1">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category || 'all'} onValueChange={(value) => onCategoryChange(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.isArray(categories) && categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {onGheeTypeChange && (
            <div className="space-y-2">
              <Label>Ghee Type</Label>
              <Select value={gheeType || 'all'} onValueChange={(value) => onGheeTypeChange(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cow">Cow Ghee</SelectItem>
                  <SelectItem value="buffalo">Buffalo Ghee</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sort || 'default'} onValueChange={(value) => onSortChange(value === 'default' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

