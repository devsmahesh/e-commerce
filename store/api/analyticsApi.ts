import { baseApi } from './baseApi'

interface RevenueParams {
  startDate?: string
  endDate?: string
}

interface DailyRevenueParams {
  days?: number
}

interface MonthlySalesParams {
  months?: number
}

interface BestSellingParams {
  limit?: number
}

interface UserGrowthParams {
  days?: number
}

interface TopCategoriesParams {
  limit?: number
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Revenue Stats
    getRevenueStats: builder.query<any, RevenueParams>({
      query: (params) => ({
        url: '/analytics/revenue',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get Daily Revenue
    getDailyRevenue: builder.query<any, DailyRevenueParams>({
      query: (params) => ({
        url: '/analytics/daily-revenue',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get Monthly Sales
    getMonthlySales: builder.query<any, MonthlySalesParams>({
      query: (params) => ({
        url: '/analytics/monthly-sales',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get Best Selling Products
    getBestSellingProducts: builder.query<any, BestSellingParams>({
      query: (params) => ({
        url: '/analytics/best-selling',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get User Growth
    getUserGrowth: builder.query<any, UserGrowthParams>({
      query: (params) => ({
        url: '/analytics/user-growth',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Get Top Categories
    getTopCategories: builder.query<any, TopCategoriesParams>({
      query: (params) => ({
        url: '/analytics/top-categories',
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
})

export const {
  useGetRevenueStatsQuery,
  useGetDailyRevenueQuery,
  useGetMonthlySalesQuery,
  useGetBestSellingProductsQuery,
  useGetUserGrowthQuery,
  useGetTopCategoriesQuery,
} = analyticsApi

