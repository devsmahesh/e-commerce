'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLoginMutation } from '@/store/api/authApi'
import { useGetProfileQuery } from '@/store/api/usersApi'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials } from '@/store/slices/authSlice'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/constants'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [login, { isLoading }] = useLoginMutation()
  const { refetch: refetchProfile } = useGetProfileQuery(undefined, { skip: true })
  const [showPassword, setShowPassword] = useState(false)
  
  // Get return URL from query params
  const returnUrl = searchParams.get('returnUrl')

  const initialValues = {
    email: '',
    password: '',
  }

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const result = await login(values).unwrap()
      
      // Extract tokens and user from response
      const { user: userData, accessToken, refreshToken } = result.data
      
      // Transform user data: map _id to id for consistency
      const user = {
        ...userData,
        id: (userData as any)._id || userData.id,
      }
      
      // Save tokens in cookies and update auth state
      dispatch(setCredentials({
        user,
        accessToken,
        refreshToken,
      }))
      
      // Call profile API to get updated user data after login
      try {
        await refetchProfile()
      } catch (profileError) {
        // Profile fetch failed, but login was successful
        console.error('Failed to fetch profile:', profileError)
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      })
      
      // Redirect admin users to admin dashboard
      if (user.role === 'admin') {
        router.push(ROUTES.ADMIN.DASHBOARD)
      } else {
        // Redirect to return URL if provided, otherwise go to home
        const redirectUrl = returnUrl ? decodeURIComponent(returnUrl) : ROUTES.HOME
        router.push(redirectUrl)
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error?.data?.message || 'Invalid email or password',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
              validateOnBlur
              validateOnChange
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className={errors.email && touched.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    <ErrorMessage name="email" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`pr-10 ${errors.password && touched.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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

                  <div className="flex items-center justify-between">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
                    {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href={ROUTES.REGISTER} className="text-accent hover:underline">
                      Sign up
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
