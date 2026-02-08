'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Shield, Lock, Eye, FileText } from 'lucide-react'

export default function PrivacyPage() {
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
                  <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
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
              <div>
                <h2 className="text-3xl font-bold mb-4">Introduction</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    At Runiche (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy and ensuring 
                    the security of your personal information. This Privacy Policy explains how we collect, use, 
                    disclose, and safeguard your information when you visit our website and use our services.
                  </p>
                  <p>
                    By using our website and services, you consent to the collection and use of information in 
                    accordance with this policy. If you do not agree with our policies and practices, please do 
                    not use our services.
                  </p>
                </div>
              </div>

              {/* Information We Collect */}
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                  <h2 className="text-3xl font-bold">Information We Collect</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                    <p>
                      We may collect personal information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>Name, email address, phone number, and postal address</li>
                      <li>Payment information (processed securely through third-party payment processors)</li>
                      <li>Account credentials and preferences</li>
                      <li>Order history and purchase information</li>
                      <li>Customer service communications</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Automatically Collected Information</h3>
                    <p>
                      When you visit our website, we automatically collect certain information, including:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent on pages</li>
                      <li>Referring website addresses</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <Eye className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                  <h2 className="text-3xl font-bold">How We Use Your Information</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>We use the information we collect for various purposes, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong className="text-foreground">Order Processing:</strong> To process and fulfill your orders, 
                      manage payments, and provide customer support
                    </li>
                    <li>
                      <strong className="text-foreground">Account Management:</strong> To create and manage your account, 
                      verify your identity, and maintain your preferences
                    </li>
                    <li>
                      <strong className="text-foreground">Communication:</strong> To send you order confirmations, 
                      shipping updates, promotional materials, and respond to your inquiries
                    </li>
                    <li>
                      <strong className="text-foreground">Improvement:</strong> To analyze website usage, improve our 
                      services, and enhance user experience
                    </li>
                    <li>
                      <strong className="text-foreground">Legal Compliance:</strong> To comply with legal obligations, 
                      resolve disputes, and enforce our agreements
                    </li>
                    <li>
                      <strong className="text-foreground">Marketing:</strong> To send you promotional communications 
                      (with your consent) about products, services, and special offers
                    </li>
                  </ul>
                </div>
              </div>

              {/* Information Sharing */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Information Sharing and Disclosure</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We do not sell, trade, or rent your personal information to third parties. We may share your 
                    information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong className="text-foreground">Service Providers:</strong> We may share information with 
                      trusted third-party service providers who assist us in operating our website, processing payments, 
                      managing orders, and delivering products
                    </li>
                    <li>
                      <strong className="text-foreground">Legal Requirements:</strong> We may disclose information if 
                      required by law, court order, or government regulation, or to protect our rights and safety
                    </li>
                    <li>
                      <strong className="text-foreground">Business Transfers:</strong> In the event of a merger, 
                      acquisition, or sale of assets, your information may be transferred to the acquiring entity
                    </li>
                    <li>
                      <strong className="text-foreground">With Your Consent:</strong> We may share information with 
                      your explicit consent or at your direction
                    </li>
                  </ul>
                </div>
              </div>

              {/* Data Security */}
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                  <h2 className="text-3xl font-bold">Data Security</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We implement appropriate technical and organizational security measures to protect your personal 
                    information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>SSL encryption for data transmission</li>
                    <li>Secure payment processing through trusted providers</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication procedures</li>
                    <li>Secure data storage and backup systems</li>
                  </ul>
                  <p>
                    However, no method of transmission over the internet or electronic storage is 100% secure. 
                    While we strive to use commercially acceptable means to protect your information, we cannot 
                    guarantee absolute security.
                  </p>
                </div>
              </div>

              {/* Cookies */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Cookies and Tracking Technologies</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We use cookies and similar tracking technologies to enhance your browsing experience, analyze 
                    website traffic, and personalize content. Cookies are small data files stored on your device.
                  </p>
                  <p>
                    You can control cookies through your browser settings. However, disabling cookies may limit 
                    your ability to use certain features of our website.
                  </p>
                </div>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Your Rights and Choices</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong className="text-foreground">Access:</strong> Request access to your personal information
                    </li>
                    <li>
                      <strong className="text-foreground">Correction:</strong> Request correction of inaccurate or 
                      incomplete information
                    </li>
                    <li>
                      <strong className="text-foreground">Deletion:</strong> Request deletion of your personal information
                    </li>
                    <li>
                      <strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications 
                      at any time
                    </li>
                    <li>
                      <strong className="text-foreground">Data Portability:</strong> Request a copy of your data in 
                      a portable format
                    </li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us using the information provided in the Contact section 
                    below.
                  </p>
                </div>
              </div>

              {/* Children's Privacy */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Children&apos;s Privacy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect 
                    personal information from children. If you believe we have collected information from a child, 
                    please contact us immediately, and we will take steps to delete such information.
                  </p>
                </div>
              </div>

              {/* Changes to Privacy Policy */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Changes to This Privacy Policy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices or 
                    legal requirements. We will notify you of any material changes by posting the new Privacy Policy 
                    on this page and updating the &quot;Last updated&quot; date.
                  </p>
                  <p>
                    We encourage you to review this Privacy Policy periodically to stay informed about how we protect 
                    your information.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data 
                    practices, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p>
                      <strong className="text-foreground">Email:</strong>{' '}
                      <a href="mailto:runiche46@gmail.com" className="text-amber-600 dark:text-amber-400 hover:underline">
                        runiche46@gmail.com
                      </a>
                    </p>
                    <p>
                      <strong className="text-foreground">Phone:</strong>{' '}
                      <a href="tel:+911234567890" className="text-amber-600 dark:text-amber-400 hover:underline">
                        +91 123 456 7890
                      </a>
                    </p>
                    <p>
                      <strong className="text-foreground">Address:</strong> Runiche Farm Village, Vedia, Jalore, Rajasthan 307029
                    </p>
                  </div>
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

