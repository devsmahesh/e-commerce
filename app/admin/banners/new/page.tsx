'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { useCreateBannerMutation, useUploadBannerImageMutation } from '@/store/api/adminApi'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'

const bannerSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  image: Yup.string().required('Image is required'),
  link: Yup.string().url('Must be a valid URL'),
  position: Yup.string().oneOf(['hero', 'sidebar', 'footer'], 'Invalid position').required('Position is required'),
  active: Yup.boolean(),
  startDate: Yup.string(),
  endDate: Yup.string(),
})

export default function NewBannerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [createBanner, { isLoading }] = useCreateBannerMutation()
  const [uploadBannerImage] = useUploadBannerImageMutation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const initialValues = {
    title: '',
    image: '',
    link: '',
    position: '' as 'hero' | 'sidebar' | 'footer' | '',
    active: true,
    startDate: '',
    endDate: '',
  }


  const handleSubmit = async (values: typeof initialValues, formikHelpers: any) => {
    try {
      let imageUrl = values.image

      // If file is selected, upload it first
      if (selectedFile) {
        const formData = new FormData()
        formData.append('image', selectedFile)
        
        try {
          const uploadResult = await uploadBannerImage(formData).unwrap()
          
          // Extract URL from response
          if (uploadResult?.url) {
            imageUrl = uploadResult.url
          } else if ((uploadResult as any)?.data?.url) {
            imageUrl = (uploadResult as any).data.url
          } else if (typeof uploadResult === 'string') {
            imageUrl = uploadResult
          } else {
            console.error('Unexpected upload response format:', uploadResult)
            throw new Error('No URL returned from upload')
          }
          
          if (!imageUrl) {
            throw new Error('No URL returned from upload')
          }
          
          // Update the form field value with the uploaded URL
          if (formikHelpers?.setFieldValue) {
            formikHelpers.setFieldValue('image', imageUrl)
          }
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError)
          toast({
            title: 'Upload Error',
            description: uploadError?.data?.message || uploadError?.message || 'Failed to upload image',
            variant: 'destructive',
          })
          return
        }
      }

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

      await createBanner({
        title: values.title,
        image: imageUrl,
        link: values.link || undefined,
        position: values.position as 'hero' | 'sidebar' | 'footer',
        active: values.active,
        startDate: convertToISO(values.startDate),
        endDate: convertToISO(values.endDate),
      }).unwrap()

      toast({
        title: 'Success',
        description: 'Banner created successfully',
      })

      router.push('/admin/banners')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create banner',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/banners" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Banners
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Add New Banner</h1>
          <p className="mt-2 text-slate-600">Create a new promotional banner</p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={bannerSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => {
          // Update handleFileChange to use setFieldValue from Formik
          const handleFileChangeWithFormik = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return

            // Validate file type
            if (!file.type.startsWith('image/')) {
              toast({
                title: 'Invalid file type',
                description: 'Please select an image file.',
                variant: 'destructive',
              })
              return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
              toast({
                title: 'File too large',
                description: 'Image must be less than 5MB.',
                variant: 'destructive',
              })
              return
            }

            setSelectedFile(file)
            // Set a placeholder value so validation passes
            setFieldValue('image', 'file-selected', false)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
              setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
          }

          const handleRemoveFileWithFormik = () => {
            setSelectedFile(null)
            setImagePreview(null)
            setFieldValue('image', '', false)
          }

          return (
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
                      <Label htmlFor="imageFile">Image *</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id="imageFile"
                            accept="image/*"
                            onChange={handleFileChangeWithFormik}
                            className="hidden"
                          />
                        <label
                          htmlFor="imageFile"
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {selectedFile ? selectedFile.name : 'Choose image file'}
                          </span>
                        </label>
                        {selectedFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFileWithFormik}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {imagePreview && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                          <img
                            src={imagePreview}
                            alt="Banner preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      {values.image && !imagePreview && (
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
                      )}
                    </div>
                    <Field type="hidden" name="image" />
                    <ErrorMessage name="image" component="p" className="text-sm text-destructive" />
                  </div>

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
                {isLoading || isSubmitting ? 'Creating...' : 'Create Banner'}
              </Button>
            </div>
          </Form>
          )
        }}
      </Formik>
    </div>
  )
}

