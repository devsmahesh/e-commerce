'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LogIn } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel?: () => void
  cancelLabel?: string
}

export function LoginModal({ open, onOpenChange, onCancel, cancelLabel = 'Cancel' }: LoginModalProps) {
  const router = useRouter()

  const handleLoginClick = () => {
    onOpenChange(false)
    router.push(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(ROUTES.CHECKOUT)}`)
  }

  const handleCancel = () => {
    onOpenChange(false)
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Login Required
          </DialogTitle>
          <DialogDescription>
            You need to be logged in to proceed with checkout. Please log in to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            After logging in, you&apos;ll be redirected back to checkout to complete your order.
          </p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button onClick={handleLoginClick} className="w-full sm:w-auto">
            <LogIn className="mr-2 h-4 w-4" />
            Go to Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

