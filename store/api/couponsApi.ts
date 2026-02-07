import { baseApi } from './baseApi'
import { Coupon } from '@/types'

interface GetCouponsParams {
  includeInactive?: boolean
}

interface CreateCouponRequest {
  code: string
  description: string
  type: 'fixed' | 'percentage'
  value: number
  minPurchase?: number
  maxDiscount?: number
  expiresAt?: string
  usageLimit?: number
  active?: boolean
}

interface UpdateCouponRequest extends Partial<CreateCouponRequest> {}

export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Coupons
    getCoupons: builder.query<Coupon[], GetCouponsParams>({
      query: (params) => ({
        url: '/coupons',
        params,
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: Coupon[] } | Coupon[]) => {
        // Handle wrapped response structure: { success, message, data: [...] }
        const transformCoupon = (coupon: any) => {
          const { _id, isActive, usageCount, ...rest } = coupon
          return {
            ...rest,
            id: _id || coupon.id,
            active: coupon.active !== undefined ? coupon.active : (isActive !== undefined ? isActive : true),
            usedCount: coupon.usedCount !== undefined ? coupon.usedCount : (usageCount !== undefined ? usageCount : 0),
            isExpired: coupon.isExpired !== undefined ? coupon.isExpired : false,
          }
        }
        
        if (Array.isArray(response)) {
          return response.map(transformCoupon)
        }
        const coupons = response.data || response
        return Array.isArray(coupons)
          ? coupons.map(transformCoupon)
          : []
      },
      providesTags: ['Coupon'],
    }),

    // Get Coupon by ID
    getCouponById: builder.query<Coupon, string>({
      query: (id) => `/coupons/${id}`,
      transformResponse: (response: { success?: boolean; message?: string; data?: Coupon } | Coupon) => {
        const coupon = (response as any).data || response
        const { _id, isActive, usageCount, ...rest } = coupon
        return {
          ...rest,
          id: _id || coupon.id,
          active: coupon.active !== undefined ? coupon.active : (isActive !== undefined ? isActive : true),
          usedCount: coupon.usedCount !== undefined ? coupon.usedCount : (usageCount !== undefined ? usageCount : 0),
          isExpired: coupon.isExpired !== undefined ? coupon.isExpired : false,
        } as Coupon
      },
      providesTags: (result, error, id) => [{ type: 'Coupon', id }],
    }),

    // Get Coupon by Code
    getCouponByCode: builder.query<Coupon, string>({
      query: (code) => `/coupons/code/${code}`,
      transformResponse: (response: { success?: boolean; message?: string; data?: Coupon } | Coupon) => {
        const coupon = (response as any).data || response
        const { _id, isActive, usageCount, ...rest } = coupon
        return {
          ...rest,
          id: _id || coupon.id,
          active: coupon.active !== undefined ? coupon.active : (isActive !== undefined ? isActive : true),
          usedCount: coupon.usedCount !== undefined ? coupon.usedCount : (usageCount !== undefined ? usageCount : 0),
          isExpired: coupon.isExpired !== undefined ? coupon.isExpired : false,
        } as Coupon
      },
      providesTags: (result, error, code) => [{ type: 'Coupon', id: code }],
    }),

    // Create Coupon (Admin)
    createCoupon: builder.mutation<Coupon, CreateCouponRequest>({
      query: (data) => ({
        url: '/coupons',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: Coupon } | Coupon) => {
        const coupon = (response as any).data || response
        const { _id, isActive, usageCount, ...rest } = coupon
        return {
          ...rest,
          id: _id || coupon.id,
          active: coupon.active !== undefined ? coupon.active : (isActive !== undefined ? isActive : true),
          usedCount: coupon.usedCount !== undefined ? coupon.usedCount : (usageCount !== undefined ? usageCount : 0),
          isExpired: coupon.isExpired !== undefined ? coupon.isExpired : false,
        } as Coupon
      },
      invalidatesTags: ['Coupon'],
    }),

    // Update Coupon (Admin)
    updateCoupon: builder.mutation<Coupon, { id: string; data: UpdateCouponRequest }>({
      query: ({ id, data }) => ({
        url: `/coupons/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { success?: boolean; message?: string; data?: Coupon } | Coupon) => {
        const coupon = (response as any).data || response
        const { _id, isActive, usageCount, ...rest } = coupon
        return {
          ...rest,
          id: _id || coupon.id,
          active: coupon.active !== undefined ? coupon.active : (isActive !== undefined ? isActive : true),
          usedCount: coupon.usedCount !== undefined ? coupon.usedCount : (usageCount !== undefined ? usageCount : 0),
          isExpired: coupon.isExpired !== undefined ? coupon.isExpired : false,
        } as Coupon
      },
      invalidatesTags: ['Coupon'],
    }),

    // Delete Coupon (Admin)
    deleteCoupon: builder.mutation<void, string>({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),
  }),
})

export const {
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useGetCouponByCodeQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi

