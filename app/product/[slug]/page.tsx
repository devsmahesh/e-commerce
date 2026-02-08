'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetProductBySlugQuery } from '@/store/api/productsApi'
import { useGetReviewsQuery, useCreateReviewMutation, useUpdateReviewMutation, useDeleteReviewMutation } from '@/store/api/reviewsApi'
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery, useGetProfileQuery } from '@/store/api/usersApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'
import { formatPrice } from '@/lib/utils'
import { Star, Plus, Minus, Heart, Share2, MessageSquare, Edit2, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'
import { tokenManager } from '@/lib/token'
import { LoginModal } from '@/components/auth/login-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ROUTES } from '@/lib/constants'
import { ProductVariants } from '@/components/shop/product-variants'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ProductVariant } from '@/types'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const { data: product, isLoading } = useGetProductBySlugQuery(slug)
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const currentUser = useAppSelector((state) => state.auth.user)
  const { data: profileUser } = useGetProfileQuery(undefined, {
    skip: !mounted || !tokenManager.getAccessToken() || !!currentUser,
  })
  const user = currentUser || profileUser
  const hasAuth = mounted && (isAuthenticated || tokenManager.getAccessToken())

  // Wishlist hooks
  const { data: wishlist = [] } = useGetWishlistQuery(undefined, {
    skip: !hasAuth,
  })
  const [addToWishlist] = useAddToWishlistMutation()
  const [removeFromWishlist] = useRemoveFromWishlistMutation()

  // Reviews hooks - fetch all reviews (approved + user's own pending)
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetReviewsQuery(
    { productId: product?.id, approvedOnly: false },
    { skip: !product?.id }
  )
  const [createReview, { isLoading: isCreatingReview }] = useCreateReviewMutation()
  const [updateReview, { isLoading: isUpdatingReview }] = useUpdateReviewMutation()
  const [deleteReview, { isLoading: isDeletingReview }] = useDeleteReviewMutation()

  // Filter reviews: show approved reviews + user's own pending reviews
  const allReviews = reviewsData?.data || []
  const reviews = allReviews.filter((review: any) => {
    // Show approved reviews to everyone
    if (review.status === 'approved') return true
    // Show pending reviews only to the user who created them
    if (review.status === 'pending' && hasAuth && user && review.userId === user.id) return true
    // Don't show rejected reviews
    return false
  })
  const isInWishlist = product ? wishlist.some((item) => item.id === product.id) : false

  useEffect(() => {
    setMounted(true)
  }, [])

  // Set default variant when product loads
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0]
      setSelectedVariant(defaultVariant)
    }
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    
    const price = selectedVariant ? selectedVariant.price : product.price
    const variantId = selectedVariant?.id
    const variantName = selectedVariant?.name

    dispatch(
      addItem({
        id: `${product.id}-${variantId || 'default'}-${Date.now()}`,
        product,
        quantity,
        price,
        variantId,
        variantName,
      })
    )
    toast({
      title: 'Added to cart',
      description: `${product.name}${variantName ? ` (${variantName})` : ''} has been added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    if (!product) return

    // Check authentication first
    if (!hasAuth) {
      setShowLoginModal(true)
      return
    }

    const price = selectedVariant ? selectedVariant.price : product.price
    const variantId = selectedVariant?.id
    const variantName = selectedVariant?.name

    // Add product to cart only if user is logged in
    dispatch(
      addItem({
        id: `${product.id}-${variantId || 'default'}-${Date.now()}`,
        product,
        quantity,
        price,
        variantId,
        variantName,
      })
    )
    
    // Navigate to checkout
    router.push(ROUTES.CHECKOUT)
  }

  const handleWishlistToggle = async () => {
    if (!product) return

    if (!hasAuth) {
      setShowLoginModal(true)
      return
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id).unwrap()
        toast({
          title: 'Removed from wishlist',
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        await addToWishlist(product.id).unwrap()
        toast({
          title: 'Added to wishlist',
          description: `${product.name} has been added to your wishlist.`,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update wishlist.',
        variant: 'destructive',
      })
    }
  }

  const handleShare = async () => {
    if (!product) return

    const shareData = {
      title: product.name,
      text: product.description,
      url: typeof window !== 'undefined' ? window.location.href : '',
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast({
          title: 'Shared successfully',
          description: 'Product link has been shared.',
        })
      } else {
        // Fallback: Copy to clipboard
        if (typeof window !== 'undefined') {
          await navigator.clipboard.writeText(window.location.href)
          toast({
            title: 'Link copied',
            description: 'Product link has been copied to clipboard.',
          })
        }
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        if (typeof window !== 'undefined') {
          try {
            await navigator.clipboard.writeText(window.location.href)
            toast({
              title: 'Link copied',
              description: 'Product link has been copied to clipboard.',
            })
          } catch (clipboardError) {
            toast({
              title: 'Share failed',
              description: 'Unable to share or copy link.',
              variant: 'destructive',
            })
          }
        }
      }
    }
  }

  const handleSubmitReview = async () => {
    if (!product || !hasAuth) {
      setShowLoginModal(true)
      return
    }

    if (!reviewComment.trim()) {
      toast({
        title: 'Review required',
        description: 'Please enter a review comment.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (editingReview) {
        // Update existing review
        await updateReview({
          id: editingReview,
          data: {
            rating: reviewRating,
            comment: reviewComment,
          },
        }).unwrap()
        toast({
          title: 'Review updated',
          description: 'Your review has been updated and is pending approval.',
        })
      } else {
        // Create new review
        await createReview({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }).unwrap()
        toast({
          title: 'Review submitted',
          description: 'Your review has been submitted and is pending approval.',
        })
      }
      setReviewComment('')
      setReviewRating(5)
      setShowReviewForm(false)
      setEditingReview(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to submit review.',
        variant: 'destructive',
      })
    }
  }

  const handleEditReview = (review: any) => {
    if (!hasAuth) {
      setShowLoginModal(true)
      return
    }
    setEditingReview(review.id)
    setReviewRating(review.rating)
    setReviewComment(review.comment)
    setShowReviewForm(true)
    // Scroll to review form
    setTimeout(() => {
      const formElement = document.getElementById('review-form')
      formElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
    setReviewComment('')
    setReviewRating(5)
    setShowReviewForm(false)
  }

  const handleDeleteReview = async () => {
    if (!reviewToDelete || !hasAuth) {
      return
    }

    try {
      await deleteReview(reviewToDelete).unwrap()
      toast({
        title: 'Review deleted',
        description: 'Your review has been deleted successfully.',
      })
      setReviewToDelete(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete review.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Product not found</h1>
            </div>
          </div>
        </main>
        <Footer />
        <CartDrawer />
      </>
    )
  }

  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={
                    (product.images && Array.isArray(product.images) && product.images.length > 0)
                      ? (product.images[selectedImage] || product.images[0])
                      : '/placeholder-product.jpg'
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {product.images && Array.isArray(product.images) && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                        selectedImage === index
                          ? 'border-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12.5vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold">{product.name}</h1>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <ProductVariants
                  variants={product.variants}
                  selectedVariantId={selectedVariant?.id}
                  onSelectVariant={setSelectedVariant}
                />
              )}

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold">
                  {formatPrice(selectedVariant ? selectedVariant.price : product.price)}
                </span>
                {(selectedVariant?.compareAtPrice || product.compareAtPrice) && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(selectedVariant?.compareAtPrice || product.compareAtPrice || 0)}
                    </span>
                    <span className="rounded-lg bg-destructive/10 px-2 py-1 text-sm font-semibold text-destructive">
                      -{selectedVariant 
                        ? Math.round(((selectedVariant.compareAtPrice || 0) - selectedVariant.price) / (selectedVariant.compareAtPrice || 1) * 100)
                        : discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-muted-foreground">{product.description}</p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={selectedVariant ? selectedVariant.stock : product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(selectedVariant ? selectedVariant.stock : product.stock, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.min(selectedVariant ? selectedVariant.stock : product.stock, q + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedVariant ? selectedVariant.stock : product.stock} in stock
                  </span>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={(selectedVariant ? selectedVariant.stock : product.stock) === 0}
                  >
                    {(selectedVariant ? selectedVariant.stock : product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-primary text-primary-foreground"
                    onClick={handleBuyNow}
                    disabled={(selectedVariant ? selectedVariant.stock : product.stock) === 0}
                  >
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleWishlistToggle}
                    className={isInWishlist ? 'border-accent text-accent' : ''}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${isInWishlist ? 'fill-accent text-accent' : ''}`} />
                    {isInWishlist ? 'In Wishlist' : 'Wishlist'}
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleShare}>
                    <Share2 className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Product Information</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold">SKU:</span> {product.sku}
                    </div>
                    <div>
                      <span className="font-semibold">Category:</span> {product.category.name}
                    </div>
                    {product.brand && (
                      <div>
                        <span className="font-semibold">Brand:</span> {product.brand}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Ghee Specifications */}
              {(product.gheeType || product.weight || product.purity || product.origin || product.shelfLife) && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="mb-4 text-lg font-semibold">Ghee Specifications</h3>
                    <div className="space-y-4">
                      {product.gheeType && (
                        <div>
                          <span className="font-semibold">Ghee Type:</span>{' '}
                          <span className="capitalize">{product.gheeType} Ghee</span>
                        </div>
                      )}
                      {product.weight && (
                        <div>
                          <span className="font-semibold">Weight:</span>{' '}
                          {product.weight >= 1000 
                            ? `${(product.weight / 1000).toFixed(1)} kg` 
                            : `${product.weight} g`}
                        </div>
                      )}
                      {product.purity && (
                        <div>
                          <span className="font-semibold">Purity:</span> {product.purity}%
                        </div>
                      )}
                      {product.origin && (
                        <div>
                          <span className="font-semibold">Origin:</span> {product.origin}
                        </div>
                      )}
                      {product.shelfLife && (
                        <div>
                          <span className="font-semibold">Shelf Life:</span> {product.shelfLife}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Collapsible Sections */}
              {product.details && (
                <Card>
                  <CardContent className="pt-6">
                    <Accordion type="single" collapsible className="w-full">
                      {product.details.whyChooseUs?.enabled && (
                        <AccordionItem value="why-choose-us">
                          <AccordionTrigger className="text-lg font-semibold text-green-700 dark:text-green-400">
                            {product.details.whyChooseUs.title || 'Why Choose Our Pure and Natural A2 Desi Cow Ghee | Crafted Using Traditional Vedic Bilona Method?'}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="text-muted-foreground whitespace-pre-line">
                              {product.details.whyChooseUs.content}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {product.details.keyBenefits?.enabled && (
                        <AccordionItem value="key-benefits">
                          <AccordionTrigger className="text-lg font-semibold text-green-700 dark:text-green-400">
                            {product.details.keyBenefits.title || 'Key Benefits'}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="text-muted-foreground whitespace-pre-line">
                              {product.details.keyBenefits.content}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                      {product.details.refundPolicy?.enabled && (
                        <AccordionItem value="refund-policy">
                          <AccordionTrigger className="text-lg font-semibold text-green-700 dark:text-green-400">
                            {product.details.refundPolicy.title || 'Refund Policy'}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="text-muted-foreground whitespace-pre-line">
                              {product.details.refundPolicy.content}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12">
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Reviews ({reviews.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Write Review Form */}
                      {!hasAuth ? (
                        <div className="rounded-lg border p-4 text-center">
                          <p className="mb-4 text-muted-foreground">
                            Please login to write a review
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setShowLoginModal(true)}
                            className="w-full"
                          >
                            Login to Review
                          </Button>
                        </div>
                      ) : (
                        <div>
                          {!showReviewForm ? (
                            <Button
                              variant="outline"
                              onClick={() => setShowReviewForm(true)}
                              className="w-full"
                            >
                              Write a Review
                            </Button>
                          ) : (
                            <div id="review-form" className="space-y-4 rounded-lg border p-4">
                              <h3 className="text-lg font-semibold">
                                {editingReview ? 'Edit Your Review' : 'Write a Review'}
                              </h3>
                              <div>
                                <Label htmlFor="rating">Rating</Label>
                                <div className="flex items-center gap-2 mt-2">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => setReviewRating(i + 1)}
                                      className="focus:outline-none"
                                    >
                                      <Star
                                        className={`h-6 w-6 transition-colors ${
                                          i < reviewRating
                                            ? 'fill-accent text-accent'
                                            : 'text-muted-foreground'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                  <span className="ml-2 text-sm text-muted-foreground">
                                    {reviewRating} out of 5
                                  </span>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="comment">Your Review</Label>
                                <Textarea
                                  id="comment"
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  placeholder="Share your experience with this product..."
                                  className="mt-2"
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleSubmitReview}
                                  disabled={isCreatingReview || isUpdatingReview}
                                  className="flex-1"
                                >
                                  {isCreatingReview || isUpdatingReview
                                    ? editingReview
                                      ? 'Updating...'
                                      : 'Submitting...'
                                    : editingReview
                                      ? 'Update Review'
                                      : 'Submit Review'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reviews List */}
                      {isLoadingReviews ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-20 w-full" />
                            </div>
                          ))}
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    {review.user?.avatar ? (
                                      <Image
                                        src={review.user.avatar}
                                        alt={review.user.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                      />
                                    ) : (
                                      <span className="text-sm font-semibold">
                                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                                      {review.status === 'pending' && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                          Pending
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < review.rating
                                              ? 'fill-accent text-accent'
                                              : 'text-muted-foreground'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-start justify-between mt-2">
                                <p className="text-muted-foreground flex-1">{review.comment}</p>
                                {hasAuth && user && review.userId === user.id && (
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditReview(review)}
                                      className="h-8 px-2"
                                      title="Edit review"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setReviewToDelete(review.id)}
                                      className="h-8 px-2 text-destructive hover:text-destructive"
                                      title="Delete review"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onCancel={() => setShowLoginModal(false)}
      />
      <ConfirmDialog
        open={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteReview}
        variant="destructive"
      />
    </>
  )
}

