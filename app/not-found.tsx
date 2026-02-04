'use client'

import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Home, ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col items-center justify-center text-center">
            {/* 404 Illustration */}
            <div className="mb-8 max-w-lg w-full">
              <svg
                viewBox="0 0 600 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
              >
                {/* Background circle */}
                <circle
                  cx="300"
                  cy="200"
                  r="180"
                  fill="url(#bgGradient)"
                  opacity="0.1"
                />
                
                {/* 404 Text */}
                <text
                  x="300"
                  y="180"
                  fontSize="120"
                  fontWeight="bold"
                  fill="url(#textGradient)"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  404
                </text>
                
                {/* Lost person illustration */}
                <g transform="translate(300, 280)">
                  {/* Person */}
                  <circle cx="0" cy="-40" r="25" fill="currentColor" className="text-primary" />
                  <path
                    d="M-20 20 Q0 0 20 20"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    className="text-primary"
                  />
                  <line
                    x1="-15"
                    y1="-10"
                    x2="-30"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                  <line
                    x1="15"
                    y1="-10"
                    x2="30"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                  <line
                    x1="0"
                    y1="20"
                    x2="0"
                    y2="50"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                  <line
                    x1="-15"
                    y1="50"
                    x2="-25"
                    y2="70"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                  <line
                    x1="15"
                    y1="50"
                    x2="25"
                    y2="70"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                  
                  {/* Question mark */}
                  <g transform="translate(-80, -60)">
                    <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary opacity-50" />
                    <text
                      x="0"
                      y="8"
                      fontSize="40"
                      fontWeight="bold"
                      fill="currentColor"
                      textAnchor="middle"
                      className="text-secondary"
                    >
                      ?
                    </text>
                  </g>
                  
                  {/* Floating elements */}
                  <circle cx="-100" cy="-80" r="8" fill="currentColor" className="text-accent opacity-30">
                    <animate
                      attributeName="cy"
                      values="-80;-100;-80"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="100" cy="-60" r="6" fill="currentColor" className="text-primary opacity-30">
                    <animate
                      attributeName="cy"
                      values="-60;-80;-60"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
                
                {/* Decorative elements */}
                <g opacity="0.2">
                  <path
                    d="M100 100 L120 120 M120 100 L100 120"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                  <path
                    d="M500 100 L520 120 M520 100 L500 120"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                  <path
                    d="M100 300 L120 320 M120 300 L100 320"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                  <path
                    d="M500 300 L520 320 M520 300 L500 320"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                </g>
                
                <defs>
                  <linearGradient id="bgGradient" x1="120" y1="20" x2="480" y2="380" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgb(103, 3, 63)" />
                    <stop offset="100%" stopColor="rgb(248, 156, 29)" />
                  </linearGradient>
                  <linearGradient id="textGradient" x1="180" y1="120" x2="420" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgb(103, 3, 63)" />
                    <stop offset="100%" stopColor="rgb(248, 156, 29)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Content */}
            <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Page Not Found
            </h1>
            <p className="mb-2 text-xl text-muted-foreground max-w-md">
              Oops! The page you&apos;re looking for doesn&apos;t exist.
            </p>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={ROUTES.HOME}
                className={buttonVariants({ size: 'lg', className: 'shadow-lg inline-flex' })}
              >
                <Home className="mr-2 h-5 w-5" />
                Go to Homepage
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.history.back()}
                className="shadow-lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

