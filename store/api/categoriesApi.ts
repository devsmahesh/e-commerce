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
      providesTags: ['Category'],
    }),

    // Get Category by ID
    getCategoryById: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Get Category by Slug
    getCategoryBySlug: builder.query<Category, string>({
      query: (slug) => `/categories/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Category', id: slug }],
    }),

    // Create Category (Admin)
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    // Update Category (Admin)
    updateCategory: builder.mutation<Category, { id: string; data: UpdateCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
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
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi

