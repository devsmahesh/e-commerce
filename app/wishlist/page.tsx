'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'
import { Product } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export default function WishlistPage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  // In a real app, this would fetch from API
  const wishlistItems: Product[] = []

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-4xl font-bold">My Wishlist</h1>

          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-semibold">Your wishlist is empty</h2>
              <p className="mb-6 text-muted-foreground">
                Start adding items to your wishlist
              </p>
              <Link href={ROUTES.PRODUCTS}>
                <Button>Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {wishlistItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

