# Premium E-commerce Platform

A modern, enterprise-grade e-commerce platform built with Next.js, TypeScript, Tailwind CSS, and Redux Toolkit.

## Features

### Public Features
- 🏠 **Homepage** with hero banner, categories, featured products, and flash deals
- 🛍️ **Product Catalog** with filtering, sorting, and pagination
- 🔍 **Search** functionality
- 📱 **Product Details** with image gallery, reviews, and add to cart
- 🛒 **Shopping Cart** with quantity management
- 💳 **Checkout** with Stripe integration
- 📦 **Order Management** for customers
- ❤️ **Wishlist** functionality
- 👤 **User Profile** with address management

### Admin Features
- 📊 **Dashboard** with revenue charts and KPIs
- 📦 **Product Management** (CRUD operations)
- 📋 **Order Management** with status updates
- 👥 **User Management**
- 🎟️ **Coupon Management**
- 🖼️ **Banner Management**

### Technical Features
- ⚡ **Server-Side Rendering** for SEO
- 🎨 **Modern UI** with Tailwind CSS and shadcn/ui
- 🔄 **State Management** with Redux Toolkit and RTK Query
- 📱 **Fully Responsive** design
- 🌙 **Dark Mode** support
- ✨ **Smooth Animations** with Framer Motion
- 🔒 **Authentication** with JWT
- 💳 **Stripe Integration** for payments
- 📊 **Charts** with Recharts

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

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd e-commerce-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(auth)          # Authentication pages
  /(shop)          # Shop pages
  /(admin)         # Admin pages
  /product/[slug] # Product detail pages
/components
  /ui              # Reusable UI components
  /layout          # Layout components
  /shop            # Shop-specific components
  /admin           # Admin components
  /checkout        # Checkout components
/store
  /api             # RTK Query API slices
  /slices          # Redux slices
/lib               # Utilities and constants
/types             # TypeScript types
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Design System

### Colors
- **Primary:** Midnight Blue `#0F172A`
- **Accent:** Royal Gold `#F59E0B`
- **Background:** Soft White `#F8FAFC`
- **Success:** Green `#22C55E`
- **Error:** Red `#EF4444`

### Typography
- **Font:** Inter / Poppins
- Clean, modern, readable

## API Integration

The frontend connects to a NestJS backend. All API calls are handled through RTK Query with automatic caching and invalidation.

## Authentication

Authentication uses JWT tokens stored in HTTP-only cookies. The app automatically handles token refresh and redirects unauthenticated users.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

