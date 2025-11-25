# Quick Reference - OraclusX Design System

One-page cheat sheet for common component usage.

---

## 🎨 Button

```tsx
import { Button } from '@/components/oraclusx-ds/Button';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="neumo">Neumo (default)</Button>
<Button variant="outline">Outline</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon"><Icon /></Button>

// With Icons
<Button leftIcon={Plus}>Add</Button>
<Button rightIcon={ArrowRight}>Next</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>
```

---

## 📝 Input

```tsx
import { Input } from '@/components/oraclusx-ds/Input';

// Basic
<Input placeholder="Enter text..." />

// With Label
<Input label="Email" placeholder="you@example.com" />

// With Icons
<Input leftIcon={Mail} placeholder="Email" />
<Input rightIcon={Eye} type="password" />

// Variants
<Input variant="neumo" />  // Default
<Input variant="flat" />
<Input variant="ghost" />

// Sizes
<Input inputSize="sm" />
<Input inputSize="md" />  // Default
<Input inputSize="lg" />

// States
<Input error="This field is required" />
<Input hint="Must be at least 8 characters" />
<Input disabled />
<Input required />
```

---

## 🎴 Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/oraclusx-ds/Card';

// Variants
<Card variant="neumo">Neumorphic (default)</Card>
<Card variant="glass">Glassmorphism</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="flat">Flat</Card>
<Card variant="pressed">Pressed</Card>

// Padding
<Card padding="none" />
<Card padding="sm" />
<Card padding="md" />  // Default
<Card padding="lg" />
<Card padding="xl" />

// Interactive
<Card hoverable>Hover effect</Card>
<Card clickable onClick={handleClick}>Clickable</Card>

// Complete Example
<Card variant="neumo" padding="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

## 💬 Chatbot

```tsx
import { ChatbotFAB, ChatbotWindow, SuggestionsPanel } from '@/components/oraclusx-ds/chatbot';

// FAB
<ChatbotFAB 
  moduleColor="violet-500"
  iconVariant="bot"  // 'bot' | 'brain' | 'sparkles'
  badge={3}
  onClick={() => setOpen(true)}
/>

// Window
<ChatbotWindow 
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  moduleContext={{
    name: "ICARUS AI Assistant",
    color: "violet-500"
  }}
  suggestions={[
    { id: '1', text: "Ver alertas", icon: Bell, action: () => {} }
  ]}
  enableVoice
  enableFileUpload
  onSendMessage={(msg) => console.log(msg)}
/>

// Suggestions Panel
<SuggestionsPanel 
  suggestions={[
    { id: '1', text: "Ver alertas ativos", icon: Bell },
    { id: '2', text: "Iniciar treinamento", icon: GraduationCap }
  ]}
  onSelect={(suggestion) => handleSelect(suggestion)}
/>
```

---

## 🎨 Design Tokens

### Colors

```tsx
// CSS Variables
className="bg-orx-bg-surface"
className="text-orx-text-primary"
className="border-orx-border-default"

// Tailwind (via theme extension)
className="bg-violet-500"
className="text-green-600"
```

### Shadows

```tsx
className="shadow-neumo-sm"      // Level 1
className="shadow-neumo"         // Level 2
className="shadow-neumo-lg"      // Level 3
className="shadow-neumo-inset"   // Inset
```

### Spacing

```tsx
className="p-4"   // 16px
className="gap-6" // 24px
className="m-8"   // 32px
```

### Border Radius

```tsx
className="rounded-lg"    // 12px
className="rounded-xl"    // 16px
className="rounded-2xl"   // 24px
className="rounded-full"  // 9999px
```

---

## 🎯 Common Patterns

### Form with Validation

```tsx
<Card variant="neumo" padding="lg">
  <CardHeader>
    <CardTitle>Sign Up</CardTitle>
  </CardHeader>
  
  <CardContent className="space-y-4">
    <Input 
      label="Email"
      type="email"
      leftIcon={Mail}
      required
      error={errors.email}
    />
    
    <Input 
      label="Password"
      type="password"
      leftIcon={Lock}
      required
      error={errors.password}
    />
  </CardContent>
  
  <CardFooter className="flex justify-end gap-2">
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary" loading={isSubmitting}>
      Sign Up
    </Button>
  </CardFooter>
</Card>
```

### KPI Dashboard

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card variant="neumo" hoverable>
    <CardContent className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
        <Users className="text-white" size={24} />
      </div>
      <div>
        <p className="text-sm text-orx-text-muted">Users</p>
        <p className="text-2xl font-bold">1,847</p>
        <p className="text-xs text-green-500">+12.5%</p>
      </div>
    </CardContent>
  </Card>
</div>
```

### Search Bar

```tsx
<Input 
  variant="neumo"
  placeholder="Buscar médicos, cirurgias, produtos..."
  leftIcon={Search}
  className="max-w-xl"
/>
```

### Action Buttons

```tsx
<div className="flex gap-2">
  <Button variant="ghost" leftIcon={Filter}>
    Filter
  </Button>
  <Button variant="ghost" leftIcon={Download}>
    Export
  </Button>
  <Button variant="primary" leftIcon={Plus}>
    Add New
  </Button>
</div>
```

---

## 🌓 Dark Mode

All components automatically support dark mode via CSS variables:

```tsx
// No code changes needed!
// Components use design tokens that adapt to dark mode

// Force dark mode (optional)
<html className="dark">
  {/* Your app */}
</html>
```

---

## ♿ Accessibility

### Keyboard Navigation

- **Tab** - Navigate between elements
- **Enter/Space** - Activate buttons
- **Escape** - Close modals

### ARIA Labels

```tsx
<Button aria-label="Close dialog">
  <X />
</Button>

<Input 
  label="Email"
  aria-describedby="email-hint"
  aria-invalid={hasError}
/>
```

### Focus Management

```tsx
// Auto-focus on mount
<Input autoFocus />

// Programmatic focus
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();
```

---

## 📱 Responsive Design

### Breakpoints

```tsx
// Tailwind breakpoints
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"
```

### Mobile-First

```tsx
// Start with mobile, add larger screens
<Button 
  size="sm"           // Mobile
  className="md:size-md lg:size-lg"  // Tablet & Desktop
>
  Responsive
</Button>
```

---

## 🔧 Customization

### Extending Components

```tsx
// Custom button variant
<Button 
  variant="neumo"
  className="bg-gradient-to-r from-purple-500 to-pink-500"
>
  Custom Gradient
</Button>

// Custom card styling
<Card 
  variant="glass"
  className="backdrop-blur-2xl border-2 border-white/30"
>
  Enhanced Glass
</Card>
```

### Using Design Tokens

```tsx
// In your custom components
<div className="bg-orx-bg-surface text-orx-text-primary shadow-neumo">
  Custom component using design tokens
</div>
```

---

## 📦 Import Cheat Sheet

```tsx
// Components
import { Button } from '@/components/oraclusx-ds/Button';
import { Input } from '@/components/oraclusx-ds/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/oraclusx-ds/Card';
import { ChatbotFAB, ChatbotWindow, SuggestionsPanel } from '@/components/oraclusx-ds/chatbot';

// Icons
import { Plus, Mail, Search, User, Settings } from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';
```

---

**Quick Tip:** Bookmark this page for fast reference! 🔖