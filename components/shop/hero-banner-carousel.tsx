'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Banner } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroBannerCarouselProps {
  banners: Banner[]
  staticHeroSlide: ReactNode
}

export function HeroBannerCarousel({ banners, staticHeroSlide }: HeroBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Total slides = 1 (static hero) + banners.length
  const totalSlides = 1 + banners.length

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, 5000)

    return () => clearInterval(interval)
  }, [totalSlides])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  return (
    <div className="relative w-full min-h-[700px] lg:min-h-[800px] overflow-hidden">
      {/* All Slides */}
      <div className="relative w-full h-full">
        {/* Static Hero UI - First Slide (index 0) */}
        <div
          className={`absolute inset-0 min-h-[700px] lg:min-h-[800px] transition-opacity duration-500 ${
            currentIndex === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {staticHeroSlide}
        </div>

        {/* Database Banners - Subsequent Slides (index 1+) */}
        {banners.map((banner, bannerIndex) => {
          const slideIndex = bannerIndex + 1 // Start from index 1
          const isActive = slideIndex === currentIndex
          const slideContent = (
            <>
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority={bannerIndex === 0}
              />
              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
              {/* Banner Title */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="mb-4 text-3xl font-bold lg:text-4xl">{banner.title}</h2>
                </div>
              </div>
            </>
          )

          const slideWrapper = (
            <div
              className={`absolute inset-0 min-h-[700px] lg:min-h-[800px] transition-opacity duration-500 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {slideContent}
            </div>
          )

          if (banner.link) {
            return (
              <Link key={banner.id} href={banner.link} className="absolute inset-0 block">
                {slideWrapper}
              </Link>
            )
          }

          return (
            <div key={banner.id} className="absolute inset-0">
              {slideWrapper}
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goToPrevious}
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goToNext}
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

