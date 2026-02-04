// Razorpay utility functions

declare global {
  interface Window {
    Razorpay: any
  }
}

export interface RazorpayOptions {
  key: string
  amount: number // Amount in paise
  currency?: string
  name: string
  description?: string
  image?: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
  method?: {
    upi?: boolean
    card?: boolean
    netbanking?: boolean
    wallet?: boolean
    emi?: boolean
  }
}

export interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay can only be loaded in browser environment'))
      return
    }

    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')))
      return
    }

    // Create and load script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    document.body.appendChild(script)
  })
}

/**
 * Initialize Razorpay checkout
 */
export const openRazorpayCheckout = (options: RazorpayOptions): void => {
  if (!window.Razorpay) {
    throw new Error('Razorpay is not loaded. Please call loadRazorpayScript() first.')
  }

  const razorpay = new window.Razorpay({
    key: options.key,
    amount: options.amount,
    currency: options.currency || 'INR',
    name: options.name,
    description: options.description,
    image: options.image,
    order_id: options.order_id,
    handler: options.handler,
    prefill: options.prefill,
    notes: options.notes,
    theme: options.theme || {
      color: '#6366f1', // Default indigo color
    },
    modal: options.modal,
    method: options.method || {
      upi: true,
      card: true,
      netbanking: true,
      wallet: false,
      emi: false,
    },
  })

  razorpay.on('payment.failed', (response: any) => {
    console.error('Payment failed:', response)
    // The handler should not be called if payment fails
    // This is just for logging
  })

  razorpay.open()
}

/**
 * Convert amount from rupees to paise
 */
export const rupeesToPaise = (rupees: number): number => {
  return Math.round(rupees * 100)
}

/**
 * Convert amount from paise to rupees
 */
export const paiseToRupees = (paise: number): number => {
  return paise / 100
}

