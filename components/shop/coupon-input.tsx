'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGetCouponByCodeQuery } from '@/store/api/couponsApi'
import { useToast } from '@/hooks/use-toast'
import { Loader2, X, Check, Tag } from 'lucide-react'
import { Coupon } from '@/types'
import { formatPrice } from '@/lib/utils'

interface CouponInputProps {
  onApply: (coupon: Coupon | null) => void
  appliedCoupon: Coupon | null
  subtotal: number
  className?: string
}

export function CouponInput({ onApply, appliedCoupon, subtotal, className = '' }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const { toast } = useToast()

  const { data: coupon, isLoading, error, refetch } = useGetCouponByCodeQuery(couponCode, {
    skip: !couponCode || couponCode.length < 3 || !!appliedCoupon,
  })

  const handleApply = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a coupon code',
        variant: 'destructive',
      })
      return
    }

    setIsValidating(true)
    try {
      const { data: fetchedCoupon } = await refetch()
      
      if (!fetchedCoupon) {
        toast({
          title: 'Invalid Coupon',
          description: 'The coupon code you entered is invalid or expired.',
          variant: 'destructive',
        })
        setIsValidating(false)
        return
      }

      // Validate coupon
      const validationError = validateCoupon(fetchedCoupon, subtotal)
      if (validationError) {
        toast({
          title: 'Coupon Not Applicable',
          description: validationError,
          variant: 'destructive',
        })
        setIsValidating(false)
        return
      }

      onApply(fetchedCoupon)
      toast({
        title: 'Coupon Applied!',
        description: `You saved ${getDiscountAmount(fetchedCoupon, subtotal)}!`,
      })
      setCouponCode('')
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.data?.message || 'Failed to validate coupon',
        variant: 'destructive',
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemove = () => {
    onApply(null)
    setCouponCode('')
    toast({
      title: 'Coupon Removed',
      description: 'The coupon has been removed from your order.',
    })
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {appliedCoupon ? (
        <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/10 p-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <div>
              <p className="text-sm font-semibold text-success">{appliedCoupon.code}</p>
              <p className="text-xs text-muted-foreground">{appliedCoupon.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && couponCode.trim() && !isValidating) {
                  handleApply()
                }
              }}
              className="pl-10"
              disabled={isValidating}
            />
          </div>
          <Button
            onClick={handleApply}
            disabled={!couponCode.trim() || isValidating}
            size="default"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function validateCoupon(coupon: Coupon, subtotal: number): string | null {
  // Check if coupon is active
  if (!coupon.active) {
    return 'This coupon is not active.'
  }

  // Check expiration date
  if (coupon.expiresAt) {
    const expiryDate = new Date(coupon.expiresAt)
    if (new Date() > expiryDate) {
      return 'This coupon has expired.'
    }
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return 'This coupon has reached its usage limit.'
  }

  // Check minimum purchase
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return `Minimum purchase of ${formatPrice(coupon.minPurchase)} required.`
  }

  return null
}

export function getDiscountAmount(coupon: Coupon, subtotal: number): number {
  if (coupon.type === 'percentage') {
    const discount = (subtotal * coupon.value) / 100
    if (coupon.maxDiscount) {
      return Math.min(discount, coupon.maxDiscount)
    }
    return discount
  } else {
    return coupon.value
  }
}

export function calculateTotalWithCoupon(
  subtotal: number,
  tax: number,
  shipping: number,
  coupon: Coupon | null
): number {
  if (!coupon) {
    return subtotal + tax + shipping
  }

  const discount = getDiscountAmount(coupon, subtotal)
  const discountedSubtotal = subtotal - discount
  const taxOnDiscounted = discountedSubtotal * 0.1 // Assuming 10% tax
  return discountedSubtotal + taxOnDiscounted + shipping
}

