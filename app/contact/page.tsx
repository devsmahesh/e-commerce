'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSubmitContactMutation } from '@/store/api/contactApi'

const contactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  subject: Yup.string()
    .min(3, 'Subject must be at least 3 characters')
    .required('Subject is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
})

export default function ContactPage() {
  const { toast } = useToast()
  const [submitContact, { isLoading: isSubmitting }] = useSubmitContactMutation()

  const handleSubmit = async (
    values: {
      name: string
      email: string
      phone: string
      subject: string
      message: string
    },
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await submitContact(values).unwrap()
      
      toast({
        title: 'Message sent!',
        description: 'Thank you for contacting us. We will get back to you soon.',
      })
      
      // Reset form after successful submission
      resetForm()
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to send message. Please try again later.'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
              <p className="text-lg text-muted-foreground">
                We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Information */}
                <div className="lg:col-span-1 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                      <CardDescription>
                        Reach out to us through any of these channels
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Email</h3>
                          <p className="text-sm text-muted-foreground">
                            <a href="mailto:runiche46@gmail.com" className="hover:text-foreground transition-colors">
                              runiche46@gmail.com
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Phone</h3>
                          <p className="text-sm text-muted-foreground">
                            <a href="tel:+919590200600" className="hover:text-foreground transition-colors">
                              +91 9590200600
                            </a>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Mon - Sat: 9:00 AM - 6:00 PM IST
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Address</h3>
                          <p className="text-sm text-muted-foreground">
                            Runiche Farm Village, Vedia, Jalore, Rajasthan<br />
                            307029
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Send us a Message</CardTitle>
                      <CardDescription>
                        Fill out the form below and we&apos;ll get back to you within 24 hours
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Formik
                        initialValues={{
                          name: '',
                          email: '',
                          phone: '',
                          subject: '',
                          message: '',
                        }}
                        validationSchema={contactSchema}
                        onSubmit={handleSubmit}
                        validateOnBlur
                        validateOnChange
                      >
                        {({ errors, touched }) => (
                          <Form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Field
                                  as={Input}
                                  id="name"
                                  name="name"
                                  placeholder="Your full name"
                                  className={errors.name && touched.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                <ErrorMessage name="name" component="p" className="text-sm text-destructive" />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Field
                                  as={Input}
                                  id="email"
                                  name="email"
                                  type="email"
                                  placeholder="your.email@example.com"
                                  className={errors.email && touched.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                <ErrorMessage name="email" component="p" className="text-sm text-destructive" />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Field
                                  as={Input}
                                  id="phone"
                                  name="phone"
                                  type="tel"
                                  placeholder="10-digit phone number"
                                  className={errors.phone && touched.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                <ErrorMessage name="phone" component="p" className="text-sm text-destructive" />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Field
                                  as={Input}
                                  id="subject"
                                  name="subject"
                                  placeholder="What is this regarding?"
                                  className={errors.subject && touched.subject ? 'border-destructive focus-visible:ring-destructive' : ''}
                                />
                                <ErrorMessage name="subject" component="p" className="text-sm text-destructive" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="message">Message *</Label>
                              <Field
                                as={Textarea}
                                id="message"
                                name="message"
                                rows={6}
                                placeholder="Tell us how we can help you..."
                                className={errors.message && touched.message ? 'border-destructive focus-visible:ring-destructive' : ''}
                              />
                              <ErrorMessage name="message" component="p" className="text-sm text-destructive" />
                            </div>

                            <Button 
                              type="submit" 
                              className="w-full" 
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Message
                                </>
                              )}
                            </Button>
                          </Form>
                        )}
                      </Formik>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

