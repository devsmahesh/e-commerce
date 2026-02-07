'use client'

import { useGetPublicBannersQuery } from '@/store/api/bannersApi'
import { Banner } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface DynamicBannerProps {
  position: 'hero' | 'sidebar' | 'footer'
  className?: string
}

export function DynamicBanner({ position, className = '' }: DynamicBannerProps) {
  const { data: banners, isLoading, error } = useGetPublicBannersQuery({
    position,
    active: true,
  })

  // Debug logging
  console.log('DynamicBanner render:', {
    position,
    isLoading,
    error,
    bannersCount: banners?.length || 0,
    banners: banners,
  })

  if (isLoading) {
    if (position === 'hero') {
      return null // Don't show skeleton for hero, let static banner show
    }
    return (
      <div className={className}>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    console.error('Banner API error:', error)
    return null
  }

  if (!banners || banners.length === 0) {
    console.log('No banners found for position:', position)
    return null
  }

  // Filter banners by date range
  const now = new Date()
  const activeBanners = banners.filter((banner) => {
    if (!banner.active) return false
    
    // Check start date
    if (banner.startDate) {
      const startDate = new Date(banner.startDate)
      if (now < startDate) {
        console.log('Banner filtered out: startDate not reached', { banner: banner.title, startDate, now })
        return false
      }
    }
    
    // Check end date
    if (banner.endDate) {
      const endDate = new Date(banner.endDate)
      if (now > endDate) {
        console.log('Banner filtered out: endDate passed', { banner: banner.title, endDate, now })
        return false
      }
    }
    
    return true
  })
  
  // Debug logging
  if (banners && banners.length > 0 && activeBanners.length === 0) {
    console.log('Banners received but all filtered out:', {
      total: banners.length,
      position,
      now: now.toISOString(),
      banners: banners.map(b => ({
        title: b.title,
        active: b.active,
        startDate: b.startDate,
        endDate: b.endDate,
      }))
    })
  }

  if (activeBanners.length === 0) {
    return null
  }

  // For hero position, show the first banner
  // For sidebar/footer, show all banners
  const bannersToShow = position === 'hero' ? [activeBanners[0]] : activeBanners

  return (
    <div className={position === 'sidebar' || position === 'footer' ? 'flex flex-col gap-4' : ''}>
      {bannersToShow.map((banner, index) => (
        <BannerItem 
          key={banner.id} 
          banner={banner} 
          position={position} 
          className={className}
        />
      ))}
    </div>
  )
}

function BannerItem({ banner, position, className }: { banner: Banner; position: string; className: string }) {
  const heightClasses = position === 'hero' 
    ? 'h-[400px] lg:h-[500px]' 
    : position === 'footer'
    ? 'h-[200px] lg:h-[250px]'
    : 'h-[200px] lg:h-[300px]' // Reduced height on mobile for sidebar

  const content = (
    <div
      className={`relative overflow-hidden rounded-lg w-full ${heightClasses} ${className}`}
    >
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        className="object-cover"
        sizes={
          position === 'hero'
            ? '100vw'
            : position === 'sidebar'
            ? '(max-width: 768px) 100vw, 300px'
            : '100vw'
        }
        priority={position === 'hero'}
        style={{ objectFit: 'cover' }}
      />
      {position === 'hero' && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
      )}
      {position === 'hero' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">{banner.title}</h2>
          </div>
        </div>
      )}
    </div>
  )

  if (banner.link) {
    return (
      <Link href={banner.link} className="block">
        {content}
      </Link>
    )
  }

  return content
}

