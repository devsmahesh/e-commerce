'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { ProductCard } from '@/components/shop/product-card'
import { FiltersSidebar } from '@/components/shop/filters-sidebar'
import { useGetProductsQuery } from '@/store/api/productsApi'
import { useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'
import { Product } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [sort, setSort] = useState<string>('')
  const [gheeType, setGheeType] = useState<string>('')
  
  // Parse sort string into sortBy and sortOrder
  const getSortParams = () => {
    if (!sort) return {}
    const [sortBy, sortOrder] = sort.split('-')
    return {
      sortBy: sortBy || undefined,
      sortOrder: (sortOrder as 'asc' | 'desc') || undefined,
    }
  }
  
  const { data: productsResponse, isLoading } = useGetProductsQuery({ 
    page, 
    limit: 12, 
    categoryId: category || undefined, 
    search: search || undefined, 
    gheeType: gheeType ? (gheeType as 'cow' | 'buffalo' | 'mixed') : undefined,
    isActive: true, // Only show active products to public users
    ...getSortParams()
  })
  const products = Array.isArray(productsResponse?.data) ? productsResponse.data : []
  const meta = productsResponse?.meta
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    dispatch(
      addItem({
        id: `${product.id}-${Date.now()}`,
        product,
        quantity: 1,
        price: product.price,
      })
    )
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleAddToWishlist = (product: Product) => {
    toast({
      title: 'Added to wishlist',
      description: `${product.name} has been added to your wishlist.`,
    })
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Premium Ghee Products</h1>
            <p className="mt-2 text-muted-foreground">
              Discover our complete collection of premium cow and buffalo ghee
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FiltersSidebar
                category={category}
                onCategoryChange={setCategory}
                sort={sort}
                onSortChange={setSort}
                gheeType={gheeType}
                onGheeTypeChange={setGheeType}
              />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-2xl" />
                  ))}
                </div>
              ) : (
                <>
                  {products.length > 0 ? (
                    <>
                      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                            onAddToWishlist={handleAddToWishlist}
                          />
                        ))}
                      </div>

                      {/* Pagination */}
                      {meta && meta.totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {meta.page} of {meta.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                          >
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-lg text-muted-foreground">No products found</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

