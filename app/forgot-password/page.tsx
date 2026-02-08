'use client'

import Link from 'next/link'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useForgotPasswordMutation } from '@/store/api/authApi'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/constants'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
})

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation()

  const initialValues = {
    email: '',
  }

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      await forgotPassword(values).unwrap()
      toast({
        title: 'Email sent',
        description: 'Please check your email for password reset instructions.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
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
            <div className="flex justify-center mb-4">
              {isSuccess ? (
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              ) : (
                <Mail className="h-12 w-12 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {isSuccess ? 'Check Your Email' : 'Forgot Password'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSuccess
                ? 'We\'ve sent a password reset link to your email address.'
                : 'Enter your email address and we\'ll send you a link to reset your password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Please check your inbox and click on the reset link to create a new password. The link will expire in 1 hour.
                </p>
                <div className="flex flex-col gap-2">
                  <Link href={ROUTES.LOGIN} className="w-full">
                    <Button className="w-full">Back to Login</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                </div>
              </div>
            ) : (
              <Formik
                initialValues={initialValues}
                validationSchema={forgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
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

                    <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
                      {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Reset Link
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
