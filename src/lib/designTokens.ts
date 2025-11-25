/**
 * Design Tokens - OraclusX Design System
 * 
 * Tokens de design centralizados para consistência visual
 */

export const designTokens = {
  colors: {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    info: 'var(--color-info)',
    
    // Backgrounds
    bgPrimary: 'var(--orx-bg-primary)',
    bgSecondary: 'var(--orx-bg-secondary)',
    bgSurface: 'var(--orx-bg-surface)',
    
    // Text
    textPrimary: 'var(--orx-text-primary)',
    textSecondary: 'var(--orx-text-secondary)',
    textMuted: 'var(--orx-text-muted)',
    
    // Border
    border: 'var(--orx-border)',
    borderSubtle: 'var(--orx-border-subtle)',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    neumo: 'var(--shadow-neumo)',
    neumoInset: 'var(--shadow-neumo-inset)',
  },
  
  typography: {
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
  
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
};

export type DesignTokens = typeof designTokens;

export default designTokens;

