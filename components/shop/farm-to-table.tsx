'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Leaf, CircleDot, FlaskConical, CheckCircle2, Package, Truck } from 'lucide-react'
import { motion } from 'framer-motion'

const journeySteps = [
  {
    id: 1,
    icon: CircleDot,
    title: 'Farm Fresh Herd',
    description: 'Our ghee is made from the finest cow and buffalo ghee, using time-tested traditional methods that preserve all the natural goodness and flavor.',
  },
  {
    id: 2,
    icon: FlaskConical,
    title: 'Ghee Making',
    description: 'Fresh Ghee is transformed into pure, traditional ghee using age-old methods, ensuring authentic taste and nutritional value.',
  },
  {
    id: 3,
    icon: CheckCircle2,
    title: 'Quality Check',
    description: 'The ghee undergoes multiple quality checks for freshness, purity, and nutritional content before it\'s processed further.',
  },
  {
    id: 4,
    icon: Package,
    title: 'Packaging',
    description: 'The ghee is packed in eco-friendly, food-grade bottles and pouches to maintain freshness and hygiene during delivery.',
  },
  {
    id: 5,
    icon: Truck,
    title: 'Fresh Delivery',
    description: 'We ensure fast and efficient delivery to your doorstep so you can enjoy farm-fresh ghee daily.',
  },
]

export function FarmToTable() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(5)

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1024) {
        setCardsPerView(5)
      } else if (window.innerWidth >= 768) {
        setCardsPerView(3)
      } else {
        setCardsPerView(1)
      }
    }

    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView)
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    const maxIndex = Math.max(0, journeySteps.length - cardsPerView)
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < journeySteps.length - cardsPerView

  // On larger screens, show all cards in a grid instead of carousel
  const isLargeScreen = cardsPerView >= 5

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              From Farm Fresh to Your Table
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Discover how our fresh ghee makes its journey from the farm to your table, following a hygienic, sustainable, and transparent process.
          </p>
        </div>

        {/* Cards - Grid on large screens, Carousel on smaller screens */}
        {isLargeScreen ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {journeySteps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full p-6 border-2 border-transparent hover:border-green-200 transition-all duration-300 hover:shadow-xl">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-center mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      {step.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            {canGoPrevious && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-green-50 text-green-600 rounded-full shadow-lg border border-green-100"
                onClick={goToPrevious}
                aria-label="Previous step"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {canGoNext && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-green-50 text-green-600 rounded-full shadow-lg border border-green-100"
                onClick={goToNext}
                aria-label="Next step"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {/* Cards Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out gap-6"
                style={{
                  transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
                }}
              >
                {journeySteps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 px-2"
                    >
                      <Card className="h-full p-6 border-2 border-transparent hover:border-green-200 transition-all duration-300 hover:shadow-xl">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                          <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-center mb-3">
                          {step.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground text-center leading-relaxed">
                          {step.description}
                        </p>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

