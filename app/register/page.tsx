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
import { Loader2 } from 'lucide-react'
import { VerifyEmailDialog } from '@/components/auth/verify-email-dialog'

const registerSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
  lastName: Yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
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
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                    />
                    <ErrorMessage name="password" component="p" className="text-sm text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Field
                      as={Input}
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                    />
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
