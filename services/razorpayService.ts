/**
 * Razorpay Service
 * 
 * This service provides a clean interface for Razorpay payment operations.
 * It handles order creation, payment verification, and checkout initialization.
 * 
 * Note: This service uses the RTK Query hooks from the paymentsApi.
 * For direct API calls without hooks, use the paymentsApi mutations directly.
 */

import { loadRazorpayScript, openRazorpayCheckout, rupeesToPaise, RazorpayResponse } from '@/lib/razorpay'

interface CreateOrderData {
  amount: number // Amount in rupees
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

interface VerifyPaymentData {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  orderId: string
}

interface CheckoutOptions {
  orderId: string // Razorpay order ID
  amount: number // Amount in paise
  currency?: string
  name: string
  description: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  onSuccess: (response: RazorpayResponse) => void
  onError: (error: any) => void
  onCancel?: () => void
}

class RazorpayService {
  private razorpayKey: string | undefined
  private isScriptLoaded: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    }
  }

  /**
   * Get Razorpay Key ID
   */
  getKey(): string | undefined {
    return this.razorpayKey
  }

  /**
   * Check if Razorpay is configured
   */
  isConfigured(): boolean {
    return !!this.razorpayKey
  }

  /**
   * Load Razorpay script
   */
  async loadScript(): Promise<void> {
    if (this.isScriptLoaded) {
      return Promise.resolve()
    }

    try {
      await loadRazorpayScript()
      this.isScriptLoaded = true
    } catch (error) {
      this.isScriptLoaded = false
      throw error
    }
  }

  /**
   * Convert rupees to paise
   */
  convertToPaise(rupees: number): number {
    return rupeesToPaise(rupees)
  }

  /**
   * Open Razorpay checkout
   */
  openCheckout(options: CheckoutOptions): void {
    if (!this.razorpayKey) {
      throw new Error('Razorpay Key ID is not configured')
    }

    openRazorpayCheckout({
      key: this.razorpayKey,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: options.prefill || {},
      theme: options.theme || { color: '#6366f1' },
      handler: options.onSuccess,
      modal: {
        ondismiss: options.onCancel,
      },
    })
  }

  /**
   * Validate payment response
   */
  validatePaymentResponse(response: any): response is RazorpayResponse {
    return (
      response &&
      typeof response.razorpay_order_id === 'string' &&
      typeof response.razorpay_payment_id === 'string' &&
      typeof response.razorpay_signature === 'string'
    )
  }
}

export default new RazorpayService()

