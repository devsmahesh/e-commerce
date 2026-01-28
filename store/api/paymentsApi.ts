import { baseApi } from './baseApi'

interface CreateCheckoutSessionRequest {
  orderId: string
  successUrl: string
  cancelUrl: string
}

interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Checkout Session
    createCheckoutSession: builder.mutation<CheckoutSessionResponse, CreateCheckoutSessionRequest>({
      query: (data) => ({
        url: '/payments/checkout',
        method: 'POST',
        body: data,
      }),
    }),

    // Stripe Webhook (Public - typically handled server-side)
    // This endpoint is usually called by Stripe, not directly by the client
    stripeWebhook: builder.mutation<void, { type: string; data: any; signature: string }>({
      query: ({ signature, ...data }) => ({
        url: '/payments/webhook',
        method: 'POST',
        headers: {
          'stripe-signature': signature,
        },
        body: data,
      }),
    }),
  }),
})

export const {
  useCreateCheckoutSessionMutation,
  useStripeWebhookMutation,
} = paymentsApi

