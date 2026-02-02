'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '@/store/api/usersApi'
import { Product } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import { tokenManager } from '@/lib/token'
import { useAppSelector } from '@/store/hooks'
import { useState, useEffect } from 'react'

export default function WishlistPage() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const hasAuth = mounted && (isAuthenticated || tokenManager.getAccessToken())

  const { data: wishlistItems = [], isLoading } = useGetWishlistQuery(undefined, {
    skip: !hasAuth,
  })
  const [removeFromWishlist] = useRemoveFromWishlistMutation()

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleRemoveFromWishlist = async (product: Product) => {
    try {
      await removeFromWishlist(product.id).unwrap()
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist.`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to remove from wishlist.',
        variant: 'destructive',
      })
    }
  }

  if (!mounted) {
    return null
  }

  if (!hasAuth) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-12">
              <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-semibold">Please login to view your wishlist</h2>
              <p className="mb-6 text-muted-foreground">
                You need to be logged in to access your wishlist
              </p>
              <Link href={ROUTES.LOGIN}>
                <Button>Login</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-4xl font-bold">My Wishlist</h1>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
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
                <div key={product.id} className="relative">
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={() => handleRemoveFromWishlist(product)}
                  />
                </div>
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

