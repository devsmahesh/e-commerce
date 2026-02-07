import { baseApi } from './baseApi'
import { User, Banner, PaginatedResponse, Review, Product, Order } from '@/types'

interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
}

interface UpdateUserStatusRequest {
  isActive: boolean
}

interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  avatar?: string
}

interface UpdateUserRoleRequest {
  role: 'admin' | 'user'
}

interface DashboardRevenueParams {
  period?: string
}

interface GetReviewsParams {
  page?: number
  limit?: number
  productId?: string
  status?: 'pending' | 'approved' | 'rejected'
}

interface UpdateReviewStatusRequest {
  status: 'approved' | 'rejected'
}

interface UpdateStockRequest {
  stock: number
}

interface GetInventoryParams {
  page?: number
  limit?: number
  lowStock?: boolean
  categoryId?: string
}

interface ExportOrdersParams {
  startDate?: string
  endDate?: string
  status?: string
  format?: 'csv' | 'excel'
}

interface ExportProductsParams {
  format?: 'csv' | 'excel'
  categoryId?: string
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Dashboard Stats
    getDashboardStats: builder.query<any, void>({
      query: () => '/admin/dashboard',
      transformResponse: (response: { success: boolean; message: string; data: { totalRevenue: number; totalOrders: number; totalUsers: number; growthRate: number } }) => {
        return response.data || {}
      },
    }),

    // Get Dashboard Revenue
    getDashboardRevenue: builder.query<any, DashboardRevenueParams>({
      query: (params) => ({
        url: '/admin/dashboard/revenue',
        params,
      }),
    }),

    // Get All Users
    getUsers: builder.query<PaginatedResponse<User>, GetUsersParams>({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      transformResponse: (response: { success: boolean; message: string; data: { items: any[]; meta: any } }) => {
        const items = response.data?.items || []
        const meta = response.data?.meta || {}
        
        return {
          data: items.map((user: any) => ({
            ...user,
            id: user._id || user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          })),
          meta: {
            page: meta.page || 1,
            limit: meta.limit || 10,
            total: meta.total || 0,
            totalPages: meta.totalPages || 1,
          },
        }
      },
      providesTags: ['User'],
    }),

    // Update User Status
    updateUserStatus: builder.mutation<User, { userId: string; data: UpdateUserStatusRequest }>({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Delete User
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Get User by ID
    getUserById: builder.query<User, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Update User Information
    updateUser: builder.mutation<User, { userId: string; data: UpdateUserRequest }>({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Update User Role
    updateUserRole: builder.mutation<User, { userId: string; data: UpdateUserRoleRequest }>({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}/role`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Reviews Management
    getAdminReviews: builder.query<PaginatedResponse<Review>, GetReviewsParams>({
      query: (params) => ({
        url: '/admin/reviews',
        params,
      }),
      providesTags: ['Review'],
    }),

    updateReviewStatus: builder.mutation<Review, { reviewId: string; data: UpdateReviewStatusRequest }>({
      query: ({ reviewId, data }) => ({
        url: `/admin/reviews/${reviewId}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),

    deleteAdminReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'Product'],
    }),

    // Inventory Management
    getInventory: builder.query<PaginatedResponse<Product>, GetInventoryParams>({
      query: (params) => ({
        url: '/admin/inventory',
        params,
      }),
      providesTags: ['Product'],
    }),

    getLowStockProducts: builder.query<Product[], { limit?: number }>({
      query: (params) => ({
        url: '/admin/inventory/low-stock',
        params,
      }),
      providesTags: ['Product'],
    }),

    updateProductStock: builder.mutation<Product, { productId: string; data: UpdateStockRequest }>({
      query: ({ productId, data }) => ({
        url: `/admin/products/${productId}/stock`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    // Reports & Exports
    getSalesReport: builder.query<any, { startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/admin/reports/sales',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getProductsReport: builder.query<any, { categoryId?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/admin/reports/products',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getUsersReport: builder.query<any, { startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/admin/reports/users',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    exportOrders: builder.query<Blob, ExportOrdersParams>({
      query: (params) => ({
        url: '/admin/export/orders',
        params,
        responseHandler: (response: any) => response.blob(),
      }),
    }),

    exportProducts: builder.query<Blob, ExportProductsParams>({
      query: (params) => ({
        url: '/admin/export/products',
        params,
        responseHandler: (response: any) => response.blob(),
      }),
    }),

    // Banners (keeping existing banner endpoints)
    getBanners: builder.query<Banner[], void>({
      query: () => '/admin/banners',
      transformResponse: (response: { success?: boolean; message?: string; data?: Banner[] } | Banner[]) => {
        // Handle wrapped response structure: { success, message, data: [...] }
        if (Array.isArray(response)) {
          return response.map((banner: any) => ({
            ...banner,
            id: banner._id || banner.id,
          }))
        }
        const banners = response.data || response
        return Array.isArray(banners)
          ? banners.map((banner: any) => ({
              ...banner,
              id: banner._id || banner.id,
            }))
          : []
      },
      providesTags: ['Banner'],
    }),
    createBanner: builder.mutation<Banner, Omit<Banner, 'id'>>({
      query: (data) => ({
        url: '/admin/banners',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: Banner } | Banner) => {
        const banner = (response as any).data || response
        return {
          ...banner,
          id: banner._id || banner.id,
        } as Banner
      },
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation<Banner, { id: string; data: Partial<Banner> }>({
      query: ({ id, data }) => ({
        url: `/admin/banners/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: Banner } | Banner) => {
        const banner = (response as any).data || response
        return {
          ...banner,
          id: banner._id || banner.id,
        } as Banner
      },
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
    // Upload Banner Image (Admin)
    uploadBannerImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/admin/banners/upload-image',
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
        // Backend returns: "uploads/banners/image.jpg"
        // We need to construct: "http://localhost:8000/uploads/banners/image.jpg"
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
  // Dashboard
  useGetDashboardStatsQuery,
  useGetDashboardRevenueQuery,
  
  // Users Management
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  
  // Reviews Management
  useGetAdminReviewsQuery,
  useUpdateReviewStatusMutation,
  useDeleteAdminReviewMutation,
  
  // Inventory Management
  useGetInventoryQuery,
  useGetLowStockProductsQuery,
  useUpdateProductStockMutation,
  
  // Reports & Exports
  useGetSalesReportQuery,
  useGetProductsReportQuery,
  useGetUsersReportQuery,
  useExportOrdersQuery,
  useExportProductsQuery,
  
  // Banners Management
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useUploadBannerImageMutation,
} = adminApi

