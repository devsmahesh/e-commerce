'use client'

import { DynamicBanner } from './dynamic-banner'

export function SidebarBanner() {
  return (
    <div className="w-full">
      <DynamicBanner position="sidebar" className="w-full" />
    </div>
  )
}

