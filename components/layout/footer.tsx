import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { label: 'All Products', href: ROUTES.PRODUCTS },
      { label: 'Featured', href: `${ROUTES.PRODUCTS}?featured=true` },
      { label: 'New Arrivals', href: `${ROUTES.PRODUCTS}?sort=newest` },
    ],
    customer: [
      { label: 'My Account', href: ROUTES.PROFILE },
      { label: 'Orders', href: ROUTES.ORDERS },
      { label: 'Wishlist', href: ROUTES.WISHLIST },
      { label: 'Cart', href: ROUTES.CART },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  }

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={ROUTES.HOME} className="flex items-center">
              <img 
                src="/assests/runiche-logo.png" 
                alt="Runiche Logo" 
                className="h-20 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium ghee e-commerce platform offering authentic cow and buffalo ghee with exceptional quality and service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Customer Service</h3>
            <ul className="space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} Runiche. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

