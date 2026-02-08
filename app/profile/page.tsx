'use client'

import React, { useMemo } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGetProfileQuery, useUpdateProfileMutation, useGetAddressesQuery, useAddAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation, useUploadAvatarMutation, useGetWishlistQuery, useRemoveFromWishlistMutation, useChangePasswordMutation } from '@/store/api/usersApi'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Camera, Edit, Trash2, Heart, User as UserIcon, MapPin, Lock, Eye, EyeOff } from 'lucide-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Address, Product, User } from '@/types'
import { ProductCard } from '@/components/shop/product-card'
import { addItem } from '@/store/slices/cartSlice'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import { getImageUrl, getUserInitials } from '@/lib/utils'

const profileSchema = Yup.object().shape({
  firstName: Yup.string().min(1, 'First name is required').required('First name is required'),
  lastName: Yup.string().min(1, 'Last name is required').required('Last name is required'),
  phone: Yup.string().optional(),
})

const addressSchema = Yup.object().shape({
  street: Yup.string().min(1, 'Street address is required').required('Street address is required'),
  city: Yup.string().min(1, 'City is required').required('City is required'),
  state: Yup.string().min(1, 'State is required').required('State is required'),
  zipCode: Yup.string().min(1, 'Zip code is required').required('Zip code is required'),
  country: Yup.string().min(1, 'Country is required').required('Country is required'),
  label: Yup.string().optional(),
  isDefault: Yup.boolean().optional(),
})

