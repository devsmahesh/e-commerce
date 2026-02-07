import { baseApi } from './baseApi'
import { FlashDeal } from '@/types'

interface GetFlashDealsParams {
  active?: boolean
  limit?: number
  type?: 'discount' | 'shipping' | 'new_arrival' | 'custom'
}

interface CreateFlashDealRequest {
  title: string
  description: string
  type: 'discount' | 'shipping' | 'new_arrival' | 'custom'
  discountPercentage?: number
  minPurchaseAmount?: number
  link?: string
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
  active?: boolean
  startDate: string
  endDate: string
  priority?: number
}

interface UpdateFlashDealRequest extends Partial<CreateFlashDealRequest> {}

export const flashDealsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Active Flash Deals (Public - for frontend display)
    getActiveFlashDeals: builder.query<FlashDeal[], GetFlashDealsParams | void>({
      query: (params) => ({
        url: '/flash-deals',
        params: {
          active: true,
          ...params,
        },
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: FlashDeal[] } | FlashDeal[]) => {
        // Handle wrapped response structure: { success, message, data: [...] }
        if (Array.isArray(response)) {
          return response
            .map((deal: any) => ({
              ...deal,
              id: deal._id || deal.id,
            }))
            .sort((a, b) => (b.priority || 0) - (a.priority || 0)) // Sort by priority (highest first)
        }
        const deals = response.data || response
        return Array.isArray(deals)
          ? deals
              .map((deal: any) => ({
                ...deal,
                id: deal._id || deal.id,
              }))
              .sort((a, b) => (b.priority || 0) - (a.priority || 0))
          : []
      },
      providesTags: ['FlashDeal'],
    }),

    // Get All Flash Deals (Admin)
    getAllFlashDeals: builder.query<FlashDeal[], GetFlashDealsParams | void>({
      query: (params) => ({
        url: '/flash-deals/all',
        params: params || {},
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: FlashDeal[] } | FlashDeal[]) => {
        if (Array.isArray(response)) {
          return response.map((deal: any) => ({
            ...deal,
            id: deal._id || deal.id,
          }))
        }
        const deals = response.data || response
        return Array.isArray(deals)
          ? deals.map((deal: any) => ({
              ...deal,
              id: deal._id || deal.id,
            }))
          : []
      },
      providesTags: ['FlashDeal'],
    }),

    // Get Flash Deal by ID
    getFlashDealById: builder.query<FlashDeal, string>({
      query: (id) => `/flash-deals/${id}`,
      transformResponse: (response: any) => {
        const dealData = response.data || response
        return {
          ...dealData,
          id: dealData._id || dealData.id,
        } as FlashDeal
      },
      providesTags: (result, error, id) => [{ type: 'FlashDeal', id }],
    }),

    // Create Flash Deal (Admin)
    createFlashDeal: builder.mutation<FlashDeal, CreateFlashDealRequest>({
      query: (data) => ({
        url: '/flash-deals',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FlashDeal'],
    }),

    // Update Flash Deal (Admin)
    updateFlashDeal: builder.mutation<FlashDeal, { id: string; data: UpdateFlashDealRequest }>({
      query: ({ id, data }) => ({
        url: `/flash-deals/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['FlashDeal'],
    }),

    // Delete Flash Deal (Admin)
    deleteFlashDeal: builder.mutation<void, string>({
      query: (id) => ({
        url: `/flash-deals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FlashDeal'],
    }),
  }),
})

export const {
  useGetActiveFlashDealsQuery,
  useGetAllFlashDealsQuery,
  useGetFlashDealByIdQuery,
  useCreateFlashDealMutation,
  useUpdateFlashDealMutation,
  useDeleteFlashDealMutation,
} = flashDealsApi

