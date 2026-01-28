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
import { useGetProductByIdQuery, useUpdateProductMutation } from '@/store/api/productsApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

const productSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive')
    .min(0, 'Price must be at least 0'),
  stock: Yup.number()
    .required('Stock quantity is required')
    .integer('Stock must be a whole number')
    .min(0, 'Stock must be at least 0'),
  categoryId: Yup.string().required('Category is required'),
  images: Yup.array()
    .of(Yup.string().url('Must be a valid URL'))
    .min(1, 'At least one image is required'),
  tags: Yup.array().of(Yup.string()),
  isFeatured: Yup.boolean(),
  isActive: Yup.boolean(),
})

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string
  const { toast } = useToast()
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetCategoriesQuery({})
  const categories = Array.isArray(categoriesResponse) 
    ? categoriesResponse 
    : (categoriesResponse as any)?.data || []
  const { data: product, isLoading: isLoadingProduct } = useGetProductByIdQuery(productId, {
    skip: !productId,
  })
  const [updateProduct, { isLoading }] = useUpdateProductMutation()

  const getInitialValues = () => {
    if (!product) {
      return {
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '' as string,
        images: [] as string[],
        tags: [] as string[],
        isFeatured: false,
        isActive: true,
      }
    }

    return {
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      stock: String(product.stock || ''),
      categoryId: product.category?.id || (product as any).categoryId?._id || (product as any).categoryId || '',
      images: product.images || [],
      tags: product.tags || [],
      isFeatured: product.featured || false,
      isActive: (product as any).isActive !== undefined ? (product as any).isActive : true,
    }
  }

  const handleSubmit = async (values: ReturnType<typeof getInitialValues>) => {
    if (!productId) return

    try {
      await updateProduct({
        id: productId,
        data: {
          name: values.name,
          description: values.description,
          price: parseFloat(values.price as string),
          stock: parseInt(values.stock as string),
          categoryId: values.categoryId,
          images: values.images,
          tags: values.tags.length > 0 ? values.tags : undefined,
          isFeatured: values.isFeatured,
          isActive: values.isActive,
        },
      }).unwrap()

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      })

      router.push('/admin/products')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update product',
        variant: 'destructive',
      })
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
            <h1 className="text-4xl font-bold text-slate-900">Edit Product</h1>
            <p className="mt-2 text-slate-600">Loading product data...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
            <h1 className="text-4xl font-bold text-slate-900">Edit Product</h1>
            <p className="mt-2 text-slate-600">Product not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Product not found</p>
            <Link href="/admin/products">
              <Button variant="outline" className="mt-4">
                Back to Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Edit Product</h1>
          <p className="mt-2 text-slate-600">Update product information</p>
        </div>
      </div>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={productSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => {
          const [imageUrl, setImageUrl] = React.useState('')
          const [tagInput, setTagInput] = React.useState('')

          const handleAddImage = () => {
            if (imageUrl.trim()) {
              const newImages = [...values.images, imageUrl.trim()]
              setFieldValue('images', newImages)
              setImageUrl('')
            }
          }

          const handleRemoveImage = (index: number) => {
            const newImages = values.images.filter((_, i) => i !== index)
            setFieldValue('images', newImages)
          }

          const handleAddTag = () => {
            if (tagInput.trim()) {
              const newTags = [...values.tags, tagInput.trim()]
              setFieldValue('tags', newTags)
              setTagInput('')
            }
          }

          const handleRemoveTag = (index: number) => {
            const newTags = values.tags.filter((_, i) => i !== index)
            setFieldValue('tags', newTags)
          }

          return (
            <Form>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Field
                          as={Input}
                          id="name"
                          name="name"
                          placeholder="Enter product name"
                        />
                        <ErrorMessage name="name" component="p" className="text-sm text-destructive" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Field
                          as="textarea"
                          id="description"
                          name="description"
                          placeholder="Enter product description"
                          className="flex min-h-[120px] w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <ErrorMessage name="description" component="p" className="text-sm text-destructive" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="categoryId">Category *</Label>
                        <Select
                          value={values.categoryId && values.categoryId !== '' ? String(values.categoryId) : undefined}
                          onValueChange={(value) => {
                            if (value && value !== 'no-categories') {
                              setFieldValue('categoryId', value)
                            }
                          }}
                          disabled={categoriesLoading || !Array.isArray(categories) || categories.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(categories) && categories.length > 0 ? (
                              categories.map((category) => {
                                const categoryIdStr = String(category.id)
                                return (
                                  <SelectItem 
                                    key={categoryIdStr} 
                                    value={categoryIdStr}
                                  >
                                    {category.name}
                                  </SelectItem>
                                )
                              })
                            ) : (
                              <SelectItem value="no-categories" disabled>
                                {categoriesLoading ? 'Loading categories...' : 'No categories available'}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {errors.categoryId && touched.categoryId && (
                          <p className="text-sm text-destructive">{errors.categoryId}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Pricing & Inventory</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Field
                          as={Input}
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                        <ErrorMessage name="price" component="p" className="text-sm text-destructive" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity *</Label>
                        <Field
                          as={Input}
                          id="stock"
                          name="stock"
                          type="number"
                          min="0"
                          placeholder="0"
                        />
                        <ErrorMessage name="stock" component="p" className="text-sm text-destructive" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Product Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="imageUrl"
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddImage()
                              }
                            }}
                          />
                          <Button type="button" onClick={handleAddImage} variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {values.images.length > 0 && (
                        <div className="space-y-2">
                          <Label>Added Images</Label>
                          <div className="space-y-2">
                            {values.images.map((image, index) => (
                              <div key={index} className="flex items-center gap-2 rounded-lg border border-border p-2">
                                <span className="flex-1 truncate text-sm">{image}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {errors.images && touched.images && (
                        <p className="text-sm text-destructive">{errors.images}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="tag">Add Tag</Label>
                        <div className="flex gap-2">
                          <Input
                            id="tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Enter tag"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddTag()
                              }
                            }}
                          />
                          <Button type="button" onClick={handleAddTag} variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {values.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {values.tags.map((tag, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-sm"
                            >
                              <span>{tag}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4"
                                onClick={() => handleRemoveTag(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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
                          id="isFeatured"
                          name="isFeatured"
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="isFeatured" className="cursor-pointer">
                          Featured Product
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Field
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="isActive" className="cursor-pointer">
                          Active (visible to customers)
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link href="/admin/products">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading || isSubmitting}>
                  {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading || isSubmitting ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

