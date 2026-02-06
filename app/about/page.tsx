'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Heart, Award, Users, Truck, Shield, Leaf } from 'lucide-react'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About Runiche</h1>
              <p className="text-lg text-muted-foreground">
                Your trusted source for premium, authentic cow and buffalo ghee
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Our Story */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Runiche was born from a passion for preserving traditional Indian culinary heritage 
                    and bringing authentic, high-quality ghee to modern households. We understand that 
                    ghee is not just a cooking ingredient—it&apos;s a symbol of purity, tradition, and 
                    nutritional excellence.
                  </p>
                  <p>
                    Our journey began with a simple mission: to make premium, authentic ghee accessible 
                    to everyone while maintaining the highest standards of quality and purity. We work 
                    directly with trusted dairy farms and use traditional methods to ensure every jar 
                    of Runiche ghee meets our exacting standards.
                  </p>
                  <p>
                    Today, Runiche stands as a trusted name in premium ghee, serving thousands of 
                    satisfied customers who value authenticity, quality, and the rich heritage of 
                    traditional Indian ghee-making.
                  </p>
                </div>
              </div>

              {/* Gallery Section 1 - Our Products */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center">Our Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                  {/* Polaroid 1 - Cow Ghee */}
                  <div className="group relative">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-all duration-300 hover:scale-105 hover:rotate-1 -rotate-1">
                      <div className="bg-white dark:bg-gray-700 p-2 shadow-inner">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <Image
                            src="/assests/cow-ghee.png"
                            alt="Premium Cow Ghee"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Premium Cow Ghee</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pure & Authentic</p>
                      </div>
                    </div>
                  </div>

                  {/* Polaroid 2 - Buffalo Ghee */}
                  <div className="group relative">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-all duration-300 hover:scale-105 hover:-rotate-1 rotate-1">
                      <div className="bg-white dark:bg-gray-700 p-2 shadow-inner">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <Image
                            src="/assests/buffalo-ghee.png"
                            alt="Premium Buffalo Ghee"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Premium Buffalo Ghee</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rich & Traditional</p>
                      </div>
                    </div>
                  </div>

                  {/* Polaroid 3 - Logo */}
                  <div className="group relative">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-all duration-300 hover:scale-105 rotate-1">
                      <div className="bg-white dark:bg-gray-700 p-2 shadow-inner">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <Image
                            src="/assests/runiche-logo.png"
                            alt="Runiche Logo"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Runiche</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Trusted Quality</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Section 2 - Behind the Scenes */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center">Behind the Scenes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                  {/* Polaroid 1 - Cow Ghee */}
                  <div className="group relative">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-all duration-300 hover:scale-105 hover:-rotate-2 rotate-2">
                      <div className="bg-white dark:bg-gray-700 p-2 shadow-inner">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <Image
                            src="/assests/cow-ghee.png"
                            alt="Traditional Process"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Traditional Process</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time-honored methods</p>
                      </div>
                    </div>
                  </div>

                  {/* Polaroid 2 - Logo */}
                  <div className="group relative">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-all duration-300 hover:scale-105 -rotate-1">
                      <div className="bg-white dark:bg-gray-700 p-2 shadow-inner">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <Image
                            src="/assests/runiche-logo.png"
                            alt="Quality Assurance"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Quality Assurance</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rigorous testing</p>
                      </div>
                    </div>
                  </div>

                  {/* Polaroid 3 - Buffalo Ghee */}
                  <div className="group relative">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-all duration-300 hover:scale-105 hover:rotate-2 rotate-1">
                      <div className="bg-white dark:bg-gray-700 p-2 shadow-inner">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <Image
                            src="/assests/buffalo-ghee.png"
                            alt="Farm Fresh"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Farm Fresh</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Direct from farms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Section 3 - Our Heritage */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center">Our Heritage</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                  {/* Polaroid 1 - Logo */}
                  <div className="group relative">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-all duration-300 hover:scale-105 rotate-2">
                      <div className="bg-white dark:bg-gray-700 p-2 shadow-inner">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <Image
                            src="/assests/runiche-logo.png"
                            alt="Heritage"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Heritage</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generations of tradition</p>
                      </div>
                    </div>
                  </div>

                  {/* Polaroid 2 - Cow Ghee */}
                  <div className="group relative">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-all duration-300 hover:scale-105 hover:-rotate-1 -rotate-2">
                      <div className="bg-white dark:bg-gray-700 p-2 shadow-inner">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <Image
                            src="/assests/cow-ghee.png"
                            alt="Authentic Taste"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Authentic Taste</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Original flavors</p>
                      </div>
                    </div>
                  </div>

                  {/* Polaroid 3 - Buffalo Ghee */}
                  <div className="group relative">
                    <div className="bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-all duration-300 hover:scale-105 hover:rotate-1">
                      <div className="bg-white dark:bg-gray-700 p-2 shadow-inner">
                        <div className="relative w-full aspect-square overflow-hidden">
                          <Image
                            src="/assests/buffalo-ghee.png"
                            alt="Premium Quality"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Premium Quality</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Finest ingredients</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Our Values */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold mb-6">Our Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Authenticity</h3>
                      <p className="text-muted-foreground">
                        We stay true to traditional methods, ensuring every product is authentic and genuine.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Purity</h3>
                      <p className="text-muted-foreground">
                        Every batch undergoes rigorous quality checks to ensure 100% pure, unadulterated ghee.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Quality</h3>
                      <p className="text-muted-foreground">
                        We never compromise on quality, sourcing only the finest ingredients for our products.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Customer First</h3>
                      <p className="text-muted-foreground">
                        Your satisfaction is our priority. We&apos;re committed to providing exceptional service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold mb-6">Why Choose Runiche?</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
                      <p className="text-muted-foreground">
                        Our ghee is made from the finest cow and buffalo milk, using time-tested traditional 
                        methods that preserve all the natural goodness and flavor.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Truck className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Fast & Secure Delivery</h3>
                      <p className="text-muted-foreground">
                        We ensure your orders are packed with care and delivered quickly and safely to your doorstep, 
                        maintaining product freshness throughout the journey.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Award className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Certified & Tested</h3>
                      <p className="text-muted-foreground">
                        All our products undergo strict quality testing and meet the highest food safety standards, 
                        giving you complete peace of mind.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Heart className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Traditional Heritage</h3>
                      <p className="text-muted-foreground">
                        We honor the rich tradition of ghee-making, bringing you authentic flavors that have been 
                        cherished for generations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Our Commitment */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold mb-4">Our Commitment</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    At Runiche, we are committed to providing you with the finest quality ghee while maintaining 
                    ethical practices and sustainable sourcing. We believe in transparency, quality, and building 
                    lasting relationships with our customers.
                  </p>
                  <p>
                    Whether you&apos;re using our ghee for cooking, religious ceremonies, or as a nutritional supplement, 
                    you can trust Runiche to deliver excellence in every jar.
                  </p>
                  <p className="font-medium text-foreground">
                    Thank you for choosing Runiche. We&apos;re honored to be part of your culinary journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
