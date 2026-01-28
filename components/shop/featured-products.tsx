'use client'

import { ProductCard } from '@/components/shop/product-card'
import { useGetProductsQuery } from '@/store/api/productsApi'
import { useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'
import { Product } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

export function FeaturedProducts() {
  const { data: productsResponse, isLoading } = useGetProductsQuery({ isFeatured: true, limit: 8 })
  const products = productsResponse?.data || []
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

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold">Featured Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold">Featured Products</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.isArray(products) && products.length > 0 ? (
            products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No featured products available</p>
          )}
        </div>
      </div>
    </section>
  )
}

