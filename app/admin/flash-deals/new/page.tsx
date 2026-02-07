'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { useCreateFlashDealMutation } from '@/store/api/flashDealsApi'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const flashDealSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  type: Yup.string().oneOf(['discount', 'shipping', 'new_arrival', 'custom'], 'Invalid type').required('Type is required'),
  discountPercentage: Yup.number()
    .when('type', {
      is: 'discount',
      then: (schema) => schema.required('Discount percentage is required for discount type').min(0, 'Discount must be 0 or greater').max(100, 'Discount cannot exceed 100%'),
      otherwise: (schema) => schema.notRequired(),
    }),
  minPurchaseAmount: Yup.number().min(0, 'Minimum purchase must be 0 or greater'),
  link: Yup.string(),
  buttonText: Yup.string().max(50, 'Button text must be less than 50 characters'),
  buttonVariant: Yup.string().oneOf(['default', 'outline'], 'Invalid button variant'),
  active: Yup.boolean(),
  startDate: Yup.string().required('Start date is required'),
  endDate: Yup.string()
    .required('End date is required')
    .test('is-after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent
      if (!startDate || !value) return true
      return new Date(value) > new Date(startDate)
    }),
  priority: Yup.number().integer('Priority must be a whole number').min(0, 'Priority must be 0 or greater'),
})

export default function NewFlashDealPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [createFlashDeal, { isLoading }] = useCreateFlashDealMutation()

  const initialValues = {
    title: '',
    description: '',
    type: '' as 'discount' | 'shipping' | 'new_arrival' | 'custom' | '',
    discountPercentage: '',
    minPurchaseAmount: '',
    link: '',
    buttonText: '',
    buttonVariant: 'default' as 'default' | 'outline',
    active: true,
    startDate: '',
    endDate: '',
    priority: '0',
  }

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      // Convert datetime-local format to ISO string
      const convertToISO = (dateString: string) => {
        if (!dateString) return ''
        // If already in ISO format, return as is
        if (dateString.includes('T') && dateString.includes('Z')) return dateString
        // If datetime-local format (YYYY-MM-DDTHH:mm), convert to ISO
        if (dateString.includes('T') && dateString.length === 16) {
          return new Date(dateString + ':00').toISOString()
        }
        return new Date(dateString).toISOString()
      }

      await createFlashDeal({
        title: values.title,
        description: values.description,
        type: values.type as 'discount' | 'shipping' | 'new_arrival' | 'custom',
        discountPercentage: values.type === 'discount' && values.discountPercentage ? parseFloat(values.discountPercentage as string) : undefined,
        minPurchaseAmount: values.minPurchaseAmount ? parseFloat(values.minPurchaseAmount as string) : undefined,
        link: values.link || undefined,
        buttonText: values.buttonText || undefined,
        buttonVariant: values.buttonVariant,
        active: values.active,
        startDate: convertToISO(values.startDate),
        endDate: convertToISO(values.endDate),
        priority: values.priority ? parseInt(values.priority as string) : 0,
      }).unwrap()

      toast({
        title: 'Success',
        description: 'Flash deal created successfully',
      })

      router.push('/admin/flash-deals')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create flash deal',
        variant: 'destructive',
      })
    }
  }

  const getDefaultLink = (type: string) => {
    switch (type) {
      case 'discount':
        return '/products?sort=discount'
      case 'new_arrival':
        return '/products?sort=newest'
      default:
        return '/products'
    }
  }

  const getDefaultButtonText = (type: string) => {
    switch (type) {
      case 'discount':
        return 'Shop Flash Deals'
      case 'shipping':
        return 'Browse Ghee'
      case 'new_arrival':
        return 'View New Arrivals'
      default:
        return 'Shop Now'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/flash-deals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flash Deals
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Add New Flash Deal</h1>
          <p className="mt-2 text-slate-600">Create a new time-limited promotional offer</p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={flashDealSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">Deal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Field
                      as={Input}
                      id="title"
                      name="title"
                      placeholder="Up to 50% Off"
                    />
                    <ErrorMessage name="title" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter deal description..."
                    />
                    <ErrorMessage name="description" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Deal Type *</Label>
                    <Select
                      value={values.type}
                      onValueChange={(value) => {
                        setFieldValue('type', value)
                        // Set default link and button text based on type
                        if (!values.link) {
                          setFieldValue('link', getDefaultLink(value))
                        }
                        if (!values.buttonText) {
                          setFieldValue('buttonText', getDefaultButtonText(value))
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select deal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="shipping">Free Shipping</SelectItem>
                        <SelectItem value="new_arrival">New Arrival</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && touched.type && (
                      <p className="text-sm text-destructive">{errors.type}</p>
                    )}
                  </div>

                  {values.type === 'discount' && (
                    <div className="space-y-2">
                      <Label htmlFor="discountPercentage">Discount Percentage * (0-100)</Label>
                      <Field
                        as={Input}
                        id="discountPercentage"
                        name="discountPercentage"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        placeholder="50"
                      />
                      <ErrorMessage name="discountPercentage" component="p" className="text-sm text-destructive" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="minPurchaseAmount">Minimum Purchase Amount (Optional)</Label>
                    <Field
                      as={Input}
                      id="minPurchaseAmount"
                      name="minPurchaseAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                    <ErrorMessage name="minPurchaseAmount" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link (Optional)</Label>
                    <Field
                      as={Input}
                      id="link"
                      name="link"
                      placeholder="/products?sort=discount"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL or path where the button should link to
                    </p>
                    <ErrorMessage name="link" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text (Optional)</Label>
                    <Field
                      as={Input}
                      id="buttonText"
                      name="buttonText"
                      placeholder="Shop Flash Deals"
                    />
                    <ErrorMessage name="buttonText" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonVariant">Button Variant</Label>
                    <Select
                      value={values.buttonVariant}
                      onValueChange={(value) => setFieldValue('buttonVariant', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default (Filled)</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">Schedule & Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DatePicker
                    id="startDate"
                    name="startDate"
                    label="Start Date & Time *"
                    value={values.startDate}
                    onChange={(value) => setFieldValue('startDate', value)}
                    placeholder="Select start date and time"
                    error={errors.startDate && touched.startDate ? errors.startDate : undefined}
                    showTime={true}
                  />

                  <DatePicker
                    id="endDate"
                    name="endDate"
                    label="End Date & Time *"
                    value={values.endDate}
                    onChange={(value) => setFieldValue('endDate', value)}
                    placeholder="Select end date and time"
                    error={errors.endDate && touched.endDate ? errors.endDate : undefined}
                    showTime={true}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Field
                      as={Input}
                      id="priority"
                      name="priority"
                      type="number"
                      min="0"
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher priority deals appear first. Default is 0.
                    </p>
                    <ErrorMessage name="priority" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Field
                        type="checkbox"
                        id="active"
                        name="active"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Active
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active deals will be displayed on the homepage (if within date range).
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Link href="/admin/flash-deals">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isLoading || isSubmitting ? 'Creating...' : 'Create Flash Deal'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

