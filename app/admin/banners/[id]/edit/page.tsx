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
import { useUpdateBannerMutation, useGetBannersQuery } from '@/store/api/adminApi'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

const bannerSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  image: Yup.string().url('Must be a valid URL').required('Image URL is required'),
  link: Yup.string().url('Must be a valid URL'),
  position: Yup.string().oneOf(['hero', 'sidebar', 'footer'], 'Invalid position').required('Position is required'),
  active: Yup.boolean(),
  startDate: Yup.string(),
  endDate: Yup.string(),
})

export default function EditBannerPage() {
  const router = useRouter()
  const params = useParams()
  const bannerId = params.id as string
  const { toast } = useToast()
  const { data: banners, isLoading: isLoadingBanner } = useGetBannersQuery()
  const [updateBanner, { isLoading }] = useUpdateBannerMutation()

  const banner = banners?.find((b) => b.id === bannerId)

  const initialValues = banner
    ? {
        title: banner.title,
        image: banner.image,
        link: banner.link || '',
        position: banner.position,
        active: banner.active,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
      }
    : {
        title: '',
        image: '',
        link: '',
        position: '' as 'hero' | 'sidebar' | 'footer' | '',
        active: true,
        startDate: '',
        endDate: '',
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

      await updateBanner({
        id: bannerId,
        data: {
          title: values.title,
          image: values.image,
          link: values.link || undefined,
          position: values.position as 'hero' | 'sidebar' | 'footer',
          active: values.active,
          startDate: convertToISO(values.startDate),
          endDate: convertToISO(values.endDate),
        },
      }).unwrap()

      toast({
        title: 'Success',
        description: 'Banner updated successfully',
      })

      router.push('/admin/banners')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update banner',
        variant: 'destructive',
      })
    }
  }

  if (isLoadingBanner) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!banner) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/admin/banners" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Banners
          </Link>
          <h1 className="text-4xl font-bold">Banner Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">The banner you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/banners" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Banners
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Edit Banner</h1>
          <p className="mt-2 text-slate-600">Update banner details</p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={bannerSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">Banner Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Field
                      as={Input}
                      id="title"
                      name="title"
                      placeholder="Banner title"
                    />
                    <ErrorMessage name="title" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL *</Label>
                    <Field
                      as={Input}
                      id="image"
                      name="image"
                      type="url"
                      placeholder="https://example.com/banner.jpg"
                    />
                    <ErrorMessage name="image" component="p" className="text-sm text-destructive" />
                  </div>

                  {values.image && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                        <img
                          src={values.image}
                          alt="Banner preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="link">Link URL (Optional)</Label>
                    <Field
                      as={Input}
                      id="link"
                      name="link"
                      type="url"
                      placeholder="https://example.com"
                    />
                    <ErrorMessage name="link" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Select
                      value={values.position}
                      onValueChange={(value) => setFieldValue('position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">Hero</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.position && touched.position && (
                      <p className="text-sm text-destructive">{errors.position}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Field
                      type="checkbox"
                      id="active"
                      name="active"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="active" className="cursor-pointer">
                      Active (visible to customers)
                    </Label>
                  </div>

                  <DatePicker
                    id="startDate"
                    name="startDate"
                    label="Start Date (Optional)"
                    value={values.startDate}
                    onChange={(value) => setFieldValue('startDate', value)}
                    placeholder="Select start date"
                    error={errors.startDate && touched.startDate ? errors.startDate : undefined}
                    showTime={true}
                  />

                  <DatePicker
                    id="endDate"
                    name="endDate"
                    label="End Date (Optional)"
                    value={values.endDate}
                    onChange={(value) => setFieldValue('endDate', value)}
                    placeholder="Select end date"
                    error={errors.endDate && touched.endDate ? errors.endDate : undefined}
                    showTime={true}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Link href="/admin/banners">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isLoading || isSubmitting ? 'Updating...' : 'Update Banner'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

