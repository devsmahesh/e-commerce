import { baseApi } from './baseApi'
import { Banner } from '@/types'

interface GetBannersParams {
  position?: 'hero' | 'sidebar' | 'footer'
  active?: boolean
}

export const bannersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Public Banners (for frontend display)
    getPublicBanners: builder.query<Banner[], GetBannersParams | void>({
      query: (params) => ({
        url: '/banners',
        params: params || {},
      }),
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
  }),
})

export const { useGetPublicBannersQuery } = bannersApi

