# Admin API Endpoints List

This document lists all Admin API endpoints required for the e-commerce admin panel.

## 1. Dashboard APIs

### GET `/admin/dashboard`
- **Description**: Get dashboard statistics (total revenue, orders, users, growth rate)
- **Response**: 
  ```typescript
  {
    totalRevenue: number
    totalOrders: number
    totalUsers: number
    growthRate: number
  }
  ```
- **Status**: ✅ Implemented in `adminApi.ts`

### GET `/admin/dashboard/revenue`
- **Description**: Get revenue data for charts (with period filter)
- **Query Params**: `period?: string` (e.g., '30d', '7d', '1y')
- **Response**: 
  ```typescript
  {
    data: Array<{
      date: string
      revenue: number
      orders: number
    }>
  }
  ```
- **Status**: ✅ Implemented in `adminApi.ts`

---

## 2. Users Management APIs

### GET `/admin/users`
- **Description**: Get paginated list of all users
- **Query Params**: 
  - `page?: number`
  - `limit?: number`
  - `search?: string`
- **Response**: `PaginatedResponse<User>`
- **Status**: ✅ Implemented in `adminApi.ts`

### PUT `/admin/users/:userId/status`
- **Description**: Update user active/inactive status
- **Body**: 
  ```typescript
  {
    isActive: boolean
  }
  ```
- **Response**: `User`
- **Status**: ✅ Implemented in `adminApi.ts`

### DELETE `/admin/users/:id`
- **Description**: Delete a user
- **Response**: `void`
- **Status**: ✅ Implemented in `adminApi.ts`

### Additional User APIs (Recommended)
- **GET `/admin/users/:id`** - Get user details
- **PUT `/admin/users/:id`** - Update user information
- **PUT `/admin/users/:id/role`** - Update user role

---

## 3. Products Management APIs

### GET `/products` (Admin View)
- **Description**: Get all products with filters (used in admin products page)
- **Query Params**: 
  - `page?: number`
  - `limit?: number`
  - `search?: string`
  - `categoryId?: string`
  - `minPrice?: number`
  - `maxPrice?: number`
  - `inStock?: boolean`
  - `isFeatured?: boolean`
  - `sortBy?: string`
  - `sortOrder?: 'asc' | 'desc'`
- **Response**: `PaginatedResponse<Product>`
- **Status**: ✅ Implemented in `productsApi.ts`

### GET `/products/:id`
- **Description**: Get product by ID
- **Response**: `Product`
- **Status**: ✅ Implemented in `productsApi.ts`

### POST `/products`
- **Description**: Create a new product (Admin only)
- **Body**: 
  ```typescript
  {
    name: string
    description: string
    price: number
    stock: number
    categoryId: string
    images: string[]
    tags?: string[]
    isFeatured?: boolean
    isActive?: boolean
  }
  ```
- **Response**: `Product`
- **Status**: ✅ Implemented in `productsApi.ts`

### PUT `/products/:id`
- **Description**: Update a product (Admin only)
- **Body**: Partial `CreateProductRequest`
- **Response**: `Product`
- **Status**: ✅ Implemented in `productsApi.ts`

### DELETE `/products/:id`
- **Description**: Delete a product (Admin only)
- **Response**: `void`
- **Status**: ✅ Implemented in `productsApi.ts`

---

## 4. Orders Management APIs

### GET `/orders/admin`
- **Description**: Get all orders (Admin view with filters)
- **Query Params**: 
  - `page?: number`
  - `limit?: number`
  - `status?: string` (pending, processing, shipped, delivered, cancelled)
- **Response**: `PaginatedResponse<Order>`
- **Status**: ✅ Implemented in `ordersApi.ts`

### GET `/orders/:id`
- **Description**: Get order details by ID
- **Response**: `Order`
- **Status**: ✅ Implemented in `ordersApi.ts`

### PUT `/orders/:id/status`
- **Description**: Update order status (Admin only)
- **Body**: 
  ```typescript
  {
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    trackingNumber?: string
  }
  ```
- **Response**: `Order`
- **Status**: ✅ Implemented in `ordersApi.ts`

### Additional Order APIs (Recommended)
- **GET `/orders/admin/stats`** - Get order statistics
- **GET `/orders/admin/export`** - Export orders to CSV/Excel
- **PUT `/orders/:id/refund`** - Process refund for an order

---

## 5. Coupons Management APIs

### GET `/coupons`
- **Description**: Get all coupons
- **Query Params**: 
  - `includeInactive?: boolean`
- **Response**: `Coupon[]`
- **Status**: ✅ Implemented in `couponsApi.ts`

### GET `/coupons/:id`
- **Description**: Get coupon by ID
- **Response**: `Coupon`
- **Status**: ✅ Implemented in `couponsApi.ts`

### POST `/coupons`
- **Description**: Create a new coupon (Admin only)
- **Body**: 
  ```typescript
  {
    code: string
    description?: string
    type: 'fixed' | 'percentage'
    value: number
    minPurchase?: number
    expiresAt?: string
    usageLimit?: number
  }
  ```
- **Response**: `Coupon`
- **Status**: ✅ Implemented in `couponsApi.ts`

### PUT `/coupons/:id`
- **Description**: Update a coupon (Admin only)
- **Body**: Partial `CreateCouponRequest`
- **Response**: `Coupon`
- **Status**: ✅ Implemented in `couponsApi.ts`

### DELETE `/coupons/:id`
- **Description**: Delete a coupon (Admin only)
- **Response**: `void`
- **Status**: ✅ Implemented in `couponsApi.ts`

---

## 6. Banners Management APIs

