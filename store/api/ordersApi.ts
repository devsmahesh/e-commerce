import { baseApi } from './baseApi'
import { Order, PaginatedResponse } from '@/types'

interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface CreateOrderRequest {
  shippingAddress: ShippingAddress
  couponId?: string
  shippingCost?: number
}

interface UpdateOrderStatusRequest {
  status: Order['status']
  trackingNumber?: string
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Order
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    // Get User Orders
    getOrders: builder.query<PaginatedResponse<Order>, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: ['Order'],
    }),

    // Get All Orders (Admin)
    getAllOrders: builder.query<PaginatedResponse<Order>, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({
        url: '/orders/admin',
        params,
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response structure: { success, message, data: { items, meta } }
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
        
        // Transform orders: _id to id, ensure proper structure
        const transformedItems = items.map((order: any) => ({
          ...order,
          id: order._id || order.id,
          // Ensure customer object has id
          customer: order.customer ? {
            ...order.customer,
            id: order.customer._id || order.customer.id,
          } : order.customer,
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
      providesTags: ['Order'],
    }),

    // Get Order by ID
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Get Order by Order Number
    getOrderByOrderNumber: builder.query<Order, string>({
      query: (orderNumber) => `/orders/order-number/${orderNumber}`,
      providesTags: (result, error, orderNumber) => [{ type: 'Order', id: orderNumber }],
    }),

    // Update Order Status (Admin)
    updateOrderStatus: builder.mutation<Order, { id: string; data: UpdateOrderStatusRequest }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),

    // Cancel Order
    cancelOrder: builder.mutation<Order, string>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderQuery,
  useGetOrderByOrderNumberQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = ordersApi

