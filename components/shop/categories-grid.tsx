'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

export function CategoriesGrid() {
  const { data: categoriesResponse, isLoading } = useGetCategoriesQuery({})
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse?.data || []

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.slice(0, 8).map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/products?category=${category.slug}`}>
                  <Card className="group overflow-hidden transition-all hover:shadow-xl">
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold transition-colors group-hover:text-accent">
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

