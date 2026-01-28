'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useVerifyEmailMutation } from '@/store/api/authApi'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/constants'
import { Mail, CheckCircle2 } from 'lucide-react'

interface VerifyEmailDialogProps {
  open: boolean
  email: string
  onClose: () => void
  onVerified?: () => void
}

export function VerifyEmailDialog({ open, email, onClose, onVerified }: VerifyEmailDialogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  // Check if verification token is in URL (from email link)
  useEffect(() => {
    const token = searchParams.get('token')
    if (token && open) {
      setVerificationToken(token)
      handleVerifyEmail(token)
    }
  }, [searchParams, open])

  const handleVerifyEmail = async (token?: string) => {
    const tokenToUse = token || verificationToken
    if (!tokenToUse) return

    try {
      const result = await verifyEmail(tokenToUse).unwrap()
      setIsVerified(true)
      
      // After verification, user needs to login manually
      // Do not auto-login even if backend returns tokens
      toast({
        title: 'Email verified!',
        description: 'Your email has been verified successfully. Please login to continue.',
      })
      
      if (onVerified) {
        onVerified()
      }
      
      // Close dialog and redirect to login after a short delay
      setTimeout(() => {
        onClose()
        router.push(ROUTES.LOGIN)
      }, 2000)
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error?.data?.message || 'Invalid or expired verification link.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isVerified ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Email Verified!
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                Verify Your Email
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isVerified
              ? 'Your email has been verified successfully. Redirecting to login...'
              : `We've sent a verification link to ${email}. Please check your email and click the link to verify your account.`}
          </DialogDescription>
        </DialogHeader>

        {!isVerified && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>You'll be automatically redirected to login</li>
              </ol>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="py-4">
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

