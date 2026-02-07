import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../index'
import { tokenManager } from '@/lib/token'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // Get token from tokenManager
    const token = tokenManager.getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions)
  
  // Handle error responses
  if (result.error) {
    // Ensure error has proper structure
    if (!result.error.data) {
      result.error.data = {
        message: result.error.status === 'FETCH_ERROR' 
          ? 'Network error. Please check your connection.'
          : `Server error (${result.error.status})`,
      }
    }
  }
  
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'User',
    'Product',
    'Cart',
    'Order',
    'Category',
    'Coupon',
    'Banner',
    'Review',
    'Address',
    'Wishlist',
    'Payment',
    'Analytics',
    'Contact',
  ],
  endpoints: () => ({}),
})

