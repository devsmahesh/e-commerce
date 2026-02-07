'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

export function CategoriesGrid() {
  const { data: categoriesResponse, isLoading } = useGetCategoriesQuery({})
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : []

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">Shop by Category</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-48 flex-shrink-0 rounded-xl md:h-56 md:w-56" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-8">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-2xl font-bold tracking-tight md:mb-8 md:text-3xl">Shop by Category</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex-shrink-0"
              >
                <Link href={`/products?category=${category.slug}`}>
                  <Card className="group relative flex h-48 w-48 flex-col overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-accent hover:shadow-2xl md:h-56 md:w-56">
                    <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 192px, 224px"
                          priority={index < 4}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl opacity-50">
                          📦
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="bg-white/95 p-3 backdrop-blur-sm transition-all duration-300 group-hover:bg-white">
                      <h3 className="text-center text-sm font-semibold text-foreground transition-colors group-hover:text-accent md:text-base">
                        {category.name}
                      </h3>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <p className="w-full text-center text-muted-foreground">No categories available</p>
          )}
        </div>
      </div>
    </section>
  )
}

