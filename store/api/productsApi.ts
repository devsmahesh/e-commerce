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
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
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
        
        // Transform products: _id to id, categoryId object to category
        const transformedItems = items.map((item: any) => ({
          ...item,
          id: item._id || item.id,
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
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi

