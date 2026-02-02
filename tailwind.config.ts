import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#F89C1D',
        background: '#F8FAFC',
        foreground: '#0F172A',
        primary: {
          DEFAULT: '#67033F',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F89C1D',
          foreground: '#0F172A',
        },
        accent: {
          DEFAULT: '#F89C1D',
          foreground: '#0F172A',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#F8FAFC',
        },
        success: {
          DEFAULT: '#22C55E',
          foreground: '#F8FAFC',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

