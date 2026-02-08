'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useResetPasswordMutation } from '@/store/api/authApi'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/constants'
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, Lock } from 'lucide-react'

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], "Passwords don't match")
    .required('Please confirm your password'),
})

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const token = params?.token as string

  const initialValues = {
    password: '',
    confirmPassword: '',
  }

  const handleSubmit = async (values: typeof initialValues) => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Invalid reset link. No token provided.')
      toast({
        title: 'Invalid link',
        description: 'The reset link is invalid or missing a token.',
        variant: 'destructive',
      })
      return
    }

    try {
      await resetPassword({
        token,
        password: values.password,
      }).unwrap()

      setStatus('success')
      toast({
        title: 'Password reset successful!',
        description: 'Your password has been reset. Please login with your new password.',
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(ROUTES.LOGIN)
      }, 2000)
    } catch (error: any) {
      setStatus('error')
      const errorMsg = error?.data?.message || 'Failed to reset password. The link may have expired.'
      setErrorMessage(errorMsg)
      toast({
        title: 'Reset failed',
        description: errorMsg,
        variant: 'destructive',
      })
    }
  }

  if (!mounted) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  if (!token) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
              <CardDescription>
                The password reset link is invalid or missing a token.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please request a new password reset link.
                </p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => router.push(ROUTES.LOGIN)} className="w-full">
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => router.push('/forgot-password')}
                    variant="outline"
                    className="w-full"
                  >
                    Request New Reset Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              {status === 'success' ? (
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              ) : status === 'error' ? (
                <XCircle className="h-12 w-12 text-destructive" />
              ) : (
                <Lock className="h-12 w-12 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {status === 'success' ? 'Password Reset Successful!' : 'Reset Password'}
            </CardTitle>
            <CardDescription className="text-center">
              {status === 'success'
                ? 'Your password has been reset successfully.'
                : status === 'error'
                ? errorMessage
                : 'Enter your new password below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'success' ? (
              <div className="space-y-4 text-center">
                <p className="text-muted-foreground">
                  Redirecting to login page...
                </p>
                <Button onClick={() => router.push(ROUTES.LOGIN)} className="w-full">
                  Go to Login
                </Button>
              </div>
            ) : (
              <Formik
                initialValues={initialValues}
                validationSchema={resetPasswordSchema}
                onSubmit={handleSubmit}
                validateOnBlur
                validateOnChange
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Field
                          as={Input}
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`pr-10 ${
                            errors.password && touched.password
                              ? 'border-destructive focus-visible:ring-destructive'
                              : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <ErrorMessage name="password" component="p" className="text-sm text-destructive" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Field
                          as={Input}
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
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
                      <ErrorMessage
                        name="confirmPassword"
                        component="p"
                        className="text-sm text-destructive"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
                      {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reset Password
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      Remember your password?{' '}
                      <Link href={ROUTES.LOGIN} className="text-accent hover:underline">
                        Sign in
                      </Link>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}

