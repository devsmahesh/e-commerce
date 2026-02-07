'use client'

import { DynamicBanner } from './dynamic-banner'

export function FooterBanner() {
  return (
    <div className="w-full bg-background">
      <div className="container mx-auto px-4 py-6">
        <DynamicBanner position="footer" className="w-full" />
      </div>
    </div>
  )
}

