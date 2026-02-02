# Ghee E-commerce Platform

A full-stack web application that enables customers to browse and purchase premium cow and buffalo ghee products online. It features a secure authentication system, real-time inventory management, Stripe-based payment processing, and an admin dashboard for managing orders, products, and users. The platform is designed for scalability, performance, and secure transactions.

## Features

### Public Features
- 🏠 **Homepage** with hero banner, ghee categories, featured products, and flash deals
- 🛍️ **Product Catalog** with filtering by ghee type (cow/buffalo), weight, purity, and sorting
- 🔍 **Search** functionality for finding specific ghee products
- 📱 **Product Details** with image gallery, reviews, ghee specifications, and add to cart
- 🛒 **Shopping Cart** with quantity management
- 💳 **Checkout** with Stripe integration for secure payments
- 📦 **Order Management** for customers to track their ghee orders
- ❤️ **Wishlist** functionality to save favorite ghee products
- 👤 **User Profile** with address management

### Admin Features
- 📊 **Dashboard** with revenue charts, sales analytics, and KPIs
- 📦 **Product Management** (CRUD operations) for ghee products
- 📋 **Order Management** with status updates and tracking
- 👥 **User Management** for customer accounts
- 🎟️ **Coupon Management** for discounts and promotions
- 🖼️ **Banner Management** for marketing campaigns
- 📊 **Inventory Management** with low stock alerts for ghee products
- 📈 **Analytics & Reports** for sales, products, and user insights

### Ghee-Specific Features
- 🐄 **Ghee Type Filtering** - Filter by cow ghee, buffalo ghee, or mixed
- ⚖️ **Weight Options** - Multiple weight variants (250g, 500g, 1kg, 2kg, 5kg)
- ✨ **Purity Information** - Display purity percentage for each product
- 📍 **Origin Tracking** - Show origin/region of ghee products
- 📅 **Shelf Life** - Display shelf life information for freshness
- 🏷️ **Quality Indicators** - Premium, authentic, and traditional ghee labeling

### Technical Features
- ⚡ **Server-Side Rendering** for SEO optimization
- 🎨 **Modern UI** with Tailwind CSS and shadcn/ui
- 🔄 **State Management** with Redux Toolkit and RTK Query
- 📱 **Fully Responsive** design for all devices
- 🌙 **Dark Mode** support
- ✨ **Smooth Animations** with Framer Motion
- 🔒 **Secure Authentication** with JWT tokens
- 💳 **Stripe Integration** for secure payment processing
- 📊 **Charts & Analytics** with Recharts
- 🔄 **Real-time Inventory** updates

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** Redux Toolkit + RTK Query
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Payments:** Stripe Elements
- **Charts:** Recharts
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API (NestJS) running on port 8000

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ghee-ecommerce-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /admin          # Admin dashboard pages
  /cart           # Shopping cart
  /checkout       # Checkout process
  /orders         # Customer orders
  /products       # Product listing
  /product/[slug] # Product detail pages
  /profile        # User profile
  /wishlist       # Wishlist page
/components
  /ui             # Reusable UI components
  /layout         # Layout components (Navbar, Footer)
  /shop           # Shop-specific components
  /checkout       # Checkout components
  /auth           # Authentication components
/store
  /api            # RTK Query API slices
  /slices         # Redux slices
/lib              # Utilities and constants
/types            # TypeScript types
/services         # API service clients
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000/api/v1)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key for payments
- `NEXT_PUBLIC_SITE_URL` - Site URL for SEO (sitemap, robots.txt)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Design System

### Colors
- **Primary:** Midnight Blue `#0F172A` (represents trust and premium quality)
- **Accent:** Royal Gold `#F59E0B` (represents the golden color of ghee)
- **Background:** Soft White `#F8FAFC`
- **Success:** Green `#22C55E`
- **Error:** Red `#EF4444`

### Typography
- **Font:** Inter / Poppins
- Clean, modern, readable design

## API Integration

The frontend connects to a NestJS backend API. All API calls are handled through RTK Query with automatic caching and invalidation. The API supports:

- Authentication & Authorization
- Product Management (with ghee-specific fields)
- Order Processing
- User Management
- Inventory Management
- Analytics & Reporting
- Coupon & Banner Management

## Product Data Structure

Ghee products include the following fields:
- **gheeType**: 'cow' | 'buffalo' | 'mixed'
- **weight**: Product weight in grams
- **purity**: Purity percentage (e.g., 99.9%)
- **origin**: Origin/region of the ghee
- **shelfLife**: Shelf life information

## Authentication

Authentication uses JWT tokens stored in HTTP-only cookies. The app automatically handles:
- Token refresh
- Automatic logout on token expiry
- Redirects for unauthenticated users
- Role-based access control (Admin/User)

## Payment Processing

The platform uses Stripe for secure payment processing:
- Credit/Debit card payments
- Secure checkout flow
- Payment status tracking
- Order confirmation emails

## Admin Dashboard

The admin dashboard provides:
- Real-time sales analytics
- Product inventory management
- Order status updates
- User management
- Coupon and banner management
- Export capabilities (CSV/Excel)
- Low stock alerts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
