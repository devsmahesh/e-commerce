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

// Razorpay interfaces
interface CreateRazorpayOrderRequest {
  amount: number // Amount in paise (e.g., 10000 for ₹100)
  currency?: string // Default: 'INR'
  receipt?: string // Receipt ID for your internal reference
  notes?: Record<string, string> // Optional notes
}

interface RazorpayOrderResponse {
  id: string // Razorpay order ID
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
  attempts: number
  notes: Record<string, string>
  created_at: number
}

interface VerifyRazorpayPaymentRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  orderId: string // Your internal order ID
}

interface VerifyRazorpayPaymentResponse {
  success: boolean
  message: string
  order?: any
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Razorpay Order
    createRazorpayOrder: builder.mutation<RazorpayOrderResponse, CreateRazorpayOrderRequest>({
      query: (data) => ({
        url: '/payments/razorpay/create-order',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify Razorpay Payment
    verifyRazorpayPayment: builder.mutation<VerifyRazorpayPaymentResponse, VerifyRazorpayPaymentRequest>({
      query: (data) => ({
        url: '/payments/razorpay/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    // Create Checkout Session (Stripe - kept for backward compatibility)
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
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useCreateCheckoutSessionMutation,
  useStripeWebhookMutation,
} = paymentsApi