const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], "Passwords don't match")
    .required('Please confirm your new password'),
})

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { data: user, isLoading: isLoadingUser, refetch: refetchProfile } = useGetProfileQuery()
  const authUser = useAppSelector((state) => state.auth.user)
  const { data: addressesFromApi } = useGetAddressesQuery()
  const { data: wishlistItems = [], isLoading: isLoadingWishlist } = useGetWishlistQuery()
  const [removeFromWishlist] = useRemoveFromWishlistMutation()
  
  // Use API user data if available, otherwise fall back to auth user
  const displayUser = user || authUser
  
  // Use addresses from API, or fallback to addresses from user object
  const addresses = React.useMemo(() => {
    if (addressesFromApi && addressesFromApi.length > 0) {
      return addressesFromApi.map((addr: any) => ({
        ...addr,
        _id: addr._id || addr.id, // Preserve _id for API calls
      }))
    }
    const userWithAddresses = user as User & { addresses?: Address[] }
    if (userWithAddresses?.addresses && Array.isArray(userWithAddresses.addresses) && userWithAddresses.addresses.length > 0) {
      return userWithAddresses.addresses.map((addr: any) => ({
        ...addr,
        id: addr._id || addr.id || '',
        _id: addr._id || addr.id || '', // Preserve _id for API calls
      }))
    }
    return []
  }, [addressesFromApi, user])

  // Refetch profile data when component mounts
  React.useEffect(() => {
    refetchProfile()
  }, [refetchProfile])
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation()
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAvatarMutation()
  const [createAddress, { isLoading: creatingAddress }] = useAddAddressMutation()
  const [updateAddress, { isLoading: updatingAddress }] = useUpdateAddressMutation()
  const [deleteAddress, { isLoading: deletingAddress }] = useDeleteAddressMutation()
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation()
  const { toast } = useToast()
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [editingAddressId, setEditingAddressId] = React.useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [addressToDelete, setAddressToDelete] = React.useState<string | null>(null)
  const [addressToDeleteOriginalId, setAddressToDeleteOriginalId] = React.useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const getProfileInitialValues = () => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  })

  const getAddressInitialValues = () => {
    if (editingAddressId) {
      const addressToEdit = addresses.find(addr => 
        addr.id === editingAddressId || (addr as any)._id === editingAddressId
      )
      if (addressToEdit) {
        return {
          street: addressToEdit.street || '',
          city: addressToEdit.city || '',
          state: addressToEdit.state || '',
          zipCode: addressToEdit.zipCode || '',
          country: addressToEdit.country || 'United States',
          label: addressToEdit.label || '',
          isDefault: addressToEdit.isDefault || false,
        }
      }
    }
    if (addresses && addresses.length > 0 && !editingAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault)
      if (defaultAddress) {
        return {
          street: defaultAddress.street || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          zipCode: defaultAddress.zipCode || '',
          country: defaultAddress.country || 'United States',
          label: defaultAddress.label || '',
          isDefault: defaultAddress.isDefault || false,
        }
      }
    }
    return {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      label: '',
      isDefault: false,
    }
  }

  const handleProfileSubmit = async (values: { firstName: string; lastName: string; phone?: string }) => {
    try {
      await updateProfile(values).unwrap()
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      })
    }
  }

  const handleAddressSubmit = async (
    values: { street: string; city: string; state: string; zipCode: string; country: string; label?: string; isDefault?: boolean },
    { resetForm }: { resetForm: (values?: any) => void }
  ) => {
    try {
      if (editingAddressId) {
        // Find the address to get the _id for the API call
        const addressToUpdate = addresses.find(addr => addr.id === editingAddressId || (addr as any)._id === editingAddressId)
        const addressIdForApi = addressToUpdate ? ((addressToUpdate as any)._id || addressToUpdate.id) : editingAddressId
        
        // Update existing address
        await updateAddress({ id: addressIdForApi, data: values }).unwrap()
        toast({
          title: 'Address updated',
          description: 'Your address has been updated successfully.',
        })
        setEditingAddressId(null)
      } else {
        // Create new address
        await createAddress(values).unwrap()
        toast({
          title: 'Address added',
          description: 'Your address has been added successfully.',
        })
      }
      resetForm({
        values: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States',
          label: '',
          isDefault: false,
        },
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || `Failed to ${editingAddressId ? 'update' : 'add'} address`,
        variant: 'destructive',
      })
    }
  }

  const handleEditAddress = (address: Address) => {
    // Use id for state management, but we'll get _id when submitting
    const addressId = address.id || (address as any)._id
    if (!addressId) {
      toast({
        title: 'Error',
        description: 'Invalid address ID',
        variant: 'destructive',
      })
      return
    }
    setEditingAddressId(addressId)
    // Scroll to form
    document.getElementById('address-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCancelEdit = () => {
    setEditingAddressId(null)
  }

  const handleDeleteClick = (address: Address) => {
    // Get the ID to use for deletion - prefer _id, fallback to id
    const addressId = (address as any)._id || address.id
    
    if (!addressId) {
      toast({
        title: 'Error',
        description: 'Invalid address ID',
        variant: 'destructive',
      })
      return
    }
    
    setAddressToDelete(address.id || addressId)
    setAddressToDeleteOriginalId(addressId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    // Use original _id if available, otherwise use transformed id
    const idToDelete = addressToDeleteOriginalId || addressToDelete
    
    if (!idToDelete) {
      toast({
        title: 'Error',
        description: 'No address selected for deletion',
        variant: 'destructive',
      })
      setDeleteDialogOpen(false)
      return
    }
    
    try {
      await deleteAddress(idToDelete).unwrap()
      
      toast({
        title: 'Address deleted',
        description: 'Your address has been deleted successfully.',
      })
      
      // Clear editing state if the deleted address was being edited
      if (editingAddressId === addressToDelete) {
        setEditingAddressId(null)
      }
      
      setDeleteDialogOpen(false)
      setAddressToDelete(null)
      setAddressToDeleteOriginalId(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || error?.message || 'Failed to delete address',
        variant: 'destructive',
      })
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload avatar
      const formData = new FormData()
      formData.append('avatar', file)
      handleAvatarUpload(formData)
    }
  }

  const handleAvatarUpload = async (formData: FormData) => {
    try {
      await uploadAvatar(formData).unwrap()
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      })
      setAvatarPreview(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to upload avatar',
        variant: 'destructive',
      })
      setAvatarPreview(null)
    }
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview // avatarPreview is a data URL from FileReader
    if (displayUser?.avatar) return getImageUrl(displayUser.avatar)
    return null
  }

  const getInitials = () => {
    return getUserInitials(displayUser)
  }

  const handleAddToCart = (product: Product) => {
    dispatch(
      addItem({
        id: `${product.id}-${Date.now()}`,
        product,
        quantity: 1,
        price: product.price,
      })
    )
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleRemoveFromWishlist = async (product: Product) => {
    try {
      await removeFromWishlist(product.id).unwrap()
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist.`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to remove from wishlist.',
        variant: 'destructive',
      })
    }
  }

  const handleChangePassword = async (
    values: { currentPassword: string; newPassword: string; confirmPassword: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap()
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
      })
      resetForm()
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to change password. Please check your current password.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-4xl font-bold">My Profile</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Addresses</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Wishlist</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUser && !user ? (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center mb-8 pb-8 border-b">
                        <Skeleton className="w-32 h-32 rounded-full" />
                        <Skeleton className="h-6 w-48 mt-4" />
                        <Skeleton className="h-4 w-64 mt-2" />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-11 w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-11 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-11 w-full" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-11 w-full" />
                        </div>
                        <Skeleton className="h-11 w-32" />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Profile Image Section */}
                      <div className="flex flex-col items-center mb-8 pb-8 border-b">
                    <div className="relative group">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-background shadow-lg">
                        {getAvatarUrl() ? (
                          <img
                            src={getAvatarUrl()!}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                            <span className="text-4xl font-bold text-primary/60">
                              {getInitials()}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute bottom-0 right-0 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-semibold">
                        {displayUser?.firstName && displayUser?.lastName
                          ? `${displayUser.firstName} ${displayUser.lastName}`
                          : displayUser?.email || 'User'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{displayUser?.email}</p>
                    </div>
                  </div>

                  <Formik
                    initialValues={getProfileInitialValues()}
                    validationSchema={profileSchema}
                    onSubmit={handleProfileSubmit}
                    enableReinitialize
                    key={user?.id || 'profile-form'}
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={displayUser?.email || ''}
                            disabled
                            className="bg-muted"
                            placeholder={isLoadingUser ? 'Loading...' : ''}
                          />
                          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Field
                              as={Input}
                              id="firstName"
                              name="firstName"
                            />
                            <ErrorMessage name="firstName" component="p" className="text-sm text-destructive" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Field
                              as={Input}
                              id="lastName"
                              name="lastName"
                            />
                            <ErrorMessage name="lastName" component="p" className="text-sm text-destructive" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Field
                            as={Input}
                            id="phone"
                            name="phone"
                            type="tel"
                          />
                          <ErrorMessage name="phone" component="p" className="text-sm text-destructive" />
                        </div>

                        <Button type="submit" disabled={updatingProfile || isLoadingUser || isSubmitting}>
                          {(updatingProfile || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Update Profile
                        </Button>
                      </Form>
                    )}
                  </Formik>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Change Password Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Formik
                    initialValues={{
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    }}
                    validationSchema={changePasswordSchema}
                    onSubmit={(values, { resetForm }) => handleChangePassword(values, { resetForm })}
                  >
                    {({ isSubmitting, errors, touched, resetForm }) => (
                      <Form className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Field
                              as={Input}
                              id="currentPassword"
                              name="currentPassword"
                              type={showCurrentPassword ? 'text' : 'password'}
                              placeholder="Enter your current password"
                              className={`pr-10 ${
                                errors.currentPassword && touched.currentPassword
                                  ? 'border-destructive focus-visible:ring-destructive'
                                  : ''
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <ErrorMessage name="currentPassword" component="p" className="text-sm text-destructive" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Field
                              as={Input}
                              id="newPassword"
                              name="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder="Enter your new password"
                              className={`pr-10 ${
                                errors.newPassword && touched.newPassword
                                  ? 'border-destructive focus-visible:ring-destructive'
                                  : ''
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <ErrorMessage name="newPassword" component="p" className="text-sm text-destructive" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Field
                              as={Input}
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your new password"
                              className={`pr-10 ${
                                errors.confirmPassword && touched.confirmPassword
                                  ? 'border-destructive focus-visible:ring-destructive'
                                  : ''
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <ErrorMessage name="confirmPassword" component="p" className="text-sm text-destructive" />
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" disabled={changingPassword || isSubmitting}>
                            {(changingPassword || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Change Password
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              resetForm()
                              setShowCurrentPassword(false)
                              setShowNewPassword(false)
                              setShowConfirmPassword(false)
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses">
              <div className="space-y-6">
                <Card id="address-form">
                  <CardHeader>
                    <CardTitle>{editingAddressId ? 'Edit Address' : 'Add New Address'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Formik
                      initialValues={getAddressInitialValues()}
                      validationSchema={addressSchema}
                      onSubmit={handleAddressSubmit}
                      enableReinitialize
                      key={editingAddressId || 'new-address'}
                    >
                      {({ isSubmitting, resetForm }) => (
                        <Form className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Field
                              as={Input}
                              id="street"
                              name="street"
                            />
                            <ErrorMessage name="street" component="p" className="text-sm text-destructive" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="label">Label (Optional)</Label>
                            <Field
                              as={Input}
                              id="label"
                              name="label"
                              placeholder="e.g., Home, Work"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Field
                                as={Input}
                                id="city"
                                name="city"
                              />
                              <ErrorMessage name="city" component="p" className="text-sm text-destructive" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="state">State</Label>
                              <Field
                                as={Input}
                                id="state"
                                name="state"
                              />
                              <ErrorMessage name="state" component="p" className="text-sm text-destructive" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="zipCode">Zip Code</Label>
                              <Field
                                as={Input}
                                id="zipCode"
                                name="zipCode"
                              />
                              <ErrorMessage name="zipCode" component="p" className="text-sm text-destructive" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="country">Country</Label>
                              <Field
                                as={Input}
                                id="country"
                                name="country"
                              />
                              <ErrorMessage name="country" component="p" className="text-sm text-destructive" />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Field
                              type="checkbox"
                              id="isDefault"
                              name="isDefault"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="isDefault" className="cursor-pointer">
                              Set as default address
                            </Label>
                          </div>

                          <div className="flex gap-2">
                            <Button type="submit" disabled={creatingAddress || updatingAddress || isSubmitting}>
                              {(creatingAddress || updatingAddress || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {editingAddressId ? 'Update Address' : 'Add Address'}
                            </Button>
                            {editingAddressId && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  handleCancelEdit()
                                  resetForm()
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </CardContent>
                </Card>

                {addresses && addresses.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Saved Addresses</h2>
                    {addresses.map((address) => (
                      <Card key={address.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              {address.label && (
                                <p className="font-semibold mb-1">{address.label}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {address.street}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                              <p className="text-sm text-muted-foreground">{address.country}</p>
                              {address.isDefault && (
                                <span className="mt-2 inline-block rounded-lg bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditAddress(address)}
                                className="h-9 w-9"
                                title="Edit address"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteClick(address)}
                                disabled={deletingAddress}
                                className="h-9 w-9"
                                title="Delete address"
                              >
                                {deletingAddress ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingWishlist ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-2xl" />
                      ))}
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
                      <h2 className="mb-2 text-2xl font-semibold">Your wishlist is empty</h2>
                      <p className="mb-6 text-muted-foreground">
                        Start adding items to your wishlist
                      </p>
                      <Link href={ROUTES.PRODUCTS}>
                        <Button>Start Shopping</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {wishlistItems.map((product) => (
                        <div key={product.id} className="relative">
                          <ProductCard
                            product={product}
                            onAddToCart={handleAddToCart}
                            onAddToWishlist={() => handleRemoveFromWishlist(product)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      <CartDrawer />

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            // Clear state when dialog closes
            setAddressToDelete(null)
            setAddressToDeleteOriginalId(null)
          }
          setDeleteDialogOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setAddressToDelete(null)
                setAddressToDeleteOriginalId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingAddress}
            >
              {deletingAddress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

