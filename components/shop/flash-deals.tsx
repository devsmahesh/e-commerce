'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export function FlashDeals() {
  // In a real app, this would fetch flash deals from the API
  const endTime = new Date()
  endTime.setHours(endTime.getHours() + 24)

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Flash Deals</h2>
            <p className="text-muted-foreground">Limited time offers on premium ghee - Don&apos;t miss out!</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Ends in 24 hours</span>
          </div>
        </div>
        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 p-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Up to 50% Off</h3>
              <p className="text-muted-foreground">
                Selected ghee products with massive discounts. Shop now before they&apos;re gone!
              </p>
              <Link href={`${ROUTES.PRODUCTS}?sort=discount`}>
                <Button>Shop Flash Deals</Button>
              </Link>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Free Shipping</h3>
              <p className="text-muted-foreground">
                On orders over $100. No code needed - automatically applied at checkout.
              </p>
              <Link href={ROUTES.PRODUCTS}>
                <Button variant="outline">Browse Ghee</Button>
              </Link>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">New Arrivals</h3>
              <p className="text-muted-foreground">
                Check out our latest collection of premium ghee products.
              </p>
              <Link href={`${ROUTES.PRODUCTS}?sort=newest`}>
                <Button variant="outline">View New Arrivals</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

