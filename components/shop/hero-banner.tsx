'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { motion } from 'framer-motion'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-20 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Premium Products
              <br />
              <span className="text-accent">Delivered to You</span>
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Discover our curated collection of high-quality products. Shop the latest trends
              and find everything you need in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={ROUTES.PRODUCTS}>
                <Button size="lg" variant="secondary" className="group">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={ROUTES.PRODUCTS}>
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Browse Collection
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-96 lg:h-[500px]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🛍️</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

