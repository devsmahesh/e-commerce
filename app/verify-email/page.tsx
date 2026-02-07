'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useVerifyEmailMutation } from '@/store/api/authApi'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/constants'
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleVerifyEmail = useCallback(async (token: string) => {
    setStatus('verifying')
    try {
      const result = await verifyEmail(token).unwrap()
      setStatus('success')
      
      // After verification, user needs to login manually
      // Do not auto-login even if backend returns tokens
      setMessage('Your email has been verified successfully! Please login to continue.')
      
      toast({
        title: 'Email verified!',
        description: 'Your email has been verified successfully. Please login to continue.',
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(ROUTES.LOGIN)
      }, 2000)
    } catch (error: any) {
      setStatus('error')
      setMessage(error?.data?.message || 'Invalid or expired verification link.')
      
      toast({
        title: 'Verification failed',
        description: error?.data?.message || 'Invalid or expired verification link.',
        variant: 'destructive',
      })
    }
  }, [verifyEmail, toast, router])

  useEffect(() => {
    if (!mounted) return
    const token = searchParams.get('token')
    if (token) {
      handleVerifyEmail(token)
    } else {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
    }
  }, [searchParams, mounted, handleVerifyEmail])

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              {!mounted ? (
                <Mail className="h-12 w-12 text-muted-foreground" />
              ) : (
                <>
                  {status === 'verifying' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                  {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
                  {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
                  {status === 'idle' && <Mail className="h-12 w-12 text-muted-foreground" />}
                </>
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {status === 'verifying' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'idle' && 'Email Verification'}
            </CardTitle>
            <CardDescription>{message || 'Please wait while we verify your email...'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'success' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting to login page...
                </p>
                <Button onClick={() => router.push(ROUTES.LOGIN)} className="w-full">
                  Go to Login
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  The verification link may have expired or is invalid.
                </p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => router.push(ROUTES.REGISTER)} variant="outline" className="w-full">
                    Register Again
                  </Button>
                  <Button onClick={() => router.push(ROUTES.LOGIN)} className="w-full">
                    Go to Login
                  </Button>
                </div>
              </div>
            )}

            {status === 'idle' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Please check your email for the verification link.
                </p>
                <Link href={ROUTES.LOGIN} className="text-sm text-accent hover:underline">
                  Back to Login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}

