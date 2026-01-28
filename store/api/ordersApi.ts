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
  }),
})

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderQuery,
  useGetOrderByOrderNumberQuery,
  useUpdateOrderStatusMutation,
} = ordersApi

