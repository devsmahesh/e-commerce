export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name?: string // For backward compatibility
  phone?: string
  role: 'admin' | 'user'
  avatar?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: Category
  brand?: string
  sku: string
  stock: number
  rating: number
  reviewCount: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  parentId?: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  couponCode?: string
}

export interface Address {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  label?: string
  isDefault: boolean
}

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: Address
  billingAddress?: Address
  paymentMethod?: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  product: Product
  quantity: number
  price: number
}

export interface Coupon {
  id: string
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase?: number
  maxDiscount?: number
  expiresAt?: string
  usageLimit?: number
  usedCount: number
  active: boolean
}

export interface Banner {
  id: string
  title: string
  image: string
  link?: string
  position: 'hero' | 'sidebar' | 'footer'
  active: boolean
  startDate?: string
  endDate?: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string
  createdAt: string
  user: {
    name: string
    avatar?: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

