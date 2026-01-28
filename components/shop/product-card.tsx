'use client'

import Image from 'next/image'
import Link from 'next/link'
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
  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden transition-all hover:shadow-xl">
        <Link href={`/product/${product.slug}`}>
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {discountPercentage > 0 && (
              <div className="absolute left-2 top-2 rounded-lg bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
                -{discountPercentage}%
              </div>
            )}
            {product.featured && (
              <div className="absolute right-2 top-2 rounded-lg bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
                Featured
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault()
                onAddToWishlist?.(product)
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </Link>
        <CardContent className="p-4">
          <Link href={`/product/${product.slug}`}>
            <h3 className="mb-2 line-clamp-2 font-semibold transition-colors hover:text-accent">
              {product.name}
            </h3>
          </Link>
          <div className="mb-2 flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-accent text-accent'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
          <div className="mb-4 flex items-center space-x-2">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Button
            className="w-full"
            onClick={() => onAddToCart?.(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

