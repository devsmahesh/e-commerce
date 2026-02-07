import { useState, useEffect } from 'react'
import { useCreateRazorpayOrderMutation, useVerifyRazorpayPaymentMutation } from '@/store/api/paymentsApi'
import { loadRazorpayScript, openRazorpayCheckout, RazorpayResponse } from '@/lib/razorpay'
import { useToast } from '@/hooks/use-toast'

interface UseRazorpayPaymentProps {
  orderId: string // Your internal order ID (MongoDB ObjectId) - REQUIRED
  orderNumber: string
  userDetails?: {
    name?: string
    email?: string
    contact?: string
  }
  onSuccess?: (order: any) => void
  onError?: (error: string) => void
  storeName?: string
  description?: string
}

export const useRazorpayPayment = ({
  orderId,
  orderNumber,
  userDetails,
  onSuccess,
  onError,
  storeName = 'Runiche',
  description,
}: UseRazorpayPaymentProps) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation()
  const [verifyPayment] = useVerifyRazorpayPaymentMutation()

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript()
      .then(() => {
        setRazorpayLoaded(true)
      })
      .catch((error) => {
        console.error('Failed to load Razorpay:', error)
        const errorMessage = 'Failed to load payment gateway. Please refresh the page.'
        setError(errorMessage)
        onError?.(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      })
  }, [toast, onError])

  const initiatePayment = async () => {
    if (!razorpayLoaded) {
      const errorMessage = 'Payment gateway is still loading. Please wait.'
      setError(errorMessage)
      onError?.(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Step 1: Create Razorpay order on backend using orderId
      const razorpayOrder = await createRazorpayOrder({
        orderId: orderId, // Use order ID from database
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          orderNumber: orderNumber,
        },
      }).unwrap()

      // Validate that we have the key from response
      if (!razorpayOrder.key) {
        const errorMessage = 'Razorpay key is missing from response. Please contact support.'
        setError(errorMessage)
        onError?.(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      // Step 2: Open Razorpay checkout
      // Use key from API response instead of environment variable
      openRazorpayCheckout({
        key: razorpayOrder.key, // Use key from API response
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: storeName,
        description: description || `Order ${orderNumber}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: userDetails?.name,
          email: userDetails?.email,
          contact: userDetails?.contact,
        },
        notes: {
          orderId: orderId,
          orderNumber: orderNumber,
        },
        handler: async (response: any) => {
          try {
            // Log the full response for debugging
            console.log('Razorpay payment response:', response)
            
            // Normalize response - Razorpay may return fields in different formats
            const razorpayOrderId = response.razorpay_order_id || response.razorpayOrderId
            const razorpayPaymentId = response.razorpay_payment_id || response.razorpayPaymentId
            const razorpaySignature = response.razorpay_signature || response.razorpaySignature

            // Validate that all required fields are present
            if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
              const missingFields = []
              if (!razorpayOrderId) missingFields.push('razorpay_order_id')
              if (!razorpayPaymentId) missingFields.push('razorpay_payment_id')
              if (!razorpaySignature) missingFields.push('razorpay_signature')
              
              console.error('Missing payment fields. Full response:', response)
              throw new Error(`Missing required payment fields: ${missingFields.join(', ')}`)
            }

            if (!orderId) {
              throw new Error('Order ID is missing. Cannot verify payment.')
            }

            // Step 3: Verify payment on backend
            const verificationResult = await verifyPayment({
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: razorpayPaymentId,
              razorpay_signature: razorpaySignature,
              orderId: orderId,
            }).unwrap()

            if (verificationResult.success) {
              toast({
                title: 'Payment successful!',
                description: 'Your order has been placed successfully.',
              })
              onSuccess?.(verificationResult.order)
            } else {
              throw new Error(verificationResult.message || 'Payment verification failed')
            }
          } catch (verifyError: any) {
            console.error('Payment verification error:', verifyError)
            
            // Handle validation errors from backend
            let errorMessage = 'Payment verification failed. Please contact support.'
            if (verifyError?.data?.message) {
              if (Array.isArray(verifyError.data.message)) {
                errorMessage = verifyError.data.message.join('. ')
              } else {
                errorMessage = verifyError.data.message
              }
            } else if (verifyError?.message) {
              errorMessage = verifyError.message
            }
            
            setError(errorMessage)
            onError?.(errorMessage)
            toast({
              title: 'Payment verification failed',
              description: errorMessage,
              variant: 'destructive',
            })
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            toast({
              title: 'Payment cancelled',
              description: 'You cancelled the payment process.',
              variant: 'default',
            })
            setLoading(false)
          },
        },
      })
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || 'Failed to initiate payment. Please try again.'
      setError(errorMessage)
      onError?.(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return {
    initiatePayment,
    loading,
    error,
    razorpayLoaded,
  }
}

