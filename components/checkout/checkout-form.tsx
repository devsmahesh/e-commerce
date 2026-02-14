'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCreateOrderMutation } from '@/store/api/ordersApi'
import { useCreateRazorpayOrderMutation, useVerifyRazorpayPaymentMutation } from '@/store/api/paymentsApi'
import { useAddToCartMutation, useUpdateCartItemMutation, useGetCartQuery, useClearCartMutation } from '@/store/api/cartApi'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CreditCard, Smartphone, Building2, Truck, AlertTriangle } from 'lucide-react'
import { Address } from '@/types'
import { loadRazorpayScript, openRazorpayCheckout, rupeesToPaise, RazorpayResponse } from '@/lib/razorpay'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { clearCart as clearCartAction } from '@/store/slices/cartSlice'
import { formatPrice } from '@/lib/utils'
import { Coupon } from '@/types'
import { CODConfirmationDialog } from './cod-confirmation-dialog'

interface CheckoutFormProps {
  address: Address
  total: number
  shippingCost: number
  coupon?: Coupon | null
  onSuccess: () => void
}

export function CheckoutForm({ address, total, shippingCost, coupon, onSuccess }: CheckoutFormProps) {
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()
  const [createRazorpayOrder, { isLoading: isCreatingRazorpayOrder }] = useCreateRazorpayOrderMutation()
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyRazorpayPaymentMutation()
  const [addToCart] = useAddToCartMutation()
  const [updateCartItem] = useUpdateCartItemMutation()
  const [clearCart] = useClearCartMutation()
  const { data: backendCart, refetch: refetchCart } = useGetCartQuery(undefined, { skip: false })
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [isSyncingCart, setIsSyncingCart] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay')
  const [showCODConfirmation, setShowCODConfirmation] = useState(false)
  const user = useAppSelector((state) => state.auth.user)
  const reduxCartItems = useAppSelector((state) => state.cart.items)
  
  // Store order details in a ref to ensure they persist across renders and closures
  const orderDetailsRef = useRef<{
    razorpayOrderId?: string
    orderId?: string
    orderNumber?: string
  }>({})

  const isLoading = isCreatingOrder || isCreatingRazorpayOrder || isVerifying || isRazorpayLoading || isSyncingCart
  const isCODLoading = isCreatingOrder || isSyncingCart

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

    // Note: Razorpay key will come from the API response
    // We'll check for it after creating the Razorpay order

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
          couponId: coupon?.id,
        }).unwrap()
        
        // Handle different response formats
        // Backend might return: { data: {...} } or directly the order object
        orderResponse = (response as any)?.data || response
        
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

      // Step 2: Create Razorpay order using orderId
      let razorpayOrderResponse: any
      try {
        const response = await createRazorpayOrder({
          orderId: orderResponse.id, // Use order ID from database
          currency: 'INR',
          receipt: orderResponse.orderNumber,
          notes: {
            orderNumber: orderResponse.orderNumber,
          },
        }).unwrap()
        
        // Handle different response formats
        // Backend might return: { data: {...} } or directly the order object
        razorpayOrderResponse = (response as any)?.data || response
        
        console.log('Razorpay order creation response:', {
          rawResponse: response,
          processedResponse: razorpayOrderResponse,
          hasId: !!razorpayOrderResponse?.id,
          hasKey: !!razorpayOrderResponse?.key,
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

      // Validate that we have all required IDs and key
      if (!razorpayOrderResponse?.id) {
        console.error('Razorpay order response missing ID:', razorpayOrderResponse)
        throw new Error(
          `Failed to create Razorpay order: No order ID returned. Response: ${JSON.stringify(razorpayOrderResponse)}`
        )
      }
      if (!razorpayOrderResponse?.key) {
        console.error('Razorpay order response missing key:', razorpayOrderResponse)
        throw new Error(
          `Failed to create Razorpay order: No key returned. Response: ${JSON.stringify(razorpayOrderResponse)}`
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

          // Step 5: Clear cart after successful payment
          try {
            // Clear backend cart
            await clearCart().unwrap()
            // Clear Redux cart
            dispatch(clearCartAction())
          } catch (cartError) {
            console.error('Error clearing cart:', cartError)
            // Don't fail the payment flow if cart clearing fails
            // The cart will be invalidated by the payment API anyway
          }

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
      // Use key from response instead of environment variable
      openRazorpayCheckout({
        key: razorpayOrderResponse.key, // Use key from API response
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
            // Note: Order is created with paymentStatus 'pending' 
            // Backend should handle cleanup of abandoned orders (not completed within X minutes)
            // Admin will not see orders with paymentStatus 'pending' (filtered on frontend)
            toast({
              title: 'Payment cancelled',
              description: 'You cancelled the payment process. The order will not be processed until payment is completed.',
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

  const handleCODOrder = async () => {
    try {
      setShowCODConfirmation(false) // Close dialog
      setIsSyncingCart(true)

      // Step 0: Sync cart items from Redux to backend
      try {
        const { data: latestCart } = await refetchCart()
        const backendCartItems = latestCart?.items || []
        
        const backendCartMap = new Map(
          backendCartItems.map(item => [item.product.id, item])
        )

        for (const reduxItem of reduxCartItems) {
          const backendItem = backendCartMap.get(reduxItem.product.id)
          
          if (backendItem) {
            if (backendItem.quantity !== reduxItem.quantity) {
              await updateCartItem({
                productId: reduxItem.product.id,
                data: { quantity: reduxItem.quantity },
              }).unwrap()
            }
          } else {
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
      }

      setIsSyncingCart(false)

      // Step 1: Create COD order in backend
      const response = await createOrder({
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
        },
        shippingCost,
        couponId: coupon?.id,
        paymentMethod: 'cod',
      }).unwrap()
      
      const orderResponse = (response as any)?.data || response

      // Step 2: Clear cart after successful order creation
      try {
        await clearCart().unwrap()
        dispatch(clearCartAction())
      } catch (cartError) {
        console.error('Error clearing cart:', cartError)
      }

      toast({
        title: 'Order placed successfully!',
        description: 'Your COD order has been placed. You will receive a confirmation email shortly.',
      })

      onSuccess()
    } catch (error: any) {
      console.error('COD order error:', error)
      
      let errorMessage = 'Failed to place order. Please try again.'
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

  const handlePaymentMethodSelect = (method: 'razorpay' | 'cod') => {
    setPaymentMethod(method)
  }

  const handleCODButtonClick = () => {
    setPaymentMethod('cod')
    setShowCODConfirmation(true)
  }

  const handleCODConfirmationClose = (open: boolean) => {
    setShowCODConfirmation(open)
    // If dialog is closed without confirmation, reset to razorpay
    if (!open && paymentMethod === 'cod') {
      setPaymentMethod('razorpay')
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-border p-6 bg-muted/30">
        <h3 className="mb-4 text-lg font-semibold">Payment Methods</h3>
        
        {/* Payment Method Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Razorpay Option */}
          <button
            type="button"
            onClick={() => handlePaymentMethodSelect('razorpay')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'razorpay'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 bg-background'
            }`}
          >
            <div className="flex gap-2 mb-2">
              <Smartphone className="h-6 w-6 text-primary" />
              <CreditCard className="h-6 w-6 text-primary" />
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium">Online Payment</span>
            <span className="text-xs text-muted-foreground mt-1">UPI, Card, Net Banking</span>
          </button>

          {/* COD Option */}
          <button
            type="button"
            onClick={() => handlePaymentMethodSelect('cod')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all relative ${
              paymentMethod === 'cod'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 bg-background'
            }`}
          >
            <Truck className="h-8 w-8 mb-2 text-primary" />
            <span className="text-sm font-medium">Cash on Delivery</span>
            <Badge variant="destructive" className="mt-1 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Manual Verification
            </Badge>
          </button>
        </div>

        {/* Warning Badge for COD */}
        {paymentMethod === 'cod' && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              🚚 COD Orders are manually verified before dispatch.
            </p>
          </div>
        )}

        {paymentMethod === 'razorpay' && (
          <p className="text-sm text-muted-foreground">
            You will be redirected to Razorpay secure payment gateway to complete your payment.
          </p>
        )}
      </div>

      {paymentMethod === 'razorpay' ? (
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
      ) : (
        <Button
          onClick={handleCODButtonClick}
          className="w-full"
          disabled={isCODLoading}
          size="lg"
          variant="outline"
        >
          {isCODLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCODLoading ? 'Processing...' : `Place COD Order - ${formatPrice(total)}`}
        </Button>
      )}

      {/* COD Confirmation Dialog */}
      <CODConfirmationDialog
        open={showCODConfirmation}
        onOpenChange={handleCODConfirmationClose}
        address={address}
        total={total}
        onConfirm={handleCODOrder}
        isLoading={isCODLoading}
      />
    </div>
  )
}
