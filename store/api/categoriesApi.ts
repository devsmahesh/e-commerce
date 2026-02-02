import { baseApi } from './baseApi'
import { Category } from '@/types'

interface CreateCategoryRequest {
  name: string
  description?: string
  slug: string
  image?: string
  isActive?: boolean
}

interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Categories
    getCategories: builder.query<Category[], { includeInactive?: boolean }>({
      query: (params) => ({
        url: '/categories',
        params,
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: Category[] } | Category[]) => {
        // Handle wrapped response structure: { success, message, data: [...] }
        if (Array.isArray(response)) {
          return response.map((category: any) => ({
            ...category,
            id: category._id || category.id,
          }))
        }
        const categories = response.data || response
        return Array.isArray(categories)
          ? categories.map((category: any) => ({
              ...category,
              id: category._id || category.id,
            }))
          : []
      },
      providesTags: ['Category'],
    }),

    // Get Category by ID
    getCategoryById: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      transformResponse: (response: { success?: boolean; message?: string; data?: Category } | Category) => {
        const category = (response as any).data || response
        return {
          ...category,
          id: category._id || category.id,
        } as Category
      },
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Get Category by Slug
    getCategoryBySlug: builder.query<Category, string>({
      query: (slug) => `/categories/slug/${slug}`,
      transformResponse: (response: { success?: boolean; message?: string; data?: Category } | Category) => {
        const category = (response as any).data || response
        return {
          ...category,
          id: category._id || category.id,
        } as Category
      },
      providesTags: (result, error, slug) => [{ type: 'Category', id: slug }],
    }),

    // Create Category (Admin)
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: Category } | Category) => {
        const category = (response as any).data || response
        return {
          ...category,
          id: category._id || category.id,
        } as Category
      },
      invalidatesTags: ['Category'],
    }),

    // Update Category (Admin)
    updateCategory: builder.mutation<Category, { id: string; data: UpdateCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: Category } | Category) => {
        const category = (response as any).data || response
        return {
          ...category,
          id: category._id || category.id,
        } as Category
      },
      invalidatesTags: ['Category'],
    }),

    // Delete Category (Admin)
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Upload Category Image (Admin)
    uploadCategoryImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/categories/upload-image',
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
        // Backend returns: "uploads/categories/image.jpg"
        // We need to construct: "http://localhost:8000/uploads/categories/image.jpg"
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
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation,
} = categoriesApi

