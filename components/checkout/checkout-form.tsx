'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateOrderMutation } from '@/store/api/ordersApi'
import { useCreateRazorpayOrderMutation, useVerifyRazorpayPaymentMutation } from '@/store/api/paymentsApi'
import { useAddToCartMutation, useUpdateCartItemMutation, useGetCartQuery } from '@/store/api/cartApi'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CreditCard, Smartphone, Building2 } from 'lucide-react'
import { Address } from '@/types'
import { loadRazorpayScript, openRazorpayCheckout, rupeesToPaise, RazorpayResponse } from '@/lib/razorpay'
import { useAppSelector } from '@/store/hooks'
import { formatPrice } from '@/lib/utils'

interface CheckoutFormProps {
  address: Address
  total: number
  shippingCost: number
  onSuccess: () => void
}

export function CheckoutForm({ address, total, shippingCost, onSuccess }: CheckoutFormProps) {
  const { toast } = useToast()
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()
  const [createRazorpayOrder, { isLoading: isCreatingRazorpayOrder }] = useCreateRazorpayOrderMutation()
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyRazorpayPaymentMutation()
  const [addToCart] = useAddToCartMutation()
  const [updateCartItem] = useUpdateCartItemMutation()
  const { data: backendCart, refetch: refetchCart } = useGetCartQuery(undefined, { skip: false })
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [isSyncingCart, setIsSyncingCart] = useState(false)
  const user = useAppSelector((state) => state.auth.user)
  const reduxCartItems = useAppSelector((state) => state.cart.items)
  
  // Store order details in a ref to ensure they persist across renders and closures
  const orderDetailsRef = useRef<{
    razorpayOrderId?: string
    orderId?: string
    orderNumber?: string
  }>({})

  const isLoading = isCreatingOrder || isCreatingRazorpayOrder || isVerifying || isRazorpayLoading || isSyncingCart

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript()
      .then(() => {
        setRazorpayLoaded(true)
      })
      .catch((error) => {
        console.error('Failed to load Razorpay:', error)
        toast({
          title: 'Error',
          description: 'Failed to load payment gateway. Please refresh the page.',
          variant: 'destructive',
        })
      })
  }, [toast])

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: 'Error',
        description: 'Payment gateway is still loading. Please wait.',
        variant: 'destructive',
      })
      return
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      toast({
        title: 'Error',
        description: 'Razorpay is not configured. Please contact support.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsRazorpayLoading(true)
      setIsSyncingCart(true)

      // Step 0: Sync cart items from Redux to backend
      // The backend expects cart items to be in the database
      // So we need to sync Redux cart items to backend before creating order
      try {
        // Refetch cart to ensure we have the latest data
        const { data: latestCart } = await refetchCart()
        // Get backend cart items (if any)
        const backendCartItems = latestCart?.items || []
        
        // Create a map of backend cart items by productId for quick lookup
        const backendCartMap = new Map(
          backendCartItems.map(item => [item.product.id, item])
        )

        // Sync each Redux cart item to backend
        for (const reduxItem of reduxCartItems) {
          const backendItem = backendCartMap.get(reduxItem.product.id)
          
          if (backendItem) {
            // Item exists in backend - update if quantity differs
            if (backendItem.quantity !== reduxItem.quantity) {
              await updateCartItem({
                productId: reduxItem.product.id,
                data: { quantity: reduxItem.quantity },
              }).unwrap()
            }
          } else {
            // Item doesn't exist in backend - add it
            await addToCart({
              productId: reduxItem.product.id,
              quantity: reduxItem.quantity,
            }).unwrap()
          }
        }
      } catch (syncError: any) {
        console.error('Error syncing cart:', syncError)
        toast({
          title: 'Warning',
          description: 'Failed to sync cart items. Attempting to proceed anyway...',
          variant: 'default',
        })
        // Continue anyway - the backend might handle it
      }

      setIsSyncingCart(false)

      // Step 1: Create order in backend
      let orderResponse: any
      try {
        const response = await createOrder({
          shippingAddress: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
          },
          shippingCost,
        }).unwrap()
        
        // Handle different response formats
        // Backend might return: { data: {...} } or directly the order object
        orderResponse = response?.data || response
        
        console.log('Order creation response:', {
          rawResponse: response,
          processedResponse: orderResponse,
          hasId: !!orderResponse?.id,
          hasOrderNumber: !!orderResponse?.orderNumber,
          allKeys: Object.keys(orderResponse || {}),
        })
      } catch (error: any) {
        console.error('Error creating order:', error)
        console.error('Error details:', {
          message: error?.message,
          data: error?.data,
          status: error?.status,
        })
        throw error
      }

      // Step 2: Create Razorpay order
      let razorpayOrderResponse: any
      try {
        const response = await createRazorpayOrder({
          amount: rupeesToPaise(total),
          currency: 'INR',
          receipt: orderResponse.orderNumber,
          notes: {
            orderId: orderResponse.id,
            orderNumber: orderResponse.orderNumber,
          },
        }).unwrap()
        
        // Handle different response formats
        // Backend might return: { data: {...} } or directly the order object
        razorpayOrderResponse = response?.data || response
        
        console.log('Razorpay order creation response:', {
          rawResponse: response,
          processedResponse: razorpayOrderResponse,
          hasId: !!razorpayOrderResponse?.id,
        })
      } catch (error: any) {
        console.error('Error creating Razorpay order:', error)
        console.error('Error details:', {
          message: error?.message,
          data: error?.data,
          status: error?.status,
        })
        throw error
      }

      // Validate that we have all required IDs
      if (!razorpayOrderResponse?.id) {
        console.error('Razorpay order response missing ID:', razorpayOrderResponse)
        throw new Error(
          `Failed to create Razorpay order: No order ID returned. Response: ${JSON.stringify(razorpayOrderResponse)}`
        )
      }
      if (!orderResponse?.id) {
        console.error('Order response missing ID:', orderResponse)
        console.error('Order response keys:', Object.keys(orderResponse || {}))
        throw new Error(
          `Failed to create order: No order ID returned. Response: ${JSON.stringify(orderResponse)}`
        )
      }
      
      // Validate orderNumber exists (used for receipt)
      if (!orderResponse?.orderNumber) {
        console.warn('Order response missing orderNumber:', orderResponse)
        // This is not critical, but log it
      }

      // Store the Razorpay order ID and order details for verification
      // Store in both variables and ref to ensure they're accessible
      const razorpayOrderIdForHandler = razorpayOrderResponse.id
      const orderIdForHandler = orderResponse.id
      const orderNumberForHandler = orderResponse.orderNumber

      // Also store in ref as backup - this is critical for handler access
      orderDetailsRef.current = {
        razorpayOrderId: razorpayOrderResponse.id,
        orderId: orderResponse.id,
        orderNumber: orderResponse.orderNumber,
      }

      // Log immediately to verify values exist
      console.log('Order IDs captured:', {
        razorpayOrderId: razorpayOrderIdForHandler,
        orderId: orderIdForHandler,
        orderNumber: orderNumberForHandler,
        ref: orderDetailsRef.current,
        razorpayOrderResponse: razorpayOrderResponse,
        orderResponse: orderResponse,
      })
      
      // Double-check the ref was set correctly
      if (!orderDetailsRef.current.razorpayOrderId || !orderDetailsRef.current.orderId) {
        console.error('CRITICAL: Ref values not set correctly!', orderDetailsRef.current)
        throw new Error('Failed to store order details for payment verification')
      }

      setIsRazorpayLoading(false)

      // Step 3: Create payment handler function with proper closure capture
      // Use the response objects directly to ensure closure works correctly
      const paymentHandler = async (response: any) => {
        try {
          // Log the full response for debugging
          console.log('Razorpay payment response:', response)
          
          // Try to get values from multiple sources: ref (most reliable), closure variables, and response objects
          const capturedRazorpayOrderId = orderDetailsRef.current?.razorpayOrderId || 
                                         razorpayOrderIdForHandler || 
                                         razorpayOrderResponse?.id
          const capturedOrderId = orderDetailsRef.current?.orderId || 
                                orderIdForHandler || 
                                orderResponse?.id
          
          console.log('Captured Razorpay Order ID:', capturedRazorpayOrderId)
          console.log('Captured Order ID:', capturedOrderId)
          console.log('From closure - razorpayOrderIdForHandler:', razorpayOrderIdForHandler)
          console.log('From closure - orderIdForHandler:', orderIdForHandler)
          console.log('From ref:', orderDetailsRef.current)
          console.log('Direct access - razorpayOrderResponse.id:', razorpayOrderResponse?.id)
          console.log('Direct access - orderResponse.id:', orderResponse?.id)
          
          // Normalize response - Razorpay may return fields in different formats
          // Try multiple possible field names, with fallback to captured order ID
          const extractedOrderId = response.razorpay_order_id || 
                                   response.razorpayOrderId || 
                                   response.order_id
          // Use extracted order ID or fallback to the captured Razorpay order ID
          const finalRazorpayOrderId = extractedOrderId || capturedRazorpayOrderId || razorpayOrderResponse?.id
          
          const razorpayPaymentId = response.razorpay_payment_id || 
                                    response.razorpayPaymentId ||
                                    response.payment_id
          
          const razorpaySignature = response.razorpay_signature || 
                                    response.razorpaySignature ||
                                    response.signature

          // Validate that all required fields are present
          if (!finalRazorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            const missingFields = []
            if (!finalRazorpayOrderId) missingFields.push('razorpay_order_id')
            if (!razorpayPaymentId) missingFields.push('razorpay_payment_id')
            if (!razorpaySignature) missingFields.push('razorpay_signature')
            
            console.error('Missing payment fields. Full response:', JSON.stringify(response, null, 2))
            console.error('Available response keys:', Object.keys(response || {}))
            console.error('Captured Razorpay Order ID:', capturedRazorpayOrderId)
            console.error('Captured Order ID:', capturedOrderId)
            console.error('Direct access - razorpayOrderResponse:', razorpayOrderResponse)
            console.error('Direct access - orderResponse:', orderResponse)
            
            // If signature is missing, this is a critical error - payment cannot be verified
            if (!razorpaySignature) {
              toast({
                title: 'Payment Error',
                description: 'Payment response is incomplete. The payment may not have completed successfully. Please contact support with payment ID: ' + (razorpayPaymentId || 'unknown'),
                variant: 'destructive',
              })
              throw new Error(`Payment verification failed: Missing signature. Payment ID: ${razorpayPaymentId || 'unknown'}. Please contact support.`)
            }
            
            throw new Error(`Missing required payment fields: ${missingFields.join(', ')}. Please check the browser console for details.`)
          }

          const finalOrderId = capturedOrderId || orderResponse?.id
          if (!finalOrderId) {
            throw new Error('Order ID is missing. Cannot verify payment.')
          }

          // Log the verification request payload for debugging
          console.log('Payment verification request:', {
            razorpay_order_id: finalRazorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature ? '***present***' : 'MISSING',
            orderId: finalOrderId,
            orderIdType: typeof finalOrderId,
            orderIdLength: finalOrderId?.length,
          })

          // Step 4: Verify payment
          await verifyPayment({
            razorpay_order_id: finalRazorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            orderId: finalOrderId,
          }).unwrap()

          toast({
            title: 'Payment successful!',
            description: 'Your order has been placed successfully.',
          })

          onSuccess()
        } catch (error: any) {
          console.error('Payment verification error:', error)
          
          // Handle validation errors from backend
          let errorMessage = 'Failed to verify payment. Please contact support.'
          if (error?.data?.message) {
            if (Array.isArray(error.data.message)) {
              errorMessage = error.data.message.join('. ')
            } else {
              errorMessage = error.data.message
            }
          } else if (error?.message) {
            errorMessage = error.message
          }
          
          toast({
            title: 'Payment verification failed',
            description: errorMessage,
            variant: 'destructive',
          })
        }
      }

      // Step 4: Open Razorpay checkout with the handler
      openRazorpayCheckout({
        key: razorpayKey,
        amount: razorpayOrderResponse.amount,
        currency: razorpayOrderResponse.currency,
        name: 'Runiche',
        description: `Order #${orderNumberForHandler}`,
        order_id: razorpayOrderIdForHandler,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}` : undefined,
          email: user?.email,
          contact: user?.phone,
        },
        notes: {
          orderId: orderIdForHandler,
          orderNumber: orderNumberForHandler,
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: false,
          emi: false,
        },
        handler: paymentHandler,
        modal: {
          ondismiss: () => {
            toast({
              title: 'Payment cancelled',
              description: 'You cancelled the payment process.',
              variant: 'default',
            })
          },
        },
      })
    } catch (error: any) {
      setIsRazorpayLoading(false)
      setIsSyncingCart(false)
      
      // Log the full error for debugging
      console.error('Payment initiation error:', error)
      console.error('Error details:', {
        message: error?.message,
        data: error?.data,
        stack: error?.stack,
      })
      
      // Provide more specific error messages
      let errorMessage = 'Failed to initiate payment. Please try again.'
      if (error?.data?.message) {
        if (Array.isArray(error.data.message)) {
          errorMessage = error.data.message.join('. ')
        } else {
          errorMessage = error.data.message
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-border p-6 bg-muted/30">
        <h3 className="mb-4 text-lg font-semibold">Payment Methods</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col items-center p-3 rounded-lg bg-background border border-border">
            <Smartphone className="h-8 w-8 mb-2 text-primary" />
            <span className="text-sm font-medium">UPI</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-background border border-border">
            <CreditCard className="h-8 w-8 mb-2 text-primary" />
            <span className="text-sm font-medium">Card</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-background border border-border">
            <Building2 className="h-8 w-8 mb-2 text-primary" />
            <span className="text-sm font-medium">Net Banking</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          You will be redirected to Razorpay secure payment gateway to complete your payment.
        </p>
      </div>

      <Button
        onClick={handlePayment}
        className="w-full"
        disabled={!razorpayLoaded || isLoading}
        size="lg"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!razorpayLoaded
          ? 'Loading Payment Gateway...'
          : `Pay ${formatPrice(total)}`}
      </Button>
    </div>
  )
}