### GET `/admin/banners`
- **Description**: Get all banners
- **Response**: `Banner[]`
- **Status**: ✅ Implemented in `adminApi.ts`

### POST `/admin/banners`
- **Description**: Create a new banner
- **Body**: 
  ```typescript
  {
    title: string
    image: string
    link?: string
    position: string
    active: boolean
    startDate?: string
    endDate?: string
  }
  ```
- **Response**: `Banner`
- **Status**: ✅ Implemented in `adminApi.ts`

### PATCH `/admin/banners/:id`
- **Description**: Update a banner
- **Body**: Partial `Banner`
- **Response**: `Banner`
- **Status**: ✅ Implemented in `adminApi.ts`

### DELETE `/admin/banners/:id`
- **Description**: Delete a banner
- **Response**: `void`
- **Status**: ✅ Implemented in `adminApi.ts`

---

## 7. Categories Management APIs

### GET `/categories`
- **Description**: Get all categories
- **Query Params**: 
  - `includeInactive?: boolean`
- **Response**: `Category[]`
- **Status**: ✅ Implemented in `categoriesApi.ts`

### GET `/categories/:id`
- **Description**: Get category by ID
- **Response**: `Category`
- **Status**: ✅ Implemented in `categoriesApi.ts`

### POST `/categories`
- **Description**: Create a new category (Admin only)
- **Body**: 
  ```typescript
  {
    name: string
    description?: string
    slug: string
    image?: string
    isActive?: boolean
  }
  ```
- **Response**: `Category`
- **Status**: ✅ Implemented in `categoriesApi.ts`

### PUT `/categories/:id`
- **Description**: Update a category (Admin only)
- **Body**: Partial `CreateCategoryRequest`
- **Response**: `Category`
- **Status**: ✅ Implemented in `categoriesApi.ts`

### DELETE `/categories/:id`
- **Description**: Delete a category (Admin only)
- **Response**: `void`
- **Status**: ✅ Implemented in `categoriesApi.ts`

---

## 8. Analytics APIs

### GET `/analytics/revenue`
- **Description**: Get revenue statistics
- **Query Params**: 
  - `startDate?: string`
  - `endDate?: string`
- **Response**: Revenue stats object
- **Status**: ✅ Implemented in `analyticsApi.ts`

### GET `/analytics/daily-revenue`
- **Description**: Get daily revenue data
- **Query Params**: 
  - `days?: number`
- **Response**: Daily revenue array
- **Status**: ✅ Implemented in `analyticsApi.ts`

### GET `/analytics/monthly-sales`
- **Description**: Get monthly sales data
- **Query Params**: 
  - `months?: number`
- **Response**: Monthly sales array
- **Status**: ✅ Implemented in `analyticsApi.ts`

### GET `/analytics/best-selling`
- **Description**: Get best selling products
- **Query Params**: 
  - `limit?: number`
- **Response**: Best selling products array
- **Status**: ✅ Implemented in `analyticsApi.ts`

### GET `/analytics/user-growth`
- **Description**: Get user growth data
- **Query Params**: 
  - `days?: number`
- **Response**: User growth array
- **Status**: ✅ Implemented in `analyticsApi.ts`

### GET `/analytics/top-categories`
- **Description**: Get top categories by sales
- **Query Params**: 
  - `limit?: number`
- **Response**: Top categories array
- **Status**: ✅ Implemented in `analyticsApi.ts`

---

## 9. Additional Recommended Admin APIs

### Reviews Management
- **GET `/admin/reviews`** - Get all reviews with filters
- **PUT `/admin/reviews/:id/status`** - Approve/reject review
- **DELETE `/admin/reviews/:id`** - Delete review

### Inventory Management
- **GET `/admin/inventory`** - Get inventory status
- **PUT `/admin/products/:id/stock`** - Update product stock
- **GET `/admin/inventory/low-stock`** - Get low stock alerts

### Reports & Exports
- **GET `/admin/reports/sales`** - Generate sales report
- **GET `/admin/reports/products`** - Generate products report
- **GET `/admin/reports/users`** - Generate users report
- **GET `/admin/export/orders`** - Export orders to CSV/Excel
- **GET `/admin/export/products`** - Export products to CSV/Excel

### Settings
- **GET `/admin/settings`** - Get admin settings
- **PUT `/admin/settings`** - Update admin settings
- **GET `/admin/settings/payment`** - Get payment settings
- **PUT `/admin/settings/payment`** - Update payment settings
- **GET `/admin/settings/shipping`** - Get shipping settings
- **PUT `/admin/settings/shipping`** - Update shipping settings

### Notifications
- **GET `/admin/notifications`** - Get admin notifications
- **PUT `/admin/notifications/:id/read`** - Mark notification as read
- **DELETE `/admin/notifications/:id`** - Delete notification

---

## Summary

### ✅ Currently Implemented (Frontend Ready)
- Dashboard APIs (stats, revenue)
- Users Management (list, update status, delete)
- Products Management (CRUD)
- Orders Management (list, update status)
- Coupons Management (CRUD)
- Banners Management (CRUD)
- Categories Management (CRUD)
- Analytics APIs (revenue, sales, best sellers, user growth, top categories)

### ⚠️ Missing/Recommended
- User detail/update endpoints
- Order export functionality
- Reviews management
- Inventory management
- Reports generation
- Settings management
- Notifications system

---

## Notes

1. All Admin APIs should require authentication and admin role verification
2. Pagination should be consistent across all list endpoints
3. Error responses should follow a standard format
4. Consider rate limiting for admin endpoints
5. All admin endpoints should be prefixed with `/admin` or require admin role check

