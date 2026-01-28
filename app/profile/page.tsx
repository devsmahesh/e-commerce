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
import { useGetProfileQuery, useUpdateProfileMutation, useGetAddressesQuery, useAddAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation, useUploadAvatarMutation } from '@/store/api/usersApi'
import { useAppSelector } from '@/store/hooks'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Camera, Edit, Trash2 } from 'lucide-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Address } from '@/types'

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

export default function ProfilePage() {
  const { data: user, isLoading: isLoadingUser, refetch: refetchProfile } = useGetProfileQuery()
  const authUser = useAppSelector((state) => state.auth.user)
  const { data: addressesFromApi } = useGetAddressesQuery()
  
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
    if (user?.addresses && Array.isArray(user.addresses) && user.addresses.length > 0) {
      return user.addresses.map((addr: any) => ({
        ...addr,
        id: addr._id || addr.id || '',
        _id: addr._id || addr.id || '', // Preserve _id for API calls
      }))
    }
    return []
  }, [addressesFromApi, user?.addresses])

  // Refetch profile data when component mounts
  React.useEffect(() => {
    refetchProfile()
  }, [refetchProfile])
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation()
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAvatarMutation()
  const [createAddress, { isLoading: creatingAddress }] = useAddAddressMutation()
  const [updateAddress, { isLoading: updatingAddress }] = useUpdateAddressMutation()
  const [deleteAddress, { isLoading: deletingAddress }] = useDeleteAddressMutation()
  const { toast } = useToast()
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [editingAddressId, setEditingAddressId] = React.useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [addressToDelete, setAddressToDelete] = React.useState<string | null>(null)
  const [addressToDeleteOriginalId, setAddressToDeleteOriginalId] = React.useState<string | null>(null)

  const getProfileInitialValues = () => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  })

  const getAddressInitialValues = () => {
    if (editingAddressId) {
      const addressToEdit = addresses.find(addr => addr.id === editingAddressId)
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
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      if (editingAddressId) {
        // Update existing address
        await updateAddress({ id: editingAddressId, data: values }).unwrap()
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
    setEditingAddressId(address.id)
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
    if (avatarPreview) return avatarPreview
    if (displayUser?.avatar) return displayUser.avatar
    return null
  }

  const getInitials = () => {
    if (displayUser?.firstName && displayUser?.lastName) {
      return `${displayUser.firstName[0]}${displayUser.lastName[0]}`.toUpperCase()
    }
    if (displayUser?.email) {
      return displayUser.email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-4xl font-bold">My Profile</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
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

