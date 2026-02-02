# Backend Update Prompt: Wishlist, Reviews, and Share Functionality

## Overview
The frontend has been updated to support **Wishlist**, **Reviews**, and **Share** functionality for the Ghee E-commerce Platform. The backend needs to implement the corresponding API endpoints and database models to support these features.

---

## 1. Wishlist Functionality

### 1.1 User Model Update

Add a `wishlist` field to the User model to store an array of product IDs:

```typescript
// User Schema/Model
{
  // ... existing fields
  wishlist: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }]
}
```

**Database Migration:**
```sql
-- For MongoDB, this is handled automatically
-- For SQL databases, create a wishlist junction table:
CREATE TABLE user_wishlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_user_wishlist_user_id ON user_wishlist(user_id);
CREATE INDEX idx_user_wishlist_product_id ON user_wishlist(product_id);
```

### 1.2 API Endpoints

#### GET `/api/v1/users/wishlist`
Get the current user's wishlist.

**Authentication:** Required (Bearer token)

**Response Format:**
```json
{
  "success": true,
  "message": "Wishlist retrieved successfully",
  "data": [
    {
      "_id": "product-id-1",
      "name": "Premium Cow Ghee",
      "slug": "premium-cow-ghee",
      "description": "Pure, authentic cow ghee...",
      "price": 599.99,
      "compareAtPrice": 699.99,
      "images": ["https://example.com/image1.jpg"],
      "categoryId": {
        "_id": "category-id",
        "name": "Cow Ghee",
        "slug": "cow-ghee"
      },
      "stock": 100,
      "rating": 4.5,
      "reviewCount": 25,
      "featured": true,
      "gheeType": "cow",
      "weight": 500,
      "purity": 99.9,
      "origin": "Punjab, India",
      "shelfLife": "12 months",
      "sku": "GHEE-COW-500",
      "brand": "Premium Ghee Co",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    // ... more products
  ]
}
```

**Implementation Notes:**
- Populate the product details (including categoryId as an object)
- Return empty array if wishlist is empty
- Handle authentication errors (401) if user is not logged in

#### POST `/api/v1/users/wishlist/:productId`
Add a product to the user's wishlist.

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `productId` (string, required): The ID of the product to add

**Response Format:**
```json
{
  "success": true,
  "message": "Product added to wishlist successfully",
  "data": {
    "_id": "product-id",
    "name": "Premium Cow Ghee",
    // ... full product object
  }
}
```

**Error Responses:**
- `400 Bad Request`: Product already in wishlist
- `404 Not Found`: Product not found
- `401 Unauthorized`: User not authenticated

**Implementation Notes:**
- Check if product exists
- Check if product is already in wishlist (idempotent - return success if already exists)
- Add product ID to user's wishlist array
- Return the full product object

#### DELETE `/api/v1/users/wishlist/:productId`
Remove a product from the user's wishlist.

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `productId` (string, required): The ID of the product to remove

**Response Format:**
```json
{
  "success": true,
  "message": "Product removed from wishlist successfully"
}
```

**Error Responses:**
- `404 Not Found`: Product not in wishlist or product doesn't exist
- `401 Unauthorized`: User not authenticated

**Implementation Notes:**
- Remove product ID from user's wishlist array
- Return success even if product wasn't in wishlist (idempotent)

---

## 2. Reviews Functionality

### 2.1 Review Model/Schema

Create a new Review model:

```typescript
// Review Schema/Model
{
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Database Migration (SQL):**
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (LENGTH(comment) <= 1000),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id) -- One review per user per product
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_product_status ON reviews(product_id, status);
```

**Additional Considerations:**
- Add a unique constraint on (userId, productId) to prevent duplicate reviews
- Update product's average rating and review count when a review is approved

### 2.2 API Endpoints

#### GET `/api/v1/reviews`
Get reviews with optional filtering.

**Query Parameters:**
- `productId` (optional, string): Filter reviews by product ID
- `approvedOnly` (optional, boolean): Only return approved reviews (default: false for admins, true for regular users)
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)

