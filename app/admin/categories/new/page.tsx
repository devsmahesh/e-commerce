'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateCategoryMutation, useUploadCategoryImageMutation } from '@/store/api/categoriesApi'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Upload, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const categorySchema = Yup.object().shape({
  name: Yup.string().required('Category name is required'),
  slug: Yup.string()
    .required('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: Yup.string(),
  image: Yup.string().test('image-validation', 'Must be a valid URL', function(value) {
    // If no value, it's optional
    if (!value) return true
    // If value exists, validate it's a URL
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }),
  isActive: Yup.boolean(),
})

export default function NewCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [createCategory, { isLoading }] = useCreateCategoryMutation()
  const [uploadCategoryImage, { isLoading: isUploading }] = useUploadCategoryImageMutation()
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)

  const initialValues = {
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        })
        return
      }

      setSelectedFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (values: typeof initialValues, formikHelpers: any) => {
    try {
      let imageUrl = values.image

      // If file is selected, upload it first
      if (selectedFile) {
        const formData = new FormData()
        formData.append('image', selectedFile)
        
        try {
          const uploadResult = await uploadCategoryImage(formData).unwrap()
          
          // Extract URL from response (transformResponse should handle this, but double-check)
          if (uploadResult?.url) {
            imageUrl = uploadResult.url
          } else if (uploadResult?.data?.url) {
            imageUrl = uploadResult.data.url
          } else if (typeof uploadResult === 'string') {
            imageUrl = uploadResult
          } else {
            console.error('Unexpected upload response format:', uploadResult)
            throw new Error('No URL returned from upload')
          }
          
          if (!imageUrl) {
            throw new Error('No URL returned from upload')
          }
          
          // Update the form field value with the uploaded URL (if setFieldValue is available)
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

      await createCategory({
        name: values.name,
        slug: values.slug.toLowerCase().trim(),
        description: values.description || undefined,
        image: imageUrl || undefined,
        isActive: values.isActive,
      }).unwrap()

      toast({
        title: 'Success',
        description: 'Category created successfully',
      })

      router.push('/admin/categories')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create category',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/categories" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Add New Category</h1>
          <p className="mt-2 text-slate-600">Create a new product category</p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={categorySchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Category Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Field
                    as={Input}
                    id="name"
                    name="name"
                    placeholder="e.g., Premium Ghee"
                  />
                  <ErrorMessage name="name" component="p" className="text-sm text-destructive" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Field
                    as={Input}
                    id="slug"
                    name="slug"
                    placeholder="e.g., premium-ghee"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                      setFieldValue('slug', slug)
                    }}
                  />
                  <ErrorMessage name="slug" component="p" className="text-sm text-destructive" />
                  <p className="text-xs text-muted-foreground">
                    URL-friendly identifier (lowercase, alphanumeric, hyphens only)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter category description..."
                  />
                  <ErrorMessage name="description" component="p" className="text-sm text-destructive" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageFile">Image (Optional)</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="imageFile"
                        accept="image/*"
                        onChange={handleFileChange}
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
                          onClick={handleRemoveFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="relative w-full h-48 rounded-lg border border-gray-200 overflow-hidden bg-muted">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={values.isActive}
                    onChange={(e) => setFieldValue('isActive', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active (Category will be visible to customers)
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-6">
              <Link href="/admin/categories">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || isSubmitting || isUploading}>
                {isLoading || isSubmitting || isUploading ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

