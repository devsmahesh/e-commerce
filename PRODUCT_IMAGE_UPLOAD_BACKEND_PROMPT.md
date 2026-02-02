# Backend Update Prompt: Product Image Upload Functionality

## Overview
The frontend has been updated to support **Product Image Upload** functionality for the Ghee E-commerce Platform. The backend needs to implement an API endpoint to handle image file uploads for products, allowing administrators to upload product images directly from their devices or provide image URLs. Products can have multiple images.

---

## 1. Image Upload Endpoint

### 1.1 POST `/api/v1/products/upload-image`

Upload a product image file and return the URL where the image is stored.

**Authentication:** Required (Admin only - Bearer token)

**Request Format:**
- Content-Type: `multipart/form-data`
- Body: FormData with field name `image` containing the image file

**File Validation:**
- **Allowed file types:** `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
- **Maximum file size:** 5MB (5 * 1024 * 1024 bytes)
- **File field name:** `image`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "uploads/products/product-image-1234567890.jpg"
  }
}
```

**⚠️ CRITICAL: DO NOT INCLUDE FULL URLs WITH LOCALHOST ⚠️**

**WRONG (DO NOT DO THIS):**
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3000/uploads/products/image.jpg"  // ❌ WRONG
  }
}
```

**CORRECT (DO THIS):**
```json
{
  "success": true,
  "data": {
    "url": "uploads/products/image.jpg"  // ✅ CORRECT - Relative path only
  }
}
```

**IMPORTANT FOR LOCAL FILE STORAGE:** 
- Return ONLY the relative path (e.g., `uploads/products/image.jpg`)
- DO NOT include `http://localhost:3000` or `http://localhost:8000`
- DO NOT include any protocol or hostname
- The frontend will automatically construct the full URL based on the API base URL

**NOTE FOR CLOUD STORAGE:** If using Cloudinary, S3, or other cloud storage, you can return the full CDN URL as those are external URLs and don't contain localhost.

**Alternative Response Format (if using nested structure):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "url": "uploads/products/product-image-1234567890.jpg"
}
```

**Error Responses:**

**400 Bad Request - Invalid file type:**
```json
{
  "success": false,
  "message": "Invalid file type. Only image files (JPG, PNG, GIF, WebP) are allowed.",
  "statusCode": 400
}
```

**400 Bad Request - File too large:**
```json
{
  "success": false,
  "message": "File size exceeds maximum limit of 5MB.",
  "statusCode": 400
}
```

**400 Bad Request - No file provided:**
```json
{
  "success": false,
  "message": "No image file provided.",
  "statusCode": 400
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized. Admin access required.",
  "statusCode": 401
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to upload image. Please try again.",
  "statusCode": 500
}
```

---

## 2. Implementation Requirements

### 2.1 File Storage Options

You can implement file storage using one of the following approaches:

#### Option A: Local File System (Development/Simple Setup)
- Store files in a `public/uploads/products/` directory
- Generate unique filenames (e.g., `product-{timestamp}-{random}.jpg`)
- Return relative path: `uploads/products/{filename}` (frontend will construct full URL)

#### Option B: Cloud Storage (Production Recommended)
- **AWS S3:** Use `aws-sdk` or `@aws-sdk/client-s3`
- **Cloudinary:** Use `cloudinary` package
- **Google Cloud Storage:** Use `@google-cloud/storage`
- **Azure Blob Storage:** Use `@azure/storage-blob`

**Recommended: Cloudinary or AWS S3 for production**

### 2.2 File Processing

1. **Validate file type** - Check MIME type matches allowed image types
2. **Validate file size** - Ensure file is within 5MB limit
3. **Generate unique filename** - Prevent filename conflicts
4. **Optional: Image optimization** - Resize/compress images for better performance
5. **Store file** - Save to chosen storage solution
6. **Return URL** - Provide accessible URL for the uploaded image

### 2.3 Security Considerations

1. **Admin Authentication:** Ensure only authenticated admin users can upload
2. **File Type Validation:** Strictly validate MIME types (don't rely on file extensions)
3. **File Size Limits:** Enforce 5MB maximum
4. **Filename Sanitization:** Remove special characters, prevent path traversal
5. **Virus Scanning (Optional):** Consider scanning uploaded files
6. **Rate Limiting:** Implement rate limiting to prevent abuse

### 2.4 Image Optimization (Optional but Recommended)

Consider implementing image optimization:
- **Resize:** Resize large images to reasonable dimensions (e.g., max 1920x1080)
- **Compress:** Reduce file size while maintaining quality
- **Format Conversion:** Convert to WebP for better compression (with fallback)
- **Thumbnail Generation:** Create thumbnails for product listings and galleries

---

## 3. Example Implementation (Node.js/Express with Multer)

### 3.1 Using Multer for File Upload

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Route handler
router.post('/products/upload-image',
  authenticateAdmin, // Your admin authentication middleware
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided.',
          statusCode: 400
        });
      }

      // ⚠️ CRITICAL: Return ONLY the relative path, NOT the full URL
      // DO NOT use: `${req.protocol}://${req.get('host')}/uploads/...`
      // DO NOT use: `http://localhost:3000/uploads/...`
      // DO NOT use: `http://localhost:8000/uploads/...`
      // 
      // Frontend will construct the full URL based on the API base URL
      // Return format: "uploads/products/product-123.jpg" (relative path only)
      const relativePath = `uploads/products/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: relativePath  // ✅ CORRECT: "uploads/products/product-123.jpg"
        }
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image. Please try again.',
        statusCode: 500
      });
    }
  }
);
```

