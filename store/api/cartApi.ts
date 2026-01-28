import { baseApi } from './baseApi'
import { Cart } from '@/types'

interface AddToCartRequest {
  productId: string
  quantity: number
}

interface UpdateCartItemRequest {
  quantity: number
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Cart
    getCart: builder.query<Cart, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    // Add to Cart
    addToCart: builder.mutation<Cart, AddToCartRequest>({
      query: (data) => ({
        url: '/cart/items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    // Update Cart Item
    updateCartItem: builder.mutation<Cart, { productId: string; data: UpdateCartItemRequest }>({
      query: ({ productId, data }) => ({
        url: `/cart/items/${productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    // Remove from Cart
    removeCartItem: builder.mutation<Cart, string>({
      query: (productId) => ({
        url: `/cart/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Clear Cart
    clearCart: builder.mutation<Cart, void>({
      query: () => ({
        url: '/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
})

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi

