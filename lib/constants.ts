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
  },
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

