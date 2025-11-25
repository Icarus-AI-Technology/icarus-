# OraclusX Design System - Style Guide

**Version:** 5.1.0  
**Last Updated:** 2025  
**Design Philosophy:** Neumorphism 3D + Glassmorphism

---

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Design Principles](#design-principles)
3. [Design Tokens](#design-tokens)
4. [Components](#components)
5. [Patterns](#patterns)
6. [Accessibility](#accessibility)
7. [Migration Guide](#migration-guide)

---

## 🎨 Introduction

The OraclusX Design System is a comprehensive UI framework for the ICARUS platform, combining **Neumorphism 3D** and **Glassmorphism** design languages to create a modern, intuitive, and accessible user experience.

### Key Features

- ✅ **Consolidated Components** - Single source of truth for Button, Input, Card
- ✅ **Neumorphic 3D Effects** - Soft shadows and depth
- ✅ **Glassmorphism** - Translucent surfaces with backdrop blur
- ✅ **Dark Mode** - Full support for light and dark themes
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **TypeScript** - Fully typed components
- ✅ **Responsive** - Mobile-first design

---

## 🎯 Design Principles

### 1. Consistency
All components follow the same design language, ensuring a cohesive user experience across all modules.

### 2. Clarity
UI elements are clear and easy to understand, with appropriate visual hierarchy and spacing.

### 3. Efficiency
Components are optimized for performance and developer experience.

### 4. Accessibility
All components meet WCAG 2.1 AA standards for keyboard navigation, screen readers, and color contrast.

### 5. Modularity
Components are designed to be composable and reusable across different contexts.

---

## 🎨 Design Tokens

### Color Palette

```css
/* Primary Colors */
--orx-primary: #6366f1;           /* Indigo 500 */
--orx-primary-hover: #4f46e5;     /* Indigo 600 */
--orx-primary-active: #4338ca;    /* Indigo 700 */

/* Semantic Colors */
--orx-success: #10b981;           /* Green 500 */
--orx-warning: #f59e0b;           /* Amber 500 */
--orx-danger: #ef4444;            /* Red 500 */
--orx-info: #3b82f6;              /* Blue 500 */

/* Text Colors */
--orx-text-primary: #1a202c;      /* Dark gray */
--orx-text-secondary: #374151;    /* Medium gray */
--orx-text-muted: #4a5568;        /* Light gray */

/* Background Colors */
--orx-bg-app: #dce3eb;            /* Light blue-gray */
--orx-bg-light: #e4eaf1;          /* Lighter blue-gray */
--orx-bg-surface: #ebf0f6;        /* Surface */
--orx-bg-surface-elevated: #f5f8fb; /* Elevated surface */
```

### Module Colors

Each module has a specific color for visual identification:

| Module | Color | Hex |
|--------|-------|-----|
| Dashboard | Violet | `#8b5cf6` |
| Cadastros | Violet | `#8b5cf6` |
| Compras | Blue | `#3b82f6` |
| Vendas | Green | `#10b981` |
| Estoque | Orange | `#f97316` |
| Financeiro | Emerald | `#10b981` |
| Logística | Cyan | `#06b6d4` |
| RH | Pink | `#ec4899` |

### Typography

```css
/* Font Family */
--orx-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--orx-font-size-xs: 0.75rem;    /* 12px */
--orx-font-size-sm: 0.875rem;   /* 14px */
--orx-font-size-base: 1rem;     /* 16px */
--orx-font-size-lg: 1.125rem;   /* 18px */
--orx-font-size-xl: 1.25rem;    /* 20px */
--orx-font-size-2xl: 1.5rem;    /* 24px */
--orx-font-size-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--orx-font-weight-normal: 400;
--orx-font-weight-medium: 500;
--orx-font-weight-semibold: 600;
--orx-font-weight-bold: 700;
```

### Spacing Scale

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

### Neumorphic Shadows

```css
/* Level 1 - Cards */
--shadow-neumo-sm: 
  8px 8px 16px rgba(136, 151, 176, 0.5),
  -8px -8px 16px rgba(255, 255, 255, 0.9);

/* Level 2 - Interactive Elements */
--shadow-neumo: 
  12px 12px 24px rgba(136, 151, 176, 0.6),
  -12px -12px 24px rgba(255, 255, 255, 0.95);

/* Level 3 - Overlays */
--shadow-neumo-lg: 
  16px 16px 32px rgba(136, 151, 176, 0.7),
  -16px -16px 32px rgba(255, 255, 255, 1);

/* Inset Shadows */
--shadow-neumo-sm-inset:
  inset 5px 5px 10px rgba(136, 151, 176, 0.4),
  inset -5px -5px 10px rgba(255, 255, 255, 0.8);
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-xl: 24px;
--radius-full: 9999px;
```

---

## 🧩 Components

### Button

Consolidated button component with multiple variants and states.

#### Import

```typescript
import { Button } from '@/components/oraclusx-ds/Button';
```

#### Variants

- `primary` - Gradient background (default for CTAs)
- `secondary` - Neumorphic surface
- `success` - Green gradient
- `warning` - Yellow/Amber gradient
- `danger` - Red gradient
- `ghost` - Transparent with hover
- `neumo` - Full neumorphic effect (DEFAULT)
- `outline` - Border only
- `link` - Text only

#### Sizes

- `sm` - Height 36px
- `md` - Height 44px (DEFAULT)
- `lg` - Height 52px
- `xl` - Height 56px
- `icon` - 44x44px square

#### Examples

```tsx
// Primary button with icon
<Button variant="primary" leftIcon={Plus}>
  Add New
</Button>

// Neumorphic button (default)
<Button variant="neumo" size="lg">
  Click Me
</Button>

// Loading state
<Button variant="success" loading loadingText="Saving...">
  Save
</Button>

// Full width
<Button variant="danger" fullWidth>
  Delete Account
</Button>

// Icon only
<Button variant="ghost" size="icon">
  <Settings />
</Button>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'ghost' \| 'neumo' \| 'outline' \| 'link'` | `'neumo'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'icon'` | `'md'` | Button size |
| `leftIcon` | `LucideIcon` | - | Icon on the left |
| `rightIcon` | `LucideIcon` | - | Icon on the right |
| `loading` | `boolean` | `false` | Loading state |
| `loadingText` | `string` | - | Text when loading |
| `fullWidth` | `boolean` | `false` | Full width |
| `asChild` | `boolean` | `false` | Render as child (Radix Slot) |

---

### Input

Consolidated input component with neumorphic styling, icons, and error states.

#### Import

```typescript
import { Input } from '@/components/oraclusx-ds/Input';
```

#### Variants

- `neumo` - Inset neumorphic shadow (DEFAULT)
- `flat` - Simple border
- `ghost` - No border, subtle background

#### Sizes

- `sm` - Height 36px
- `md` - Height 44px (DEFAULT)
- `lg` - Height 52px

#### Examples

```tsx
// With label and icon
<Input 
  label="Email Address"
  leftIcon={Mail}
  placeholder="you@example.com"
  required
/>

// With error
<Input 
  label="Password"
  type="password"
  leftIcon={Lock}
  error="Password must be at least 8 characters"
/>

// With hint
<Input 
  label="Username"
  hint="Only letters, numbers, and underscores"
  leftIcon={User}
/>

// Flat variant
<Input 
  variant="flat"
  placeholder="Search..."
  leftIcon={Search}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'neumo' \| 'flat' \| 'ghost'` | `'neumo'` | Visual variant |
| `inputSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `label` | `string` | - | Label text |
| `error` | `string` | - | Error message |
| `hint` | `string` | - | Helper text |
| `leftIcon` | `LucideIcon` | - | Icon on the left |
| `rightIcon` | `LucideIcon` | - | Icon on the right |
| `containerClassName` | `string` | - | Container class |
| `labelClassName` | `string` | - | Label class |

---

### Card

Consolidated card component with neumorphic, glass, and elevated variants.

#### Import

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/oraclusx-ds/Card';
```

#### Variants

- `neumo` - Full neumorphic 3D effect (DEFAULT)
- `glass` - Glassmorphism effect
- `elevated` - Strong shadow
- `flat` - Minimal shadow
- `pressed` - Inset neumorphic

#### Padding

- `none` - No padding
- `sm` - 16px
- `md` - 24px (DEFAULT)
- `lg` - 32px
- `xl` - 40px

#### Examples

```tsx
// Neumorphic card
<Card variant="neumo" padding="lg">
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
    <CardDescription>Overview of your system</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>

// Glass card with hover
<Card variant="glass" hoverable>
  <CardContent>
    Glassmorphic content
  </CardContent>
</Card>

// Clickable card
<Card variant="neumo" clickable onClick={() => navigate('/details')}>
  <CardContent>
    Click me
  </CardContent>
</Card>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'neumo' \| 'glass' \| 'elevated' \| 'flat' \| 'pressed'` | `'neumo'` | Visual variant |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Padding size |
| `hoverable` | `boolean` | `false` | Enable hover lift |
| `clickable` | `boolean` | `false` | Make clickable |
| `as` | `'div' \| 'article' \| 'section'` | `'div'` | HTML element |

---

### Chatbot

Enhanced AI chatbot with suggestions panel and module context.

#### Import

```typescript
import { ChatbotFAB, ChatbotWindow, SuggestionsPanel } from '@/components/oraclusx-ds/chatbot';
```

#### Examples

```tsx
// Chatbot FAB with module color
<ChatbotFAB 
  moduleColor="violet-500"
  iconVariant="bot"
  badge={3}
  onClick={() => setOpen(true)}
/>

// Chatbot Window with suggestions
<ChatbotWindow 
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  moduleContext={{
    name: "ICARUS AI Assistant",
    color: "violet-500"
  }}
  suggestions={[
    { id: '1', text: "Ver alertas ativos", icon: Bell },
    { id: '2', text: "Iniciar treinamento", icon: GraduationCap },
    { id: '3', text: "Como registrar um novo OPME?", icon: HelpCircle }
  ]}
  enableVoice
  enableFileUpload
/>
```

---

## 🎨 Patterns

### Form Layout

```tsx
<Card variant="neumo" padding="lg">
  <CardHeader>
    <CardTitle>User Information</CardTitle>
    <CardDescription>Update your profile details</CardDescription>
  </CardHeader>
  
  <CardContent className="space-y-4">
    <Input 
      label="Full Name"
      leftIcon={User}
      required
    />
    
    <Input 
      label="Email"
      type="email"
      leftIcon={Mail}
      required
    />
    
    <Input 
      label="Phone"
      type="tel"
      leftIcon={Phone}
    />
  </CardContent>
  
  <CardFooter className="flex gap-2 justify-end">
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Save Changes</Button>
  </CardFooter>
</Card>
```

### Dashboard KPI Cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card variant="neumo" hoverable>
    <CardContent className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
        <Users className="text-white" size={24} />
      </div>
      <div>
        <p className="text-sm text-orx-text-muted">Total Users</p>
        <p className="text-2xl font-bold">1,847</p>
      </div>
    </CardContent>
  </Card>
  
  {/* More KPI cards */}
</div>
```

---

## ♿ Accessibility

### Keyboard Navigation

All interactive components support keyboard navigation:

- **Tab** - Move focus between elements
- **Enter/Space** - Activate buttons and links
- **Escape** - Close modals and dropdowns
- **Arrow keys** - Navigate within menus and lists

### Focus Indicators

All focusable elements have visible focus indicators:

```css
*:focus-visible {
  outline: 3px solid var(--orx-primary);
  outline-offset: 3px;
  border-radius: 8px;
}
```

### Screen Readers

- All interactive elements have appropriate ARIA labels
- Form inputs are properly associated with labels
- Error messages are announced with `role="alert"`
- Loading states use `aria-busy`

### Color Contrast

All text meets WCAG 2.1 AA standards:

- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

---

## 🔄 Migration Guide

### Automated Migration

Use the migration script to automatically update imports:

```bash
# Dry run (preview changes)
npx tsx scripts/migrate-imports.ts --dry-run

# Apply changes
npx tsx scripts/migrate-imports.ts

# Migrate specific directory
npx tsx scripts/migrate-imports.ts --path src/components/modules
```

### Manual Migration

#### Button

**Before:**
```tsx
import { NeumoButton } from '@/components/oraclusx-ds/NeumoButton';

<NeumoButton variant="primary" size="lg">
  Click Me
</NeumoButton>
```

**After:**
```tsx
import { Button } from '@/components/oraclusx-ds/Button';

<Button variant="primary" size="lg">
  Click Me
</Button>
```

#### Input

**Before:**
```tsx
import { NeumoInput } from '@/components/oraclusx-ds/NeumoInput';

<NeumoInput label="Email" leftIcon={Mail} />
```

**After:**
```tsx
import { Input } from '@/components/oraclusx-ds/Input';

<Input label="Email" leftIcon={Mail} variant="neumo" />
```

#### Card

**Before:**
```tsx
import { NeomorphicCard } from '@/components/oraclusx-ds/NeomorphicCard';

<NeomorphicCard padding="lg">
  Content
</NeomorphicCard>
```

**After:**
```tsx
import { Card } from '@/components/oraclusx-ds/Card';

<Card variant="neumo" padding="lg">
  Content
</Card>
```

---

## 📦 Component Checklist

When creating new components, ensure they:

- [ ] Use design tokens (no hardcoded colors)
- [ ] Support dark mode
- [ ] Are fully typed with TypeScript
- [ ] Include proper ARIA attributes
- [ ] Support keyboard navigation
- [ ] Have visible focus indicators
- [ ] Are responsive (mobile-first)
- [ ] Follow naming conventions
- [ ] Include JSDoc comments
- [ ] Have usage examples

---

## 🤝 Contributing

When contributing to the design system:

1. Follow the existing patterns and conventions
2. Ensure accessibility standards are met
3. Add TypeScript types for all props
4. Include usage examples in comments
5. Test in both light and dark modes
6. Verify keyboard navigation works
7. Check color contrast ratios

---

## 📞 Support

For questions or issues:

- **Documentation:** `/docs/design-system/`
- **Components:** `/src/components/oraclusx-ds/`
- **Examples:** Storybook (coming soon)

---

**Version:** 5.1.0  
**Last Updated:** 2025  
**Maintained by:** ICARUS Development Team