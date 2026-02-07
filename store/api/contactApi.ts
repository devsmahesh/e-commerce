import { baseApi } from './baseApi'
import { PaginatedResponse } from '@/types'

interface ContactRequest {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

interface ContactResponse {
  success: boolean
  message: string
  data?: {
    id: string
    name: string
    email: string
    phone: string
    subject: string
    message: string
    status: string
    createdAt: string
  }
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: 'pending' | 'read' | 'replied' | 'archived'
  createdAt: string
  updatedAt?: string
  repliedAt?: string
  repliedBy?: string
  notes?: string
}

interface GetContactsParams {
  page?: number
  limit?: number
  status?: 'pending' | 'read' | 'replied' | 'archived'
  search?: string
}

interface UpdateContactStatusRequest {
  status: 'pending' | 'read' | 'replied' | 'archived'
  notes?: string
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Submit Contact Form (Public)
    submitContact: builder.mutation<ContactResponse, ContactRequest>({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
    }),

    // Get All Contacts (Admin)
    getContacts: builder.query<PaginatedResponse<Contact>, GetContactsParams>({
      query: (params) => ({
        url: '/admin/contacts',
        params,
      }),
      transformResponse: (response: any) => {
        if (response.error || (response.success === false)) {
          throw response
        }
        
        const responseData = response.data || response
        const items = responseData.items || responseData.data || []
        
        return {
          data: items.map((item: any) => ({
            ...item,
            id: item._id || item.id,
            status: item.status || 'pending',
          })),
          meta: {
            page: responseData.meta?.page || 1,
            limit: responseData.meta?.limit || 10,
            total: responseData.meta?.total || items.length,
            totalPages: responseData.meta?.totalPages || 1,
          },
        }
      },
      providesTags: ['Contact'],
    }),

    // Get Single Contact (Admin)
    getContact: builder.query<Contact, string>({
      query: (id) => `/admin/contacts/${id}`,
      transformResponse: (response: any) => {
        if (response.error || (response.success === false)) {
          throw response
        }
        
        const item = response.data || response
        return {
          ...item,
          id: item._id || item.id,
          status: item.status || 'pending',
        }
      },
      providesTags: (result, error, id) => [{ type: 'Contact', id }],
    }),

    // Update Contact Status (Admin)
    updateContactStatus: builder.mutation<Contact, { id: string; data: UpdateContactStatusRequest }>({
      query: ({ id, data }) => ({
        url: `/admin/contacts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: any) => {
        const item = response.data || response
        return {
          ...item,
          id: item._id || item.id,
          status: item.status || 'pending',
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Contact', id },
        'Contact',
      ],
    }),

    // Delete Contact (Admin)
    deleteContact: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/admin/contacts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
})

export const {
  useSubmitContactMutation,
  useGetContactsQuery,
  useGetContactQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
} = contactApi

