'use client'

import { Formik, Form } from 'formik'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { useCreateOrderMutation } from '@/store/api/ordersApi'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface CheckoutFormProps {
  addressId: string
  total: number
  onSuccess: () => void
}

export function CheckoutForm({ addressId, total, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [createOrder, { isLoading }] = useCreateOrderMutation()

  const initialValues = {}

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return
    }

    try {
      // Create payment intent on backend
      // Then confirm payment with Stripe
      // For now, we'll create order directly
      await createOrder({
        shippingAddressId: addressId,
        billingAddressId: addressId,
        paymentMethod: 'card',
      }).unwrap()

      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error?.data?.message || 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div className="rounded-lg border-2 border-border p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#0F172A',
                    '::placeholder': {
                      color: '#64748B',
                    },
                  },
                },
              }}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!stripe || isSubmitting || isLoading}
            size="lg"
          >
            {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
