# 🎨 ICARUS Design System v5.1.0

**OraclusX DS - Neumorphism 3D + Glassmorphism**

---

## 🚀 What's New in v5.1.0

### ✨ Consolidated Components

We've unified multiple component implementations into single, powerful components:

- **Button** - Merged `Button`, `NeumoButton`, and `ui/button` → One component with variants
- **Input** - Merged `Input`, `NeumoInput`, and `ui/input` → One component with variants  
- **Card** - Merged `Card`, `NeomorphicCard`, and `GlassCard` → One component with variants

### 🤖 Enhanced Chatbot

New AI-focused chatbot system with:

- **Bot Icon** - Professional AI assistant appearance (Bot/BrainCircuit/Sparkles)
- **Suggestions Panel** - Quick action buttons for common tasks
- **Module Context** - Color-coded by module for visual consistency
- **Voice Input** - Enhanced voice recognition UI
- **File Upload** - Visual feedback for document uploads

### 📦 Migration Tools

- **Automated Migration Script** - Updates 300+ import statements automatically
- **Dry Run Mode** - Preview changes before applying
- **Migration Report** - Detailed JSON report of all changes

### 📚 Documentation

- **Complete Style Guide** - Comprehensive component documentation
- **Migration Guide** - Step-by-step migration instructions
- **Quick Reference** - One-page cheat sheet
- **Code Examples** - Real-world usage patterns

---

## 📖 Quick Start

### Installation

```bash
# Already installed in your project
# No additional dependencies needed
```

### Basic Usage

```tsx
import { Button, Input, Card } from '@/components/oraclusx-ds';

function MyComponent() {
  return (
    <Card variant="neumo" padding="lg">
      <Input label="Email" leftIcon={Mail} />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### Chatbot Usage

```tsx
import { ChatbotFAB, ChatbotWindow } from '@/components/oraclusx-ds/chatbot';

function MyApp() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <ChatbotFAB 
        moduleColor="violet-500"
        onClick={() => setIsOpen(true)}
      />
      
      <ChatbotWindow 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        moduleContext={{ name: "ICARUS AI", color: "violet-500" }}
      />
    </>
  );
}
```

---

## 🔄 Migration

### Automated Migration (Recommended)

```bash
# 1. Preview changes
npm run migrate:imports:dry

# 2. Apply changes
npm run migrate:imports

# 3. Verify
npm run type-check
```

### Manual Migration

See [docs/design-system/MIGRATION.md](./docs/design-system/MIGRATION.md) for detailed instructions.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Style Guide](./docs/design-system/README.md) | Complete design system documentation |
| [Migration Guide](./docs/design-system/MIGRATION.md) | Step-by-step migration instructions |
| [Quick Reference](./docs/design-system/QUICK-REFERENCE.md) | One-page component cheat sheet |
| [Examples](./docs/design-system/examples/component-examples.tsx) | Real-world code examples |

---

## 🎯 Component Overview

### Button

```tsx
<Button variant="primary" leftIcon={Plus} loading>
  Add New
</Button>
```

**Variants:** primary, secondary, success, warning, danger, ghost, neumo, outline, link  
**Sizes:** sm, md, lg, xl, icon

### Input

```tsx
<Input 
  label="Email"
  leftIcon={Mail}
  error="Invalid email"
  variant="neumo"
/>
```

**Variants:** neumo, flat, ghost  
**Sizes:** sm, md, lg

### Card

```tsx
<Card variant="neumo" padding="lg" hoverable>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Variants:** neumo, glass, elevated, flat, pressed  
**Padding:** none, sm, md, lg, xl

### Chatbot

```tsx
<ChatbotFAB 
  moduleColor="violet-500"
  iconVariant="bot"
  badge={3}
/>
```

**Icon Variants:** bot, brain, sparkles  
**Module Colors:** violet-500, blue-500, green-500, orange-500, pink-500, cyan-500

---

## 🎨 Design Tokens

### Colors

```css
--orx-primary: #6366f1
--orx-success: #10b981
--orx-warning: #f59e0b
--orx-danger: #ef4444
```

### Shadows

```css
--shadow-neumo-sm    /* Level 1 - Cards */
--shadow-neumo       /* Level 2 - Interactive */
--shadow-neumo-lg    /* Level 3 - Overlays */
```

### Spacing

```css
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
```

---

## ♿ Accessibility

All components meet WCAG 2.1 AA standards:

- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ Focus indicators (3px outline)
- ✅ ARIA labels and roles
- ✅ Screen reader support
- ✅ Color contrast (4.5:1 minimum)

---

## 🐛 Troubleshooting

### TypeScript Errors

```bash
# Clear cache and restart
rm -rf node_modules/.cache
npm run type-check
```

### Missing Styles

Ensure design tokens are imported in your global CSS:

```css
@import "./design-tokens.css";
@import "./neumorphic-tokens.css";
@import "./oraclusx-ds.css";
```

### Import Errors

Check that you're using the correct import path:

```tsx
// ✅ Correct
import { Button } from '@/components/oraclusx-ds/Button';

// ❌ Incorrect
import { Button } from '@/components/ui/button';
```

---

## 📊 Migration Checklist

- [ ] Run migration script
- [ ] Update imports
- [ ] Fix TypeScript errors
- [ ] Test all pages
- [ ] Test dark mode
- [ ] Test responsive layouts
- [ ] Test keyboard navigation
- [ ] Update tests
- [ ] Deploy to staging

---

## 🤝 Contributing

When adding new components:

1. Follow existing patterns
2. Use design tokens (no hardcoded colors)
3. Support dark mode
4. Add TypeScript types
5. Include ARIA attributes
6. Test keyboard navigation
7. Add usage examples

---

## 📞 Support

- **Documentation:** `/docs/design-system/`
- **Components:** `/src/components/oraclusx-ds/`
- **Migration Script:** `/scripts/migrate-imports.ts`

---

## 📝 Changelog

### v5.1.0 (2025)

**Added:**
- Consolidated Button component
- Consolidated Input component
- Consolidated Card component
- Enhanced Chatbot with AI-focused design
- Suggestions Panel for chatbot
- Automated migration script
- Comprehensive style guide
- Migration documentation
- Quick reference guide
- Code examples

**Changed:**
- Button: Merged 3 implementations into 1
- Input: Merged 3 implementations into 1 (⚠️ `size` → `inputSize`)
- Card: Merged 4 implementations into 1
- Chatbot: New barrel export structure

**Deprecated:**
- `NeumoButton` → Use `Button variant="neumo"`
- `NeumoInput` → Use `Input variant="neumo"`
- `NeomorphicCard` → Use `Card variant="neumo"`
- `GlassCard` → Use `Card variant="glass"`

---

**Version:** 5.1.0  
**Last Updated:** 2025  
**License:** Proprietary  
**Maintained by:** ICARUS Development Team