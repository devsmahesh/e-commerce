import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Runiche - Premium Cow & Buffalo Ghee',
  description: 'Shop premium cow and buffalo ghee online. Authentic, pure, and traditional ghee products with secure checkout and fast delivery.',
  keywords: ['ghee', 'cow ghee', 'buffalo ghee', 'premium ghee', 'pure ghee', 'traditional ghee', 'online ghee', 'ghee shop'],
  authors: [{ name: 'Runiche Team' }],
  icons: {
    icon: '/assests/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Runiche',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  )
}

