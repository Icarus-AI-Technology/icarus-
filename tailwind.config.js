/**
 * Tailwind Config – OraclusX DS
 * Revisão completa para frontend v5.0
 */

import tailwindcssAnimate from 'tailwindcss-animate';

const ORACLUSX_FONT_STACK = `"Inter", "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ORACLUSX_FONT_STACK,
      display: ORACLUSX_FONT_STACK,
      body: ORACLUSX_FONT_STACK,
    },
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1.5rem',
          sm: '2rem',
          lg: '3.5rem',
          xl: '4rem',
          '2xl': '5rem',
        },
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
        34: '8.5rem',
        42: '10.5rem',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.65rem',
        neu: '2.75rem',
        glass: '1.75rem',
        card: '1.5rem',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        glass: {
          light: 'rgba(255, 255, 255, 0.6)',
          dark: 'rgba(15, 21, 36, 0.65)',
        },
        gradient: {
          indigo: '#6366F1',
          purple: '#A855F7',
          cyan: '#06B6D4',
          midnight: '#0F172A',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        surface: {
          DEFAULT: '#EEF1F8',
          alt: '#F4F6FB',
          dark: '#101320',
          darker: '#0B0D14',
        },
        highlight: {
          aqua: 'rgba(56, 189, 248, 0.28)',
          indigo: 'rgba(99, 102, 241, 0.35)',
          emerald: 'rgba(16, 185, 129, 0.28)',
        },
      },
      boxShadow: {
        neu: '12px 12px 30px rgba(26, 33, 52, 0.35), -12px -12px 28px rgba(255, 255, 255, 0.9)',
        'neu-soft': '20px 20px 60px rgba(24, 31, 54, 0.3), -20px -20px 60px rgba(255, 255, 255, 0.85)',
        'neu-card': '18px 22px 45px rgba(28, 35, 56, 0.26), -18px -22px 45px rgba(255, 255, 255, 0.75)',
        'neu-inset': 'inset 8px 8px 20px rgba(24, 30, 48, 0.25), inset -8px -8px 20px rgba(255, 255, 255, 0.85)',
        'neu-dark': '14px 14px 32px rgba(2, 11, 29, 0.65), -10px -10px 28px rgba(26, 31, 48, 0.35)',
        glass: '0 35px 80px rgba(13, 23, 45, 0.45)',
        focus: '0 0 0 1px rgba(99, 102, 241, 0.35), 0 20px 45px rgba(99, 102, 241, 0.25)',
      },
      backdropBlur: {
        glass: '32px',
        frosted: '40px',
        intense: '52px',
      },
      blur: {
        glow: '45px',
      },
      dropShadow: {
        neu: '12px 16px 40px rgba(26, 29, 43, 0.35)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 6s ease-in-out infinite',
        'float-slow': 'float-slow 12s ease-in-out infinite',
        shimmer: 'shimmer 5s linear infinite',
        'tilt-glow': 'tilt-glow 8s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': {
            boxShadow:
              '0 20px 40px rgba(79, 70, 229, 0.18), 0 0 0 0 rgba(99, 102, 241, 0.35)',
          },
          '50%': {
            boxShadow:
              '0 28px 65px rgba(79, 70, 229, 0.24), 0 0 0 18px rgba(99, 102, 241, 0.08)',
          },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -12px, 0)' },
        },
        shimmer: {
          '0%, 100%': {
            backgroundPosition: '200% 50%',
          },
          '50%': {
            backgroundPosition: '-200% 50%',
          },
        },
        'tilt-glow': {
          '0%, 100%': { transform: 'rotate3d(0.35, 0.35, 0, 8deg)' },
          '50%': { transform: 'rotate3d(0.15, -0.45, 0, 10deg)' },
        },
      },
      backdropBrightness: {
        neu: '1.25',
      },
      brightness: {
        neu: '1.18',
      },
      translate: {
        neu: '18px',
      },
      transitionTimingFunction: {
        'orx-smooth': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
 
