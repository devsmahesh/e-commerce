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
import { useGetProductByIdQuery, useUpdateProductMutation, useUploadProductImageMutation } from '@/store/api/productsApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Plus, X, Loader2, Upload, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import { ProductVariant, ProductDetails } from '@/types'

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
    .of(Yup.string().nullable()) // Allow any string or null (URLs or relative paths)
    .nullable() // Allow null/undefined
    .test('images-optional', '', function(value) {
      // Skip Yup validation - we'll validate in handleSubmit to account for selected files
      // This allows the form to be valid even if only files are selected (not yet uploaded)
      return true
    }),
  tags: Yup.array().of(Yup.string()),
  isFeatured: Yup.boolean(),
  isActive: Yup.boolean(),
  // Ghee-specific fields
  gheeType: Yup.string().oneOf(['cow', 'buffalo', 'mixed', ''], 'Invalid ghee type'),
  weight: Yup.number().positive('Weight must be positive'),
  purity: Yup.number().min(0).max(100, 'Purity must be between 0 and 100'),
  origin: Yup.string(),
  shelfLife: Yup.string(),
  compareAtPrice: Yup.number().min(0),
  sku: Yup.string(),
  brand: Yup.string(),
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
  const [uploadProductImage, { isLoading: isUploading }] = useUploadProductImageMutation()
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [filePreviews, setFilePreviews] = React.useState<{ file: File; preview: string }[]>([])
  const [tagInput, setTagInput] = React.useState('')
  const [showVariants, setShowVariants] = React.useState(false)
  const [showDetails, setShowDetails] = React.useState(false)

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
        // Ghee-specific fields
        gheeType: '' as 'cow' | 'buffalo' | 'mixed' | '',
        weight: '',
        purity: '',
        origin: '',
        shelfLife: '',
        compareAtPrice: '',
        sku: '',
        brand: '',
        // Variants and details
        variants: [] as ProductVariant[],
        details: {
          whyChooseUs: { title: '', content: '', enabled: false },
          keyBenefits: { title: '', content: '', enabled: false },
          refundPolicy: { title: '', content: '', enabled: false },
        } as ProductDetails,
      }
    }

    const productVariants = (product as any).variants || []
    const productDetails = (product as any).details || {}

    return {
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      stock: String(product.stock || ''),
      categoryId: product.category?.id || (product as any).categoryId?._id || (product as any).categoryId || '',
      images: product.images || [],
      tags: (product as any).tags || [],
      isFeatured: product.featured === true || (product as any).isFeatured === true, // Check both featured and isFeatured fields
      isActive: (product as any).isActive !== undefined ? (product as any).isActive : true,
      // Ghee-specific fields
      gheeType: (product as any).gheeType || '',
      weight: (product as any).weight ? String((product as any).weight) : '',
      purity: (product as any).purity ? String((product as any).purity) : '',
      origin: (product as any).origin || '',
      shelfLife: (product as any).shelfLife || '',
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
      sku: product.sku || '',
      brand: product.brand || '',
      // Variants and details
      variants: productVariants.length > 0 ? productVariants : [] as ProductVariant[],
      details: {
        whyChooseUs: productDetails.whyChooseUs || { title: '', content: '', enabled: false },
        keyBenefits: productDetails.keyBenefits || { title: '', content: '', enabled: false },
        refundPolicy: productDetails.refundPolicy || { title: '', content: '', enabled: false },
      } as ProductDetails,
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate files
    const validFiles: File[] = []
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image file.`,
          variant: 'destructive',
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 5MB.`,
          variant: 'destructive',
        })
        return
      }

      validFiles.push(file)
    })

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreviews((prev) => [...prev, { file, preview: reader.result as string }])
      }
      reader.readAsDataURL(file)
    })

    setSelectedFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setFilePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (values: ReturnType<typeof getInitialValues>, formikHelpers: any) => {
    if (!productId) return

    // Validate that we have at least one image (either existing or files to upload)
    if (values.images.length === 0 && selectedFiles.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one image is required. Please upload an image file.',
        variant: 'destructive',
      })
      return
    }

    try {
      let imageUrls = [...values.images]

      // Upload files if any are selected
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const formData = new FormData()
          formData.append('image', file)
          
          try {
            const uploadResult = await uploadProductImage(formData).unwrap()
            return uploadResult.url || (uploadResult as any).data?.url
          } catch (uploadError: any) {
            console.error('Upload error:', uploadError)
            toast({
              title: 'Upload Error',
              description: `Failed to upload ${file.name}: ${uploadError?.data?.message || uploadError?.message || 'Unknown error'}`,
              variant: 'destructive',
            })
            throw uploadError
          }
        })

        try {
          const uploadedUrls = await Promise.all(uploadPromises)
          imageUrls = [...imageUrls, ...uploadedUrls.filter(Boolean)]
        } catch (error) {
          // Error already handled in toast
          return
        }
      }

      await updateProduct({
        id: productId,
        data: {
          name: values.name,
          description: values.description,
          price: parseFloat(values.price as string),
          stock: parseInt(values.stock as string),
          categoryId: values.categoryId,
          images: imageUrls,
          tags: values.tags.length > 0 ? values.tags : undefined,
          isFeatured: values.isFeatured,
          isActive: values.isActive,
          // Ghee-specific fields
          gheeType: values.gheeType ? (values.gheeType as 'cow' | 'buffalo' | 'mixed') : undefined,
          weight: values.weight ? parseFloat(values.weight as string) : undefined,
          purity: values.purity ? parseFloat(values.purity as string) : undefined,
          origin: values.origin || undefined,
          shelfLife: values.shelfLife || undefined,
          compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice as string) : undefined,
          sku: values.sku || undefined,
          brand: values.brand || undefined,
          // Variants and details
          variants: values.variants && values.variants.length > 0 ? values.variants.map(v => ({
            name: v.name,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
            sku: v.sku,
            tags: v.tags || [],
            isDefault: v.isDefault || false,
          })) : undefined,
          details: showDetails ? {
            whyChooseUs: values.details.whyChooseUs?.enabled ? {
              title: values.details.whyChooseUs.title || undefined,
              content: values.details.whyChooseUs.content,
              enabled: true,
            } : undefined,
            keyBenefits: values.details.keyBenefits?.enabled ? {
              title: values.details.keyBenefits.title || undefined,
              content: values.details.keyBenefits.content,
              enabled: true,
            } : undefined,
            refundPolicy: values.details.refundPolicy?.enabled ? {
              title: values.details.refundPolicy.title || undefined,
              content: values.details.refundPolicy.content,
              enabled: true,
            } : undefined,
          } : undefined,
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
          <h1 className="text-4xl font-bold text-slate-900">Edit Ghee Product</h1>
          <p className="mt-2 text-slate-600">Update ghee product information</p>
        </div>
      </div>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={productSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => {
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
            const newTags = values.tags.filter((_: any, i: number) => i !== index)
            setFieldValue('tags', newTags)
          }

          // Variant management functions
          const handleAddVariant = () => {
            const newVariant: ProductVariant = {
              id: `temp-${Date.now()}`,
              name: '',
              price: 0,
              stock: 0,
              tags: [],
              isDefault: values.variants.length === 0, // First variant is default
            }
            setFieldValue('variants', [...values.variants, newVariant])
            setShowVariants(true)
          }

          const handleRemoveVariant = (index: number) => {
            const newVariants = values.variants.filter((_, i) => i !== index)
            // If removed variant was default, make first variant default
            if (values.variants[index].isDefault && newVariants.length > 0) {
              newVariants[0].isDefault = true
            }
            setFieldValue('variants', newVariants)
          }

          const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
            const newVariants = [...values.variants]
            newVariants[index] = { ...newVariants[index], [field]: value }
            // If setting as default, unset others
            if (field === 'isDefault' && value === true) {
              newVariants.forEach((v, i) => {
                if (i !== index) v.isDefault = false
              })
            }
            setFieldValue('variants', newVariants)
          }

          const handleAddVariantTag = (variantIndex: number, tag: string) => {
            const newVariants = [...values.variants]
            const variant = newVariants[variantIndex]
            if (!variant.tags) variant.tags = []
            if (!variant.tags.includes(tag)) {
              variant.tags.push(tag)
            }
            setFieldValue('variants', newVariants)
          }

          const handleRemoveVariantTag = (variantIndex: number, tagIndex: number) => {
            const newVariants = [...values.variants]
            newVariants[variantIndex].tags = newVariants[variantIndex].tags?.filter((_, i) => i !== tagIndex) || []
            setFieldValue('variants', newVariants)
          }

          // Auto-show variants/details if they exist
          React.useEffect(() => {
            if (values.variants && values.variants.length > 0) {
              setShowVariants(true)
            }
            if (values.details && (
              values.details.whyChooseUs?.enabled ||
              values.details.keyBenefits?.enabled ||
              values.details.refundPolicy?.enabled
            )) {
              setShowDetails(true)
            }
          }, [values.variants, values.details])

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
                          <p className="text-sm text-destructive">{String(errors.categoryId)}</p>
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
                        <Label htmlFor="compareAtPrice">Compare At Price</Label>
                        <Field
                          as={Input}
                          id="compareAtPrice"
                          name="compareAtPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                        <ErrorMessage name="compareAtPrice" component="p" className="text-sm text-destructive" />
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

                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Field
                          as={Input}
                          id="sku"
                          name="sku"
                          placeholder="Product SKU"
                        />
                        <ErrorMessage name="sku" component="p" className="text-sm text-destructive" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Field
                          as={Input}
                          id="brand"
                          name="brand"
                          placeholder="Brand name"
                        />
                        <ErrorMessage name="brand" component="p" className="text-sm text-destructive" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Ghee Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="gheeType">Ghee Type</Label>
                        <Select
                          value={values.gheeType || 'none'}
                          onValueChange={(value) => setFieldValue('gheeType', value === 'none' ? '' : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ghee type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="cow">Cow Ghee</SelectItem>
                            <SelectItem value="buffalo">Buffalo Ghee</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                        <ErrorMessage name="gheeType" component="p" className="text-sm text-destructive" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (grams)</Label>
                        <Field
                          as={Input}
                          id="weight"
                          name="weight"
                          type="number"
                          min="0"
                          placeholder="e.g., 500"
                        />
                        <ErrorMessage name="weight" component="p" className="text-sm text-destructive" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purity">Purity (%)</Label>
                        <Field
                          as={Input}
                          id="purity"
                          name="purity"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="e.g., 99.9"
                        />
                        <ErrorMessage name="purity" component="p" className="text-sm text-destructive" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="origin">Origin/Region</Label>
                        <Field
                          as={Input}
                          id="origin"
                          name="origin"
                          placeholder="e.g., Punjab, India"
                        />
                        <ErrorMessage name="origin" component="p" className="text-sm text-destructive" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shelfLife">Shelf Life</Label>
                        <Field
                          as={Input}
                          id="shelfLife"
                          name="shelfLife"
                          placeholder="e.g., 12 months"
                        />
                        <ErrorMessage name="shelfLife" component="p" className="text-sm text-destructive" />
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
                        <Label htmlFor="imageFiles">Upload Images *</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              id="imageFiles"
                              accept="image/*"
                              multiple
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="imageFiles"
                              className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <Upload className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {selectedFiles.length > 0 
                                  ? `${selectedFiles.length} file(s) selected`
                                  : 'Choose image files'}
                              </span>
                            </label>
                          </div>
                          {filePreviews.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {filePreviews.map((item, index) => (
                                <div key={index} className="relative group rounded-lg border border-gray-200 overflow-hidden bg-muted">
                                  <div className="relative aspect-square w-full">
                                    <Image
                                      src={item.preview}
                                      alt={`Preview ${index + 1}`}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 50vw, 150px"
                                    />
                                  </div>
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleRemoveFile(index)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="p-1 bg-background/80 backdrop-blur-sm">
                                    <p className="text-xs text-muted-foreground truncate">{item.file.name}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB per file
                          </p>
                        </div>
                      </div>

                      {values.images.length > 0 && (
                        <div className="space-y-2">
                          <Label>Added Images ({values.images.length})</Label>
                          <div className="grid grid-cols-2 gap-4">
                            {values.images.map((image, index) => (
                              <div key={index} className="relative group rounded-lg border border-border overflow-hidden bg-muted">
                                <div className="relative aspect-square w-full">
                                  <Image
                                    src={image}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 200px"
                                  />
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="p-2 bg-background/80 backdrop-blur-sm">
                                  <p className="text-xs text-muted-foreground truncate">{image}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {errors.images && touched.images && values.images.length === 0 && selectedFiles.length === 0 && (
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
                          {values.tags.map((tag: string, index: number) => (
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
                        <input
                          type="checkbox"
                          id="isFeatured"
                          name="isFeatured"
                          checked={values.isFeatured}
                          onChange={(e) => setFieldValue('isFeatured', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <Label htmlFor="isFeatured" className="cursor-pointer">
                          Featured Product
                        </Label>
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
                          Active (visible to customers)
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Variants Section */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-900">Variants (Optional)</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowVariants(!showVariants)
                            if (!showVariants && values.variants.length === 0) {
                              handleAddVariant()
                            }
                          }}
                        >
                          {showVariants ? 'Hide' : 'Show'} Variants
                        </Button>
                      </div>
                    </CardHeader>
                    {showVariants && (
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Add different sizes/variants with their own prices and stock. If no variants are added, the product will use the base price and stock.
                        </p>
                        {values.variants.length > 0 && (
                          <div className="space-y-4">
                            {values.variants.map((variant, index) => (
                              <div key={variant.id || index} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">Variant {index + 1}</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={variant.isDefault || false}
                                        onChange={(e) => handleUpdateVariant(index, 'isDefault', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                      />
                                      <Label className="text-xs cursor-pointer">Default</Label>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveVariant(index)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Variant Name *</Label>
                                    <Input
                                      value={variant.name}
                                      onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)}
                                      placeholder="e.g., 1 Ltr, 500 ml"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>SKU</Label>
                                    <Input
                                      value={variant.sku || ''}
                                      onChange={(e) => handleUpdateVariant(index, 'sku', e.target.value)}
                                      placeholder="e.g., PROD-1L"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Price (₹) *</Label>
                                    <Input
                                      type="number"
                                      value={variant.price || ''}
                                      onChange={(e) => handleUpdateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                      placeholder="0"
                                      min="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Compare At Price (₹)</Label>
                                    <Input
                                      type="number"
                                      value={variant.compareAtPrice || ''}
                                      onChange={(e) => handleUpdateVariant(index, 'compareAtPrice', parseFloat(e.target.value) || undefined)}
                                      placeholder="0"
                                      min="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Stock *</Label>
                                    <Input
                                      type="number"
                                      value={variant.stock || ''}
                                      onChange={(e) => handleUpdateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                      min="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="flex gap-2">
                                      <Select
                                        value=""
                                        onValueChange={(value) => {
                                          if (value) handleAddVariantTag(index, value)
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Add tag" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="BEST SELLER">BEST SELLER</SelectItem>
                                          <SelectItem value="MONEY SAVER">MONEY SAVER</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {variant.tags && variant.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {variant.tags.map((tag, tagIndex) => (
                                          <div
                                            key={tagIndex}
                                            className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs"
                                          >
                                            <span>{tag}</span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="h-3 w-3"
                                              onClick={() => handleRemoveVariantTag(index, tagIndex)}
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddVariant}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Variant
                        </Button>
                      </CardContent>
                    )}
                  </Card>

                  {/* Product Details Section */}
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-900">Managing Details (Optional)</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDetails(!showDetails)}
                        >
                          {showDetails ? 'Hide' : 'Show'} Details
                        </Button>
                      </div>
                    </CardHeader>
                    {showDetails && (
                      <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                          Configure collapsible sections that will appear on the product page. Enable the sections you want to show.
                        </p>

                        {/* Why Choose Us */}
                        <div className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Why Choose Us</Label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={values.details.whyChooseUs?.enabled || false}
                                onChange={(e) => setFieldValue('details.whyChooseUs.enabled', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label className="text-sm cursor-pointer">Enable</Label>
                            </div>
                          </div>
                          {values.details.whyChooseUs?.enabled && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Title (Optional)</Label>
                                <Input
                                  value={values.details.whyChooseUs.title || ''}
                                  onChange={(e) => setFieldValue('details.whyChooseUs.title', e.target.value)}
                                  placeholder="Leave empty for default title"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Content *</Label>
                                <Textarea
                                  value={values.details.whyChooseUs.content || ''}
                                  onChange={(e) => setFieldValue('details.whyChooseUs.content', e.target.value)}
                                  placeholder="Enter content for Why Choose Us section..."
                                  rows={6}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Key Benefits */}
                        <div className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Key Benefits</Label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={values.details.keyBenefits?.enabled || false}
                                onChange={(e) => setFieldValue('details.keyBenefits.enabled', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label className="text-sm cursor-pointer">Enable</Label>
                            </div>
                          </div>
                          {values.details.keyBenefits?.enabled && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Title (Optional)</Label>
                                <Input
                                  value={values.details.keyBenefits.title || ''}
                                  onChange={(e) => setFieldValue('details.keyBenefits.title', e.target.value)}
                                  placeholder="Leave empty for default title"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Content *</Label>
                                <Textarea
                                  value={values.details.keyBenefits.content || ''}
                                  onChange={(e) => setFieldValue('details.keyBenefits.content', e.target.value)}
                                  placeholder="Enter key benefits..."
                                  rows={6}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Refund Policy */}
                        <div className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Refund Policy</Label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={values.details.refundPolicy?.enabled || false}
                                onChange={(e) => setFieldValue('details.refundPolicy.enabled', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label className="text-sm cursor-pointer">Enable</Label>
                            </div>
                          </div>
                          {values.details.refundPolicy?.enabled && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Title (Optional)</Label>
                                <Input
                                  value={values.details.refundPolicy.title || ''}
                                  onChange={(e) => setFieldValue('details.refundPolicy.title', e.target.value)}
                                  placeholder="Leave empty for default title"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Content *</Label>
                                <Textarea
                                  value={values.details.refundPolicy.content || ''}
                                  onChange={(e) => setFieldValue('details.refundPolicy.content', e.target.value)}
                                  placeholder="Enter refund policy details..."
                                  rows={6}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link href="/admin/products">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading || isSubmitting || isUploading}>
                  {(isLoading || isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading || isSubmitting || isUploading ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

