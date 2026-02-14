'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, MapPin, DollarSign } from 'lucide-react'
import { Address } from '@/types'
import { formatPrice } from '@/lib/utils'

interface CODConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: Address
  total: number
  onConfirm: () => void
  isLoading?: boolean
}

export function CODConfirmationDialog({
  open,
  onOpenChange,
  address,
  total,
  onConfirm,
  isLoading = false,
}: CODConfirmationDialogProps) {
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm()
      setConfirmed(false) // Reset for next time
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setConfirmed(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => handleClose(open)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle className="text-xl">Cash on Delivery Order</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            ⚠️ This is a Cash on Delivery order. If you refuse delivery, your COD access will be blocked permanently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Delivery Warning Badge */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              🚚 COD Orders are manually verified before dispatch.
            </p>
          </div>

          {/* Address Display */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Delivery Address</span>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">{address.street}</p>
              <p className="text-muted-foreground">
                {address.city}, {address.state} {address.zipCode}
              </p>
              <p className="text-muted-foreground">{address.country}</p>
            </div>
          </div>

          {/* Total Amount */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Total Amount</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount to be paid on delivery:</span>
              <span className="text-xl font-bold">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg border-2 border-dashed">
            <Checkbox
              id="cod-confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="cod-confirm"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I confirm this is a genuine order and I will accept the delivery when it arrives.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!confirmed || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

