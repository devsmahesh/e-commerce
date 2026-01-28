import { baseApi } from './baseApi'
import { User, Address, Product } from '@/types'

interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}

interface CreateAddressRequest {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  label?: string
  isDefault?: boolean
}

interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Profile
    getProfile: builder.query<User, void>({
      query: () => '/users/profile',
      transformResponse: (response: { success: boolean; message: string; data: any }) => {
        // Transform _id to id and return the user data
        const userData = response.data || response
        return {
          ...userData,
          id: userData._id || userData.id,
        } as User
      },
      providesTags: ['User'],
    }),

    // Update Profile
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Upload Avatar
    uploadAvatar: builder.mutation<User, FormData>({
      query: (formData) => ({
        url: '/users/profile/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    // Get Addresses
    getAddresses: builder.query<Address[], void>({
      query: () => '/users/addresses',
      transformResponse: (response: { success: boolean; message: string; data: Address[] } | Address[]) => {
        // Handle both wrapped and unwrapped responses
        if (Array.isArray(response)) {
          return response.map((addr: any) => ({
            ...addr,
            id: addr._id || addr.id,
          }))
        }
        const addresses = response.data || response
        return Array.isArray(addresses) 
          ? addresses.map((addr: any) => ({
              ...addr,
              id: addr._id || addr.id,
            }))
          : []
      },
      providesTags: ['Address'],
    }),

    // Add Address
    addAddress: builder.mutation<Address, CreateAddressRequest>({
      query: (data) => ({
        url: '/users/addresses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Address'],
    }),

    // Update Address
    updateAddress: builder.mutation<Address, { id: string; data: UpdateAddressRequest }>({
      query: ({ id, data }) => ({
        url: `/users/addresses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Address'],
    }),

    // Delete Address
    deleteAddress: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),

    // Get Wishlist
    getWishlist: builder.query<Product[], void>({
      query: () => '/users/wishlist',
      providesTags: ['Wishlist'],
    }),

    // Add to Wishlist
    addToWishlist: builder.mutation<Product, string>({
      query: (productId) => ({
        url: `/users/wishlist/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    // Remove from Wishlist
    removeFromWishlist: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/users/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
})

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useUploadAvatarMutation,
} = usersApi

