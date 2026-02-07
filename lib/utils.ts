import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Constructs a full image URL from a relative path or returns the URL as-is if it's already a full URL
 * @param imagePath - Relative path (e.g., "uploads/avatars/image.jpg") or full URL
 * @returns Full URL to the image
 */
export function getImageUrl(imagePath: string | undefined | null): string | null {
  if (!imagePath) return null
  
  // If it's already a full URL (starts with http:// or https://), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Otherwise, construct full URL from relative path
  const cleanPath = imagePath.replace(/^\//, '') // Remove leading slash if present
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
  const baseUrl = apiBaseUrl.replace(/\/api\/v1$/, '')
  return `${baseUrl}/${cleanPath}`
}

/**
 * Gets user initials from user object
 * @param user - User object with firstName, lastName, or email
 * @returns Initials string (e.g., "JD" for John Doe)
 */
export function getUserInitials(user: { firstName?: string; lastName?: string; email?: string } | null | undefined): string {
  if (!user) return 'U'
  
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  
  if (user.firstName) {
    return user.firstName[0].toUpperCase()
  }
  
  if (user.email) {
    return user.email[0].toUpperCase()
  }
  
  return 'U'
}

