'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'
import { motion } from 'framer-motion'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onAddToWishlist?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const router = useRouter()
  
  // Get the variant to display (default variant or first variant)
  const displayVariant = product.variants && product.variants.length > 0
    ? product.variants.find(v => v.isDefault) || product.variants[0]
    : null
  
  // Use variant price if available, otherwise use product price
  const displayPrice = displayVariant ? displayVariant.price : product.price
  const displayCompareAtPrice = displayVariant 
    ? displayVariant.compareAtPrice 
    : product.compareAtPrice
  
  // Calculate discount percentage based on display prices
  const discountPercentage = displayCompareAtPrice
    ? Math.round(((displayCompareAtPrice - displayPrice) / displayCompareAtPrice) * 100)
    : 0

  const handleBuyNow = () => {
    router.push(`/product/${product.slug}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-accent/20 hover:shadow-2xl">
        <Link href={`/product/${product.slug}`}>
          <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {discountPercentage > 0 && (
              <div className="absolute left-2 top-2 z-10 rounded-md bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                -{discountPercentage}%
              </div>
            )}
            {product.featured && (
              <div className="absolute right-2 top-2 z-10 rounded-md bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                Featured
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 bottom-2 z-10 rounded-full bg-white/90 opacity-0 shadow-md transition-all duration-300 hover:bg-white hover:scale-110 group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault()
                onAddToWishlist?.(product)
              }}
            >
              <Heart className="h-4 w-4 text-destructive" />
            </Button>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>
        <CardContent className="p-4 space-y-3">
          <Link href={`/product/${product.slug}`}>
            <h3 className="mb-1 line-clamp-2 min-h-[3rem] font-semibold text-foreground transition-colors hover:text-accent">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="ml-1 text-xs text-muted-foreground">
              ({product.reviewCount || 0})
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-foreground">{formatPrice(displayPrice)}</span>
            {displayCompareAtPrice && (
              <span className="text-sm font-medium text-muted-foreground line-through">
                {formatPrice(displayCompareAtPrice)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 transition-all duration-300 hover:shadow-lg"
              onClick={() => onAddToCart?.(product)}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

