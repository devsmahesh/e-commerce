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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-2xl font-bold tracking-tight md:mb-8 md:text-3xl">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.slice(0, 8).map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/products?category=${category.slug}`}>
                  <Card className="group relative overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-accent hover:shadow-2xl">
                    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl opacity-50">
                          📦
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 p-4 backdrop-blur-sm transition-all duration-300 group-hover:bg-white">
                      <h3 className="text-center font-semibold text-foreground transition-colors group-hover:text-accent">
                        {category.name}
                      </h3>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No categories available</p>
          )}
        </div>
      </div>
    </section>
  )
}

