'use client'

import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAddAddressMutation } from '@/store/api/usersApi'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface AddressFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const addressSchema = Yup.object({
  street: Yup.string().required('Street address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string()
    .required('ZIP code is required')
    .matches(/^\d{5,6}$/, 'ZIP code must be 5-6 digits'),
  country: Yup.string().required('Country is required'),
  label: Yup.string(),
  isDefault: Yup.boolean(),
})

export function AddressForm({ open, onOpenChange, onSuccess }: AddressFormProps) {
  const { toast } = useToast()
  const [addAddress, { isLoading }] = useAddAddressMutation()

  const formik = useFormik({
    initialValues: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      label: '',
      isDefault: false,
    },
    validationSchema: addressSchema,
    onSubmit: async (values) => {
      try {
        await addAddress({
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
          label: values.label || undefined,
          isDefault: values.isDefault,
        }).unwrap()

        toast({
          title: 'Address added',
          description: 'Your address has been saved successfully.',
        })

        formik.resetForm()
        onOpenChange(false)
        onSuccess?.()
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.data?.message || 'Failed to add address',
          variant: 'destructive',
        })
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
          <DialogDescription>
            Enter your shipping address details. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">
              Address Label <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="label"
              name="label"
              placeholder="e.g., Home, Office, etc."
              value={formik.values.label}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="street"
              name="street"
              placeholder="Enter your street address"
              value={formik.values.street}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
            />
            {formik.touched.street && formik.errors.street && (
              <p className="text-sm text-destructive">{formik.errors.street}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="Enter city"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.city && formik.errors.city && (
                <p className="text-sm text-destructive">{formik.errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-destructive">*</span>
              </Label>
              <Input
                id="state"
                name="state"
                placeholder="Enter state"
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.state && formik.errors.state && (
                <p className="text-sm text-destructive">{formik.errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">
                ZIP Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="zipCode"
                name="zipCode"
                placeholder="Enter ZIP code"
                value={formik.values.zipCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                maxLength={6}
              />
              {formik.touched.zipCode && formik.errors.zipCode && (
                <p className="text-sm text-destructive">{formik.errors.zipCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-destructive">*</span>
              </Label>
              <Input
                id="country"
                name="country"
                placeholder="Enter country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.country && formik.errors.country && (
                <p className="text-sm text-destructive">{formik.errors.country}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formik.values.isDefault}
              onChange={formik.handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
              Set as default address
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                formik.resetForm()
                onOpenChange(false)
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

