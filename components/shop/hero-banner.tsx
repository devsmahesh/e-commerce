'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { motion } from 'framer-motion'

export function HeroBanner() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-teal-900/30">
      {/* Background Images - Blended */}
      <div className="absolute inset-0">
        {/* Cow Ghee Image - Left side with fade to right */}
        <div 
          className="absolute inset-0 left-0 opacity-40"
          style={{
            backgroundImage: "url('/assests/cow-ghee.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            maskImage: 'linear-gradient(to right, black 0%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 60%, transparent 100%)',
          }}
        />
        {/* Buffalo Ghee Image - Right side with fade to left */}
        {/* <div 
          className="absolute inset-0 right-0 opacity-40"
          style={{
            backgroundImage: "url('/assests/buffalo-ghee.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            maskImage: 'linear-gradient(to left, black 0%, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 0%, black 60%, transparent 100%)',
          }}
        /> */}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-800/70 to-teal-900/50" />
        {/* Dramatic lighting effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(15, 23, 42, 0.6) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Top Banner Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm lg:text-base uppercase tracking-widest font-light flex items-center justify-center gap-2 flex-wrap"
          >
            <span className="text-accent font-medium">Premium Ghee</span>
            <span className="text-white/50">•</span>
            <span className="text-white/70">Traditional & Authentic</span>
          </motion.div>

          {/* Brand Watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            <span className="text-9xl lg:text-[12rem] font-bold text-purple-500/10 select-none">Runiche</span>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            {/* Vegetarian Badge */}
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-300 font-medium">Vegetarian</span>
            </div>
            {/* 100% Pure Badge */}
            <div className="bg-yellow-400/20 border border-yellow-400/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
              <span className="text-xs text-yellow-300 font-bold uppercase tracking-wide">100% Pure</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-2 relative z-10"
          >
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight leading-tight"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <span className="text-white">Create a</span>
              <br />
              <span className="font-normal bg-gradient-to-r from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
                Ghee Moment
              </span>
            </h1>
          </motion.div>

          {/* Product Attributes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-4 text-xs lg:text-sm text-white/60 font-light uppercase tracking-wider"
          >
            <span>Homemade</span>
            <span className="text-white/30">•</span>
            <span>100% Organic</span>
            <span className="text-white/30">•</span>
            <span>Shuddh Desi Ghee</span>
          </motion.div>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base lg:text-lg max-w-2xl mx-auto font-light leading-relaxed relative z-10"
          >
            <span className="text-white/90">Choose from our selection of </span>
            <span className="text-accent font-medium">premium pure cow and buffalo ghee</span>
            <span className="text-white/90">, or explore our collection to create the perfect addition to your family&apos;s wellness journey.</span>
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 pt-4 relative z-10"
          >
            <Link href={ROUTES.PRODUCTS}>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-primary-foreground border-2 border-accent rounded-none px-8 py-6 text-sm uppercase tracking-wider font-medium transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:scale-105"
              >
                Shop Collection
              </Button>
            </Link>
            <Link href={ROUTES.PRODUCTS}>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/60 rounded-none px-8 py-6 text-sm uppercase tracking-wider font-medium transition-all hover:scale-105"
              >
                Browse Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

