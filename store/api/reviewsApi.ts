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

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Reviews
    getReviews: builder.query<PaginatedResponse<Review>, GetReviewsParams>({
      query: (params) => ({
        url: '/reviews',
        params,
      }),
      providesTags: ['Review'],
    }),

    // Get Review by ID
    getReview: builder.query<Review, string>({
      query: (id) => `/reviews/${id}`,
      providesTags: (result, error, id) => [{ type: 'Review', id }],
    }),

    // Create Review
    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
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
  useApproveReviewMutation,
  useRejectReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi

