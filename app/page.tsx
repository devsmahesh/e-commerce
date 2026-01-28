import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { HeroBanner } from '@/components/shop/hero-banner'
import { CategoriesGrid } from '@/components/shop/categories-grid'
import { FeaturedProducts } from '@/components/shop/featured-products'
import { FlashDeals } from '@/components/shop/flash-deals'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <HeroBanner />
        <CategoriesGrid />
        <FeaturedProducts />
        <FlashDeals />
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

