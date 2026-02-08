'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductVariant } from '@/types'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProductVariantsProps {
  variants: ProductVariant[]
  selectedVariantId?: string
  onSelectVariant: (variant: ProductVariant) => void
}

export function ProductVariants({ variants, selectedVariantId, onSelectVariant }: ProductVariantsProps) {
  if (!variants || variants.length === 0) {
    return null
  }

  const calculateDiscount = (price: number, compareAtPrice?: number) => {
    if (!compareAtPrice || compareAtPrice <= price) return 0
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Select Variant</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {variants.map((variant) => {
          const discount = calculateDiscount(variant.price, variant.compareAtPrice)
          const isSelected = selectedVariantId === variant.id
          const isBestSeller = variant.tags?.includes('BEST SELLER')
          const isMoneySaver = variant.tags?.includes('MONEY SAVER')

          return (
            <Card
              key={variant.id}
              className={cn(
                'relative cursor-pointer transition-all duration-300 hover:shadow-lg border-2',
                isSelected
                  ? 'border-green-600 bg-green-50 dark:bg-green-950'
                  : 'border-transparent hover:border-green-200',
                isMoneySaver && 'bg-green-50 dark:bg-green-950 border-green-200'
              )}
              onClick={() => onSelectVariant(variant)}
            >
              {/* Tags */}
              <div className="absolute top-2 left-2 right-2 flex gap-2 z-10">
                {isBestSeller && (
                  <Badge className="bg-orange-500 text-white text-xs font-bold">
                    BEST SELLER
                  </Badge>
                )}
                {isMoneySaver && (
                  <Badge className="bg-green-600 text-white text-xs font-bold">
                    MONEY SAVER
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4 pt-8">
                <h4
                  className={cn(
                    'text-lg font-bold mb-2',
                    isMoneySaver && 'text-green-700 dark:text-green-400'
                  )}
                >
                  {variant.name}
                </h4>
                <div className="space-y-1">
                  <div
                    className={cn(
                      'text-xl font-bold',
                      isMoneySaver && 'text-green-700 dark:text-green-400'
                    )}
                  >
                    {formatPrice(variant.price)}
                  </div>
                  {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                    <div className="text-sm text-muted-foreground line-through">
                      {formatPrice(variant.compareAtPrice)}
                    </div>
                  )}
                </div>
              </div>

              {/* Discount Footer */}
              {discount > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-center py-1 text-xs font-bold rounded-b-lg">
                  {discount}% off
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