**Response Format:**
```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "items": [
      {
        "_id": "review-id",
        "productId": "product-id",
        "userId": {
          "_id": "user-id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "avatar": "https://example.com/avatar.jpg"
        },
        "rating": 5,
        "comment": "Excellent quality ghee! Highly recommended.",
        "status": "approved",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
      // ... more reviews
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Implementation Notes:**
- For regular users: Only show approved reviews by default
- For admins: Show all reviews (pending, approved, rejected) unless `approvedOnly=true`
- Populate userId with user details (firstName, lastName, email, avatar)
- Sort by createdAt descending (newest first)
- Calculate average rating and update product when reviews are fetched (if needed)

#### GET `/api/v1/reviews/:id`
Get a single review by ID.

**URL Parameters:**
- `id` (string, required): Review ID

**Response Format:**
```json
{
  "success": true,
  "message": "Review retrieved successfully",
  "data": {
    "_id": "review-id",
    "productId": "product-id",
    "userId": {
      "_id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg"
    },
    "rating": 5,
    "comment": "Excellent quality ghee! Highly recommended.",
    "status": "approved",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST `/api/v1/reviews`
Create a new review.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "productId": "product-id",
  "rating": 5,
  "comment": "Excellent quality ghee! Highly recommended."
}
```

**Validation Rules:**
- `productId`: Required, must exist in products collection
- `rating`: Required, integer between 1 and 5
- `comment`: Required, string, max 1000 characters, trimmed
- User can only submit one review per product (check for existing review)

**Response Format:**
```json
{
  "success": true,
  "message": "Review submitted successfully. It will be reviewed before being published.",
  "data": {
    "_id": "review-id",
    "productId": "product-id",
    "userId": "user-id",
    "rating": 5,
    "comment": "Excellent quality ghee! Highly recommended.",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input, duplicate review, or product doesn't exist
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Product not found

**Implementation Notes:**
- Check if user has already reviewed this product
- Set status to 'pending' by default
- Verify product exists
- Do NOT update product rating/review count until review is approved

#### POST `/api/v1/reviews/:id/approve` (Admin Only)
Approve a pending review.

**Authentication:** Required (Bearer token, Admin role)

**URL Parameters:**
- `id` (string, required): Review ID

**Response Format:**
```json
{
  "success": true,
  "message": "Review approved successfully",
  "data": {
    "_id": "review-id",
    "productId": "product-id",
    "userId": "user-id",
    "rating": 5,
    "comment": "Excellent quality ghee! Highly recommended.",
    "status": "approved",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Implementation Notes:**
- Update review status to 'approved'
- Recalculate product's average rating
- Increment product's reviewCount
- Update product document with new rating and reviewCount

**Product Rating Calculation:**
```javascript
// When a review is approved:
// 1. Get all approved reviews for the product
const approvedReviews = await Review.find({ 
  productId: productId, 
  status: 'approved' 
});

// 2. Calculate average rating
const averageRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length;

// 3. Update product
await Product.findByIdAndUpdate(productId, {
  rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
  reviewCount: approvedReviews.length
});
```

#### POST `/api/v1/reviews/:id/reject` (Admin Only)
Reject a pending review.

**Authentication:** Required (Bearer token, Admin role)

**URL Parameters:**
- `id` (string, required): Review ID

**Response Format:**
```json
{
  "success": true,
  "message": "Review rejected successfully",
  "data": {
    "_id": "review-id",
    "productId": "product-id",
    "userId": "user-id",
    "rating": 5,
    "comment": "Excellent quality ghee! Highly recommended.",
    "status": "rejected",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Implementation Notes:**
- Update review status to 'rejected'
- Do NOT update product rating/review count

#### PUT `/api/v1/reviews/:id`
Update a review (user can update their own).

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required): Review ID

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

**Validation Rules:**
- `rating`: Optional, integer between 1 and 5
- `comment`: Optional, string, max 1000 characters, trimmed
- At least one field (rating or comment) must be provided

**Response Format:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "_id": "review-id",
    "productId": "product-id",
    "userId": "user-id",
    "rating": 4,
    "comment": "Updated review comment",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User trying to update someone else's review
- `404 Not Found`: Review not found

**Implementation Notes:**
- Users can only update their own reviews
- When a review is updated, set status back to 'pending' for admin approval
- Do NOT update product rating/review count until the updated review is approved again

#### DELETE `/api/v1/reviews/:id`
Delete a review (user can delete their own, admin can delete any).

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required): Review ID

**Response Format:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Implementation Notes:**
- Users can only delete their own reviews
- Admins can delete any review
- If deleting an approved review, recalculate product rating and decrement reviewCount

---

## 3. Share Functionality

### 3.1 Overview
The share functionality is handled entirely on the frontend using the Web Share API and clipboard fallback. No backend implementation is required for basic sharing.

### 3.2 Optional: Share Analytics (Future Enhancement)

If you want to track shares for analytics purposes, you could add:

#### POST `/api/v1/products/:productId/share` (Optional)
Track product shares.

**Authentication:** Optional (can work without auth for anonymous shares)

**URL Parameters:**
- `productId` (string, required): Product ID

**Request Body:**
```json
{
  "platform": "native" | "clipboard" | "facebook" | "twitter" | "whatsapp", // Optional
  "userAgent": "Mozilla/5.0..." // Optional
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Share tracked successfully"
}
```

**Database Schema (Optional):**
```sql
CREATE TABLE product_shares (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  platform VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_shares_product_id ON product_shares(product_id);
CREATE INDEX idx_product_shares_created_at ON product_shares(created_at);
```

**Note:** This is optional and not required for the current implementation. The frontend share functionality works without any backend support.

---

## 4. Response Format Standards

All API responses should follow this format:

### Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Paginated Response:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [ /* array of items */ ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": { /* optional error details */ }
  }
}
```

---

## 5. Authentication & Authorization

### Required Middleware
- All wishlist and review endpoints (except GET reviews with approvedOnly) require authentication
- Use JWT Bearer token authentication
- Extract user ID from token payload

### Authorization Rules
- **Wishlist endpoints**: Users can only access their own wishlist
- **Review creation**: Any authenticated user can create reviews
- **Review approval/rejection**: Admin only
- **Review deletion**: Users can delete their own reviews, admins can delete any

---

## 6. Testing Checklist

### Wishlist
- [ ] Add product to wishlist (authenticated)
- [ ] Add product to wishlist (unauthenticated) - should return 401
- [ ] Add duplicate product to wishlist - should be idempotent
- [ ] Get wishlist (authenticated)
- [ ] Get wishlist (unauthenticated) - should return 401
- [ ] Remove product from wishlist
- [ ] Remove non-existent product - should be idempotent
- [ ] Get wishlist after removal - should not include removed product

### Reviews
- [ ] Create review (authenticated)
- [ ] Create review (unauthenticated) - should return 401
- [ ] Create duplicate review - should return 400
- [ ] Create review with invalid rating - should return 400
- [ ] Get reviews for a product (approved only)
- [ ] Get all reviews (admin, includes pending)
- [ ] Approve review (admin)
- [ ] Approve review (non-admin) - should return 403
- [ ] Reject review (admin)
- [ ] Delete own review (user)
- [ ] Delete any review (admin)
- [ ] Product rating updates when review is approved
- [ ] Product reviewCount updates when review is approved

---

## 7. Database Indexes

Ensure the following indexes are created for optimal performance:

```sql
-- Wishlist indexes
CREATE INDEX idx_user_wishlist_user_id ON user_wishlist(user_id);
CREATE INDEX idx_user_wishlist_product_id ON user_wishlist(product_id);

-- Review indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_product_status ON reviews(product_id, status);
CREATE UNIQUE INDEX idx_reviews_user_product ON reviews(user_id, product_id);
```

---

## 8. Additional Notes

1. **Product Rating Calculation**: When a review is approved, recalculate the product's average rating by averaging all approved reviews. Round to 1 decimal place.

2. **Review Moderation**: All reviews start as 'pending' and require admin approval before being visible to regular users.

3. **Wishlist Performance**: Consider pagination if wishlists become very large (100+ items).

4. **Review Spam Prevention**: Consider implementing rate limiting (e.g., max 5 reviews per user per day).

5. **Data Consistency**: Ensure product rating and reviewCount are always in sync with approved reviews.

6. **Caching**: Consider caching product ratings and review counts for better performance.

---

## 9. Example Implementation Flow

### Adding to Wishlist:
1. User clicks "Add to Wishlist" button
2. Frontend sends POST request to `/api/v1/users/wishlist/:productId`
3. Backend validates authentication
4. Backend checks if product exists
5. Backend adds productId to user's wishlist array (if not already present)
6. Backend returns success response with product data

### Creating a Review:
1. User fills out review form and submits
2. Frontend sends POST request to `/api/v1/reviews` with productId, rating, comment
3. Backend validates authentication
4. Backend validates input (rating 1-5, comment max 1000 chars)
5. Backend checks if user has already reviewed this product
6. Backend creates review with status 'pending'
7. Backend returns success response
8. Admin approves review later
9. Backend updates product rating and reviewCount

---

## Summary

This document outlines the backend requirements for:
1. **Wishlist**: GET, POST, DELETE endpoints for managing user wishlists
2. **Reviews**: Full CRUD operations with moderation workflow
3. **Share**: Frontend-only (no backend required, optional analytics endpoint provided)

All endpoints should follow the response format standards and include proper authentication/authorization checks.

