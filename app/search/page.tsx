'use client'

import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { ProductCard } from '@/components/shop/product-card'
import { useGetProductsQuery } from '@/store/api/productsApi'
import { useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'
import { Product } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const { data, isLoading } = useGetProductsQuery({ 
    search: query, 
    page: 1,
    isActive: true // Only show active products to public users
  })
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
            <h1 className="text-4xl font-bold">
              Search runiche Products {query && `for "${query}"`}
            </h1>
            {data && (
              <p className="mt-2 text-muted-foreground">
                Found {data.meta.total} {data.meta.total === 1 ? 'ghee product' : 'ghee products'}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No ghee products found. Try a different search term.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

