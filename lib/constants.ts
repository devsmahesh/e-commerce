export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    COUPONS: '/admin/coupons',
    BANNERS: '/admin/banners',
    CATEGORIES: '/admin/categories',
  },
} as const

// Ghee-specific constants
export const GHEE_TYPES = {
  COW: 'cow',
  BUFFALO: 'buffalo',
  MIXED: 'mixed',
} as const

export const GHEE_WEIGHTS = {
  '250g': 250,
  '500g': 500,
  '1kg': 1000,
  '2kg': 2000,
  '5kg': 5000,
} as const

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const

// Token expiry constants (in days)
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 1, // 1 day
  REFRESH_TOKEN: 7, // 7 days
} as const

