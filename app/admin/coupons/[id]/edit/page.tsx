'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { useUpdateCouponMutation, useGetCouponByIdQuery } from '@/store/api/couponsApi'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

const couponSchema = Yup.object().shape({
  code: Yup.string().required('Coupon code is required').uppercase(),
  description: Yup.string().required('Description is required'),
  type: Yup.string().oneOf(['fixed', 'percentage'], 'Invalid type').required('Type is required'),
  value: Yup.number()
    .required('Value is required')
    .positive('Value must be positive')
    .when('type', {
      is: 'percentage',
      then: (schema) => schema.max(100, 'Percentage must be between 0 and 100'),
    }),
  minPurchase: Yup.number().positive('Minimum purchase must be positive'),
  maxDiscount: Yup.number().positive('Maximum discount must be positive'),
  expiresAt: Yup.string(),
  usageLimit: Yup.number().integer('Usage limit must be a whole number').positive('Usage limit must be positive'),
})

export default function EditCouponPage() {
  const router = useRouter()
  const params = useParams()
  const couponId = params.id as string
  const { toast } = useToast()
  const { data: coupon, isLoading: isLoadingCoupon } = useGetCouponByIdQuery(couponId)
  const [updateCoupon, { isLoading }] = useUpdateCouponMutation()

  const initialValues = coupon
    ? {
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.type,
        value: coupon.value.toString(),
        minPurchase: coupon.minPurchase?.toString() || '',
        maxDiscount: coupon.maxDiscount?.toString() || '',
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '',
        usageLimit: coupon.usageLimit?.toString() || '',
      }
    : {
        code: '',
        description: '',
        type: '' as 'fixed' | 'percentage' | '',
        value: '',
        minPurchase: '',
        maxDiscount: '',
        expiresAt: '',
        usageLimit: '',
      }

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      // Convert datetime-local format to ISO string
      const convertToISO = (dateString: string) => {
        if (!dateString) return undefined
        // If already in ISO format, return as is
        if (dateString.includes('T') && dateString.includes('Z')) return dateString
        // If datetime-local format (YYYY-MM-DDTHH:mm), convert to ISO
        if (dateString.includes('T') && dateString.length === 16) {
          return new Date(dateString + ':00').toISOString()
        }
        return dateString
      }

      await updateCoupon({
        id: couponId,
        data: {
          code: values.code.toUpperCase(),
          description: values.description,
          type: values.type as 'fixed' | 'percentage',
          value: parseFloat(values.value as string),
          minPurchase: values.minPurchase ? parseFloat(values.minPurchase as string) : undefined,
          maxDiscount: values.maxDiscount ? parseFloat(values.maxDiscount as string) : undefined,
          expiresAt: convertToISO(values.expiresAt),
          usageLimit: values.usageLimit ? parseInt(values.usageLimit as string) : undefined,
        },
      }).unwrap()

      toast({
        title: 'Success',
        description: 'Coupon updated successfully',
      })

      router.push('/admin/coupons')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update coupon',
        variant: 'destructive',
      })
    }
  }

  if (isLoadingCoupon) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!coupon) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/admin/coupons" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coupons
          </Link>
          <h1 className="text-4xl font-bold">Coupon Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">The coupon you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/coupons" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coupons
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Edit Coupon</h1>
          <p className="mt-2 text-slate-600">Update coupon details</p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={couponSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">Coupon Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code *</Label>
                    <Field
                      as={Input}
                      id="code"
                      name="code"
                      placeholder="SAVE20"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('code', e.target.value.toUpperCase())
                      }}
                    />
                    <ErrorMessage name="code" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter coupon description..."
                    />
                    <ErrorMessage name="description" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Discount Type *</Label>
                    <Select
                      value={values.type}
                      onValueChange={(value) => setFieldValue('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && touched.type && (
                      <p className="text-sm text-destructive">{errors.type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">
                      Discount Value * {values.type === 'percentage' ? '(0-100)' : '($)'}
                    </Label>
                    <Field
                      as={Input}
                      id="value"
                      name="value"
                      type="number"
                      step={values.type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      max={values.type === 'percentage' ? '100' : undefined}
                      placeholder={values.type === 'percentage' ? '20' : '10.00'}
                    />
                    <ErrorMessage name="value" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minPurchase">Minimum Purchase (Optional)</Label>
                    <Field
                      as={Input}
                      id="minPurchase"
                      name="minPurchase"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                    <ErrorMessage name="minPurchase" component="p" className="text-sm text-destructive" />
                  </div>

                  {values.type === 'percentage' && (
                    <div className="space-y-2">
                      <Label htmlFor="maxDiscount">Maximum Discount (Optional)</Label>
                      <Field
                        as={Input}
                        id="maxDiscount"
                        name="maxDiscount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                      <ErrorMessage name="maxDiscount" component="p" className="text-sm text-destructive" />
                      <p className="text-xs text-muted-foreground">
                        Maximum discount amount when using percentage discount
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">Usage & Expiration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                    <Field
                      as={Input}
                      id="usageLimit"
                      name="usageLimit"
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                    />
                    <ErrorMessage name="usageLimit" component="p" className="text-sm text-destructive" />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of times this coupon can be used. Leave empty for unlimited.
                    </p>
                    {coupon && (
                      <p className="text-xs text-muted-foreground">
                        Currently used: {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''} times
                      </p>
                    )}
                  </div>

                  <DatePicker
                    id="expiresAt"
                    name="expiresAt"
                    label="Expiration Date (Optional)"
                    value={values.expiresAt}
                    onChange={(value) => setFieldValue('expiresAt', value)}
                    placeholder="Select expiration date"
                    error={errors.expiresAt && touched.expiresAt ? errors.expiresAt : undefined}
                    showTime={true}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no expiration date
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Link href="/admin/coupons">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isLoading || isSubmitting ? 'Updating...' : 'Update Coupon'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

