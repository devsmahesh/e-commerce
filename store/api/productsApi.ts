import { baseApi } from './baseApi'
import { Product, PaginatedResponse } from '@/types'

interface ProductsParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
  isFeatured?: boolean
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  // Ghee-specific filters
  gheeType?: 'cow' | 'buffalo' | 'mixed'
  minWeight?: number
  maxWeight?: number
  minPurity?: number
  origin?: string
}

interface ProductVariantRequest {
  name: string
  price: number
  compareAtPrice?: number
  stock: number
  sku?: string
  tags?: string[]
  isDefault?: boolean
}

interface ProductDetailsRequest {
  whyChooseUs?: {
    title?: string
    content: string
    enabled: boolean
  }
  keyBenefits?: {
    title?: string
    content: string
    enabled: boolean
  }
  refundPolicy?: {
    title?: string
    content: string
    enabled: boolean
  }
}

interface CreateProductRequest {
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  images: string[]
  tags?: string[]
  isFeatured?: boolean
  isActive?: boolean
  // Ghee-specific fields
  gheeType?: 'cow' | 'buffalo' | 'mixed'
  weight?: number
  purity?: number
  origin?: string
  shelfLife?: string
  compareAtPrice?: number
  sku?: string
  brand?: string
  // Variants and details
  variants?: ProductVariantRequest[]
  details?: ProductDetailsRequest
}

interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Products (with filters)
    getProducts: builder.query<PaginatedResponse<Product>, ProductsParams>({
      query: (params) => {
        // Filter out undefined, null, and empty string values
        const filteredParams: Record<string, any> = {}
        Object.entries(params || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            filteredParams[key] = value
          }
        })
        return {
          url: '/products',
          params: filteredParams,
        }
      },
      transformResponse: (response: any) => {
        // Handle wrapped response structure: { success, message, data: { items, meta } }
        // If response has an error, throw it
        if (response.error || (response.success === false)) {
          throw response
        }
        
        const responseData = response.data || response
        const items = responseData.items || responseData.data || []
        
        // Ensure items is an array
        if (!Array.isArray(items)) {
          console.error('Expected items to be an array, got:', items)
          return {
            data: [],
            meta: responseData.meta || response.meta || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
          }
        }
        
        // Transform products: _id to id, categoryId object to category, isFeatured to featured
        const transformedItems = items.map((item: any) => ({
          ...item,
          id: item._id || item.id,
          featured: item.isFeatured !== undefined ? item.isFeatured : (item.featured || false), // Map isFeatured to featured
          category: item.categoryId && typeof item.categoryId === 'object' 
            ? {
                id: item.categoryId._id || item.categoryId.id,
                name: item.categoryId.name,
                slug: item.categoryId.slug,
              }
            : item.category || { id: '', name: '', slug: '' },
        }))
        
        return {
          data: transformedItems,
          meta: responseData.meta || response.meta || {
            page: 1,
            limit: 10,
            total: transformedItems.length,
            totalPages: 1,
          },
        }
      },
      providesTags: ['Product'],
    }),

    // Get Product by ID
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: any) => {
        // Handle wrapped response structure: { success, message, data: { ...product } }
        const productData = response.data || response
        
        // Transform _id to id and categoryId object to category
        return {
          ...productData,
          id: productData._id || productData.id,
          featured: productData.isFeatured !== undefined ? productData.isFeatured : (productData.featured || false), // Map isFeatured to featured
          category: productData.categoryId && typeof productData.categoryId === 'object' 
            ? {
                id: productData.categoryId._id || productData.categoryId.id,
                name: productData.categoryId.name,
                slug: productData.categoryId.slug,
              }
            : productData.category || { id: '', name: '', slug: '' },
        } as Product
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Get Product by Slug
    getProductBySlug: builder.query<Product, string>({
      query: (slug) => `/products/slug/${slug}`,
      transformResponse: (response: any) => {
        // Handle wrapped response structure: { success, message, data: { ...product } }
        const productData = response.data || response
        
        // Transform _id to id and categoryId object to category, isFeatured to featured
        return {
          ...productData,
          id: productData._id || productData.id,
          featured: productData.isFeatured !== undefined ? productData.isFeatured : (productData.featured || false), // Map isFeatured to featured
          images: Array.isArray(productData.images) ? productData.images : (productData.images ? [productData.images] : []),
          category: productData.categoryId && typeof productData.categoryId === 'object' 
            ? {
                id: productData.categoryId._id || productData.categoryId.id,
                name: productData.categoryId.name,
                slug: productData.categoryId.slug,
              }
            : productData.category || { id: '', name: '', slug: '' },
        } as Product
      },
      providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
    }),

    // Create Product (Admin)
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    // Update Product (Admin)
    updateProduct: builder.mutation<Product, { id: string; data: UpdateProductRequest }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    // Delete Product (Admin)
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Upload Product Image (Admin)
    uploadProductImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/products/upload-image',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: any, meta, arg) => {
        // Log for debugging
        console.log('Upload response:', response)
        
        let urlPath = ''
        
        // Handle wrapped response: { success: true, message: "...", data: { url: "..." } }
        if (response?.success && response?.data?.url) {
          urlPath = response.data.url
        }
        // Handle direct data object: { data: { url } }
        else if (response?.data?.url) {
          urlPath = response.data.url
        }
        // Handle direct url: { url }
        else if (response?.url) {
          urlPath = response.url
        }
        // Handle string response
        else if (typeof response === 'string') {
          urlPath = response
        }
        
        if (!urlPath) {
          console.error('Unexpected response structure:', response)
          return { url: '' }
        }
        
        // Check if it's already a full URL (starts with http:// or https://)
        // This handles cloud storage URLs (Cloudinary, S3, etc.)
        if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
          return { url: urlPath }
        }
        
        // Otherwise, it's a relative path - convert to full URL
        // Backend returns: "uploads/products/image.jpg"
        // We need to construct: "http://localhost:8000/uploads/products/image.jpg"
        const cleanPath = urlPath.replace(/^\//, '') // Remove leading slash if present
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
        const baseUrl = apiBaseUrl.replace(/\/api\/v1$/, '')
        const fullUrl = `${baseUrl}/${cleanPath}`
        
        return { url: fullUrl }
      },
      transformErrorResponse: (response: any, meta, arg) => {
        // Log for debugging
        console.error('Upload error response:', response)
        
        // Ensure error response has proper structure
        const errorData = {
          message: response?.data?.message || response?.message || 'Failed to upload image',
          statusCode: response?.status || response?.statusCode || 500,
        }
        return errorData
      },
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
} = productsApi

