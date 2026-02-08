'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRegisterMutation } from '@/store/api/authApi'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/constants'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { VerifyEmailDialog } from '@/components/auth/verify-email-dialog'

const registerSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
  lastName: Yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
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
  phone: Yup.string().min(10, 'Phone number must be at least 10 characters').required('Phone number is required'),
})

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [register, { isLoading }] = useRegisterMutation()
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  }

  const handleSubmit = async (values: typeof initialValues, { resetForm }: { resetForm: () => void }) => {
    try {
      const { confirmPassword, ...registerData } = values
      const result = await register(registerData).unwrap()
      
      // Store email for verification dialog
      setRegisteredEmail(values.email)
      
      // Show verification dialog instead of logging in
      setShowVerifyDialog(true)
      
      toast({
        title: 'Registration successful!',
        description: 'Please check your email to verify your account.',
      })
      
      // Reset form
      resetForm()
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error?.data?.message || 'Something went wrong. Please try again.',
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
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your information to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={registerSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Field
                      as={Input}
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                    />
                    <ErrorMessage name="firstName" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Field
                      as={Input}
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                    />
                    <ErrorMessage name="lastName" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
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
                        className="pr-10"
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
                        className="pr-10"
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

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Field
                      as={Input}
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1234567890"
                    />
                    <ErrorMessage name="phone" component="p" className="text-sm text-destructive" />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
                    {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href={ROUTES.LOGIN} className="text-accent hover:underline">
                      Sign in
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <VerifyEmailDialog
        open={showVerifyDialog}
        email={registeredEmail}
        onClose={() => setShowVerifyDialog(false)}
        onVerified={() => {
          setShowVerifyDialog(false)
          router.push(ROUTES.LOGIN)
        }}
      />
    </>
  )
}
