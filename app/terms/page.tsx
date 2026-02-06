'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Scale, ShoppingBag, CreditCard, Truck, RotateCcw } from 'lucide-react'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Scale className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms and Conditions</h1>
              <p className="text-lg text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Introduction */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-3xl font-bold mb-4">Introduction</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Welcome to Runiche (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your 
                      access to and use of our website, products, and services. By accessing or using our website, 
                      you agree to be bound by these Terms.
                    </p>
                    <p>
                      Please read these Terms carefully before using our services. If you do not agree with any part 
                      of these Terms, you must not use our website or services.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Acceptance of Terms */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                    <h2 className="text-3xl font-bold">Acceptance of Terms</h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      By accessing or using our website, you acknowledge that you have read, understood, and agree to 
                      be bound by these Terms and our Privacy Policy. These Terms apply to all visitors, users, and 
                      others who access or use our services.
                    </p>
                    <p>
                      We reserve the right to modify these Terms at any time. Your continued use of our services after 
                      any changes constitutes your acceptance of the new Terms.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Registration */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-3xl font-bold mb-4">Account Registration</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>To access certain features of our website, you may be required to create an account. When creating 
                      an account, you agree to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Provide accurate, current, and complete information</li>
                      <li>Maintain and update your information to keep it accurate</li>
                      <li>Maintain the security of your account credentials</li>
                      <li>Accept responsibility for all activities under your account</li>
                      <li>Notify us immediately of any unauthorized use of your account</li>
                    </ul>
                    <p>
                      You must be at least 18 years old to create an account and make purchases. We reserve the right 
                      to refuse service, terminate accounts, or cancel orders at our discretion.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Products and Pricing */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <ShoppingBag className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                    <h2 className="text-3xl font-bold">Products and Pricing</h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We strive to provide accurate product descriptions, images, and pricing information. However, we 
                      do not warrant that product descriptions, images, or other content on our website are accurate, 
                      complete, reliable, current, or error-free.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong className="text-foreground">Pricing:</strong> All prices are listed in Indian Rupees (₹) 
                        and are subject to change without notice. We reserve the right to correct pricing errors.
                      </li>
                      <li>
                        <strong className="text-foreground">Product Availability:</strong> Product availability is subject 
                        to change. We reserve the right to limit quantities and refuse orders.
                      </li>
                      <li>
                        <strong className="text-foreground">Product Information:</strong> We make every effort to display 
                        accurate product information, but we do not guarantee that colors, images, or descriptions exactly 
                        match the actual products.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Orders and Payment */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                    <h2 className="text-3xl font-bold">Orders and Payment</h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      When you place an order, you are making an offer to purchase products at the prices listed. We 
                      reserve the right to accept or reject any order for any reason.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong className="text-foreground">Order Confirmation:</strong> You will receive an order 
                        confirmation email once your order is placed. This does not guarantee acceptance of your order.
                      </li>
                      <li>
                        <strong className="text-foreground">Payment:</strong> Payment must be received before we process 
                        and ship your order. We accept various payment methods as displayed on our website.
                      </li>
                      <li>
                        <strong className="text-foreground">Order Cancellation:</strong> You may cancel your order before 
                        it is shipped. Once shipped, standard return and refund policies apply.
                      </li>
                      <li>
                        <strong className="text-foreground">Payment Security:</strong> All payment transactions are 
                        processed securely through trusted third-party payment processors.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping and Delivery */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Truck className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                    <h2 className="text-3xl font-bold">Shipping and Delivery</h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We ship products to addresses within India. Shipping costs and estimated delivery times are 
                      displayed during checkout.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong className="text-foreground">Shipping Address:</strong> You are responsible for providing 
                        accurate shipping addresses. We are not liable for orders shipped to incorrect addresses.
                      </li>
                      <li>
                        <strong className="text-foreground">Delivery Times:</strong> Estimated delivery times are 
                        approximate and may vary due to factors beyond our control.
                      </li>
                      <li>
                        <strong className="text-foreground">Risk of Loss:</strong> Risk of loss and title for products 
                        pass to you upon delivery to the carrier.
                      </li>
                      <li>
                        <strong className="text-foreground">Shipping Delays:</strong> We are not responsible for delays 
                        caused by carriers, weather, or other circumstances beyond our control.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Returns and Refunds */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <RotateCcw className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                    <h2 className="text-3xl font-bold">Returns and Refunds</h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Our return and refund policy is designed to ensure your satisfaction. Please review our return 
                      policy carefully:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong className="text-foreground">Return Window:</strong> You may return products within 
                        7 days of delivery, provided they are unopened and in original condition.
                      </li>
                      <li>
                        <strong className="text-foreground">Return Process:</strong> Contact our customer service to 
                        initiate a return. You are responsible for return shipping costs unless the product is defective 
                        or incorrect.
                      </li>
                      <li>
                        <strong className="text-foreground">Refunds:</strong> Refunds will be processed to the original 
                        payment method within 5-7 business days after we receive and inspect the returned product.
                      </li>
                      <li>
                        <strong className="text-foreground">Non-Returnable Items:</strong> Certain items may not be 
                        eligible for return due to hygiene or safety reasons. This will be clearly indicated.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Intellectual Property */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-3xl font-bold mb-4">Intellectual Property</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      All content on our website, including text, graphics, logos, images, and software, is the property 
                      of Runiche or its content suppliers and is protected by copyright, trademark, and other intellectual 
                      property laws.
                    </p>
                    <p>
                      You may not reproduce, distribute, modify, create derivative works, publicly display, or otherwise 
                      use our content without our express written permission.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* User Conduct */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-3xl font-bold mb-4">User Conduct</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>You agree not to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Use our website for any unlawful purpose or in violation of any laws</li>
                      <li>Attempt to gain unauthorized access to our systems or networks</li>
                      <li>Interfere with or disrupt our website or servers</li>
                      <li>Transmit any viruses, malware, or harmful code</li>
                      <li>Use automated systems to access our website without permission</li>
                      <li>Impersonate any person or entity or misrepresent your affiliation</li>
                      <li>Collect or harvest information about other users</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Limitation of Liability */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-3xl font-bold mb-4">Limitation of Liability</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      To the maximum extent permitted by law, Runiche shall not be liable for any indirect, incidental, 
                      special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                      directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from 
                      your use of our services.
                    </p>
                    <p>
                      Our total liability for any claims arising from your use of our services shall not exceed the amount 
                      you paid to us in the 12 months preceding the claim.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Indemnification */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-3xl font-bold mb-4">Indemnification</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      You agree to indemnify, defend, and hold harmless Runiche and its officers, directors, employees, 
                      and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) 
                      arising from your use of our services, violation of these Terms, or infringement of any rights 
                      of another party.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Governing Law */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-3xl font-bold mb-4">Governing Law</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      These Terms shall be governed by and construed in accordance with the laws of India, without regard 
                      to its conflict of law provisions. Any disputes arising from these Terms or your use of our services 
                      shall be subject to the exclusive jurisdiction of the courts in India.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Changes to Terms */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-3xl font-bold mb-4">Changes to Terms</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We reserve the right to modify these Terms at any time. We will notify you of any material changes 
                      by posting the updated Terms on this page and updating the &quot;Last updated&quot; date.
                    </p>
                    <p>
                      Your continued use of our services after any changes constitutes your acceptance of the new Terms. 
                      If you do not agree with the changes, you must stop using our services.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      If you have any questions about these Terms and Conditions, please contact us:
                    </p>
                    <div className="space-y-2">
                      <p>
                        <strong className="text-foreground">Email:</strong>{' '}
                        <a href="mailto:legal@runiche.com" className="text-amber-600 dark:text-amber-400 hover:underline">
                          legal@runiche.com
                        </a>
                      </p>
                      <p>
                        <strong className="text-foreground">Phone:</strong>{' '}
                        <a href="tel:+911234567890" className="text-amber-600 dark:text-amber-400 hover:underline">
                          +91 123 456 7890
                        </a>
                      </p>
                      <p>
                        <strong className="text-foreground">Address:</strong> Runiche Ghee Products, 123 Business Street, 
                        City, State 123456, India
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

