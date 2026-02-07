'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { useGetActiveFlashDealsQuery } from '@/store/api/flashDealsApi'
import { FlashDeal } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function useCountdown(endDate: string): TimeLeft | null {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft | null => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const difference = end - now

      if (difference <= 0) {
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      }
    }

    // Calculate immediately
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return timeLeft
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const timeLeft = useCountdown(endDate)

  if (!timeLeft) {
    return <span className="text-muted-foreground">Expired</span>
  }

  const { days, hours, minutes, seconds } = timeLeft

  if (days > 0) {
    return (
      <span>
        {days}d {hours}h {minutes}m
      </span>
    )
  }

  return (
    <span>
      {hours}h {minutes}m {seconds}s
    </span>
  )
}

function FlashDealCard({ deal }: { deal: FlashDeal }) {
  const timeLeft = useCountdown(deal.endDate)
  const isExpired = !timeLeft

  // Get the earliest end date for the main countdown
  const earliestEndDate = useMemo(() => {
    return deal.endDate
  }, [deal.endDate])

  const getDefaultLink = () => {
    switch (deal.type) {
      case 'discount':
        return `${ROUTES.PRODUCTS}?sort=discount`
      case 'new_arrival':
        return `${ROUTES.PRODUCTS}?sort=newest`
      default:
        return ROUTES.PRODUCTS
    }
  }

  const getDefaultButtonText = () => {
    switch (deal.type) {
      case 'discount':
        return 'Shop Flash Deals'
      case 'shipping':
        return 'Browse Ghee'
      case 'new_arrival':
        return 'View New Arrivals'
      default:
        return 'Shop Now'
    }
  }

  const link = deal.link || getDefaultLink()
  const buttonText = deal.buttonText || getDefaultButtonText()
  const buttonVariant = deal.buttonVariant || (deal.type === 'discount' ? 'default' : 'outline')

  if (isExpired) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{deal.title}</h3>
      <p className="text-muted-foreground">{deal.description}</p>
      <Link href={link}>
        <Button variant={buttonVariant as 'default' | 'outline'}>{buttonText}</Button>
      </Link>
    </div>
  )
}

export function FlashDeals() {
  const { data: deals = [], isLoading, error } = useGetActiveFlashDealsQuery({ limit: 3 })

  // Get the earliest end date for the main countdown display
  const earliestEndDate = useMemo(() => {
    if (!deals || deals.length === 0) return null
    const sortedDeals = [...deals].sort((a, b) => 
      new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    )
    return sortedDeals[0].endDate
  }, [deals])

  // Don't render if no active deals
  if (!isLoading && (!deals || deals.length === 0)) {
    return null
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Flash Deals</h2>
            <p className="text-muted-foreground">Limited time offers on premium ghee - Don&apos;t miss out!</p>
          </div>
          {earliestEndDate && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                Ends in <CountdownTimer endDate={earliestEndDate} />
              </span>
            </div>
          )}
        </div>
        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 p-8">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load flash deals. Please try again later.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <FlashDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}