### 3.2 Using Cloudinary (Recommended for Production)

```javascript
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

// Route handler
router.post('/products/upload-image',
  authenticateAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided.',
          statusCode: 400
        });
      }

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: req.file.path // Cloudinary provides the URL in req.file.path
        }
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image. Please try again.',
        statusCode: 500
      });
    }
  }
);
```

### 3.3 Using AWS S3

```javascript
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer with S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `products/product-${uniqueSuffix}${ext}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

// Route handler
router.post('/products/upload-image',
  authenticateAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided.',
          statusCode: 400
        });
      }

      // NOTE: AWS S3 returns full URLs (e.g., https://bucket.s3.region.amazonaws.com/...)
      // These are external URLs, so return them as-is
      // For LOCAL file storage, return relative path: "uploads/products/image.jpg"
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: req.file.location // S3 provides full URL
        }
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image. Please try again.',
        statusCode: 500
      });
    }
  }
);
```

---

## 4. Frontend Integration

The frontend is already configured to call this endpoint:

**API Endpoint:** `POST /api/v1/products/upload-image`

**Request:**
- Method: POST
- Headers: 
  - `Authorization: Bearer {token}` (Admin token required)
  - Content-Type: `multipart/form-data` (automatically set by FormData)
- Body: FormData with field `image` containing the file

**Expected Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://your-storage.com/products/image.jpg"
  }
}
```

**Frontend Behavior:**
- Users can choose between uploading files or providing URLs
- Multiple images can be uploaded (files are uploaded one by one)
- Uploaded image URLs are added to the product's images array
- The frontend handles both file uploads and URL inputs, combining them into a single images array before creating the product

---

## 5. Testing Checklist

- [ ] Upload valid image file (JPG, PNG, GIF, WebP) - should succeed
- [ ] Upload file larger than 5MB - should return 400 error
- [ ] Upload non-image file (e.g., PDF, TXT) - should return 400 error
- [ ] Upload without authentication - should return 401 error
- [ ] Upload with non-admin user - should return 403 error (if applicable)
- [ ] Upload with missing file - should return 400 error
- [ ] Verify uploaded image is accessible via returned URL
- [ ] Test with different image formats (JPG, PNG, GIF, WebP)
- [ ] Verify unique filenames are generated (no conflicts)
- [ ] Test concurrent uploads (multiple requests at once)
- [ ] Test uploading multiple images for a single product
- [ ] Verify images work correctly when creating/updating products

---

## 6. Environment Variables (if using cloud storage)

Add these to your `.env` file:

**For Cloudinary:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**For AWS S3:**
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET_NAME=your_bucket_name
```

---

## 7. Notes

1. **Existing Product Image URL Support:** The existing product creation/update endpoints that accept image URLs should continue to work. This upload endpoint is an additional feature.

2. **Multiple Images:** Products can have multiple images. The frontend will upload files one by one and combine the URLs with any manually entered URLs.

3. **Image URL Format:** The returned URL should be a full, accessible URL (not a relative path) that can be used directly in the frontend.

4. **CORS Configuration:** If using cloud storage, ensure CORS is properly configured to allow image access from your frontend domain.

5. **Error Handling:** Provide clear, user-friendly error messages for all failure scenarios.

6. **Logging:** Log all upload attempts (successful and failed) for debugging and monitoring purposes.

7. **Product Image Array:** When creating or updating products, the `images` field accepts an array of image URLs. The frontend will combine uploaded file URLs with manually entered URLs into this array.

---

## 8. Dependencies (if needed)

Install required packages based on your chosen storage solution:

**For Multer (file upload handling):**
```bash
npm install multer
```

**For Cloudinary:**
```bash
npm install cloudinary multer-storage-cloudinary
```

**For AWS S3:**
```bash
npm install aws-sdk multer-s3
```

**For image processing (optional):**
```bash
npm install sharp
```

---

## Summary

Implement a secure, admin-only image upload endpoint at `/api/v1/products/upload-image` that:
- Accepts image files via multipart/form-data
- Validates file type (JPG, PNG, GIF, WebP) and size (max 5MB)
- Stores the file in your chosen storage solution
- Returns the accessible URL of the uploaded image
- Handles errors gracefully with appropriate status codes and messages

The frontend is ready to use this endpoint once it's implemented on the backend. Administrators can upload product images directly from their devices or provide image URLs, and the system supports multiple images per product.

