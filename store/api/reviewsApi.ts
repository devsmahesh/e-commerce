import { baseApi } from './baseApi'
import { Review, PaginatedResponse } from '@/types'

interface GetReviewsParams {
  productId?: string
  approvedOnly?: boolean
  page?: number
  limit?: number
}

interface CreateReviewRequest {
  productId: string
  rating: number
  comment: string
}

interface UpdateReviewRequest {
  rating?: number
  comment?: string
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Reviews
    getReviews: builder.query<PaginatedResponse<Review>, GetReviewsParams>({
      query: (params) => ({
        url: '/reviews',
        params,
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response structure: { success, message, data: { items, meta } }
        if (response.error || (response.success === false)) {
          throw response
        }
        
        const responseData = response.data || response
        const items = responseData.items || responseData.data || []
        
        // Transform reviews: _id to id, userId object to user (preserve userId for comparison)
        const transformedItems = items.map((item: any) => ({
          ...item,
          id: item._id || item.id,
          userId: item.userId?._id || item.userId?.id || item.userId || '',
          status: item.status || 'approved', // Default to approved if not specified
          user: item.userId && typeof item.userId === 'object' 
            ? {
                name: item.userId.firstName && item.userId.lastName
                  ? `${item.userId.firstName} ${item.userId.lastName}`
                  : item.userId.name || item.userId.email || 'Anonymous',
                avatar: item.userId.avatar,
              }
            : item.user || { name: 'Anonymous' },
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
      providesTags: ['Review'],
    }),

    // Get Review by ID
    getReview: builder.query<Review, string>({
      query: (id) => `/reviews/${id}`,
      transformResponse: (response: any) => {
        const reviewData = response.data || response
        return {
          ...reviewData,
          id: reviewData._id || reviewData.id,
          userId: reviewData.userId?._id || reviewData.userId?.id || reviewData.userId || '',
          status: reviewData.status || 'approved',
          user: reviewData.userId && typeof reviewData.userId === 'object' 
            ? {
                name: reviewData.userId.firstName && reviewData.userId.lastName
                  ? `${reviewData.userId.firstName} ${reviewData.userId.lastName}`
                  : reviewData.userId.name || reviewData.userId.email || 'Anonymous',
                avatar: reviewData.userId.avatar,
              }
            : reviewData.user || { name: 'Anonymous' },
        } as Review
      },
      providesTags: (result, error, id) => [{ type: 'Review', id }],
    }),

    // Create Review
    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => {
        const reviewData = response.data || response
        return {
          ...reviewData,
          id: reviewData._id || reviewData.id,
          userId: reviewData.userId?._id || reviewData.userId?.id || reviewData.userId || '',
          status: reviewData.status || 'pending',
          user: reviewData.userId && typeof reviewData.userId === 'object' 
            ? {
                name: reviewData.userId.firstName && reviewData.userId.lastName
                  ? `${reviewData.userId.firstName} ${reviewData.userId.lastName}`
                  : reviewData.userId.name || reviewData.userId.email || 'Anonymous',
                avatar: reviewData.userId.avatar,
              }
            : reviewData.user || { name: 'Anonymous' },
        } as Review
      },
      invalidatesTags: ['Review', 'Product'],
    }),

    // Approve Review (Admin)
    approveReview: builder.mutation<Review, string>({
      query: (id) => ({
        url: `/reviews/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Review', 'Product'],
    }),

    // Reject Review (Admin)
    rejectReview: builder.mutation<Review, string>({
      query: (id) => ({
        url: `/reviews/${id}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['Review', 'Product'],
    }),

    // Update Review
    updateReview: builder.mutation<Review, { id: string; data: UpdateReviewRequest }>({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: any) => {
        const reviewData = response.data || response
        return {
          ...reviewData,
          id: reviewData._id || reviewData.id,
          userId: reviewData.userId?._id || reviewData.userId?.id || reviewData.userId || '',
          status: reviewData.status || 'pending',
          user: reviewData.userId && typeof reviewData.userId === 'object' 
            ? {
                name: reviewData.userId.firstName && reviewData.userId.lastName
                  ? `${reviewData.userId.firstName} ${reviewData.userId.lastName}`
                  : reviewData.userId.name || reviewData.userId.email || 'Anonymous',
                avatar: reviewData.userId.avatar,
              }
            : reviewData.user || { name: 'Anonymous' },
        } as Review
      },
      invalidatesTags: ['Review', 'Product'],
    }),

    // Delete Review
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
  }),
})

export const {
  useGetReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useApproveReviewMutation,
  useRejectReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi

