# Migration Guide - OraclusX Design System v5.1.0

This guide helps you migrate from old component imports to the new consolidated design system.

---

## 🚀 Quick Start

### Automated Migration (Recommended)

```bash
# 1. Preview changes (dry run)
npx tsx scripts/migrate-imports.ts --dry-run

# 2. Review the output

# 3. Apply changes
npx tsx scripts/migrate-imports.ts

# 4. Verify with type checking
npm run type-check

# 5. Test your application
npm run dev
```

### Manual Migration

If you prefer to migrate manually or need to handle edge cases:

---

## 📋 Component Migration Map

### Button Components

| Old Import | New Import | Notes |
|------------|------------|-------|
| `@/components/ui/button` | `@/components/oraclusx-ds/Button` | Use `variant` prop |
| `@/components/oraclusx-ds/NeumoButton` | `@/components/oraclusx-ds/Button` | Use `variant="neumo"` |
| `@/components/oraclusx-ds/Button` (old) | `@/components/oraclusx-ds/Button` (new) | Already correct path |

**Component Usage:**

```tsx
// ❌ Old
<NeumoButton variant="primary" size="lg">Save</NeumoButton>

// ✅ New
<Button variant="primary" size="lg">Save</Button>
```

### Input Components

| Old Import | New Import | Notes |
|------------|------------|-------|
| `@/components/ui/input` | `@/components/oraclusx-ds/Input` | Use `variant` prop |
| `@/components/oraclusx-ds/NeumoInput` | `@/components/oraclusx-ds/Input` | Use `variant="neumo"` |
| `@/components/oraclusx-ds/Input` (old) | `@/components/oraclusx-ds/Input` (new) | Already correct path |

**Component Usage:**

```tsx
// ❌ Old
<NeumoInput label="Email" leftIcon={Mail} size="md" />

// ✅ New
<Input label="Email" leftIcon={Mail} inputSize="md" variant="neumo" />
```

**⚠️ Note:** `size` prop renamed to `inputSize` to avoid conflicts with HTML `size` attribute.

### Card Components

| Old Import | New Import | Notes |
|------------|------------|-------|
| `@/components/ui/card` | `@/components/oraclusx-ds/Card` | Use `variant` prop |
| `@/components/oraclusx-ds/NeomorphicCard` | `@/components/oraclusx-ds/Card` | Use `variant="neumo"` |
| `@/components/oraclusx-ds/GlassCard` | `@/components/oraclusx-ds/Card` | Use `variant="glass"` |
| `@/components/oraclusx-ds/Card` (old) | `@/components/oraclusx-ds/Card` (new) | Already correct path |

**Component Usage:**

```tsx
// ❌ Old
<NeomorphicCard padding="lg">Content</NeomorphicCard>
<GlassCard padding="md">Glass content</GlassCard>

// ✅ New
<Card variant="neumo" padding="lg">Content</Card>
<Card variant="glass" padding="md">Glass content</Card>
```

### Chatbot Components

| Old Import | New Import | Notes |
|------------|------------|-------|
| `@/components/oraclusx-ds/ChatbotFAB` | `@/components/oraclusx-ds/chatbot` | Barrel export |
| `@/components/oraclusx-ds/ChatbotWithResearch` | `@/components/oraclusx-ds/chatbot` | Use `ChatbotWindow` |

**Component Usage:**

```tsx
// ❌ Old
import { ChatbotFAB } from '@/components/oraclusx-ds/ChatbotFAB';
import { ChatbotWithResearch } from '@/components/oraclusx-ds/ChatbotWithResearch';

// ✅ New
import { ChatbotFAB, ChatbotWindow } from '@/components/oraclusx-ds/chatbot';
```

---

## 🔍 Step-by-Step Migration

### Step 1: Backup Your Code

```bash
git checkout -b design-system-migration
git commit -am "Pre-migration checkpoint"
```

### Step 2: Run Migration Script

```bash
# Preview changes
npx tsx scripts/migrate-imports.ts --dry-run

# Review the output carefully
# Check migration-report.json for details

# Apply changes
npx tsx scripts/migrate-imports.ts
```

### Step 3: Handle Edge Cases

Some patterns may need manual updates:

#### Prop Name Changes

**Input component:**

```tsx
// ❌ Old
<NeumoInput size="md" />

// ✅ New
<Input inputSize="md" />
```

#### Variant Mapping

**Button variants:**

```tsx
// ❌ Old - NeumoButton variants
<NeumoButton variant="primary" />      // Gradient
<NeumoButton variant="secondary" />    // Neumo surface
<NeumoButton variant="neumo" />        // Full neumo

// ✅ New - Button variants (same names work)
<Button variant="primary" />           // Gradient
<Button variant="secondary" />         // Neumo surface
<Button variant="neumo" />             // Full neumo (default)
```

### Step 4: Update Barrel Exports

If you have barrel exports (`index.ts` files), update them:

```tsx
// ❌ Old
export { NeumoButton } from './NeumoButton';
export { NeumoInput } from './NeumoInput';

// ✅ New
export { Button } from './Button';
export { Input } from './Input';
```

### Step 5: Type Checking

```bash
npm run type-check
```

Fix any TypeScript errors that appear.

### Step 6: Test Your Application

```bash
npm run dev
```

Test all affected pages and components.

---

## ⚠️ Breaking Changes

### Button

- **No breaking changes** - All props remain the same
- `NeumoButton` → `Button` (component name change only)

### Input

- **BREAKING:** `size` prop renamed to `inputSize`
  ```tsx
  // ❌ Old
  <NeumoInput size="md" />
  
  // ✅ New
  <Input inputSize="md" />
  ```

### Card

- **No breaking changes** - All props remain the same
- `NeomorphicCard` → `Card variant="neumo"`
- `GlassCard` → `Card variant="glass"`

### Chatbot

- **BREAKING:** `ChatbotWithResearch` renamed to `ChatbotWindow`
- **BREAKING:** Import from barrel export
  ```tsx
  // ❌ Old
  import { ChatbotFAB } from '@/components/oraclusx-ds/ChatbotFAB';
  
  // ✅ New
  import { ChatbotFAB } from '@/components/oraclusx-ds/chatbot';
  ```

---

## 🐛 Troubleshooting

### Issue: TypeScript errors after migration

**Solution:**

1. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache
   ```

2. Restart TypeScript server in your IDE

3. Run type check:
   ```bash
   npm run type-check
   ```

### Issue: Components not rendering correctly

**Solution:**

1. Check variant props are correct:
   ```tsx
   // Ensure you're using the right variant
   <Button variant="neumo" />  // Not "neumorphic"
   ```

2. Verify imports:
   ```tsx
   // Correct import path
   import { Button } from '@/components/oraclusx-ds/Button';
   ```

### Issue: Missing styles

**Solution:**

1. Ensure design tokens are imported:
   ```css
   /* In your global CSS */
   @import "./design-tokens.css";
   @import "./neumorphic-tokens.css";
   @import "./oraclusx-ds.css";
   ```

2. Check Tailwind config includes the new paths

---

## 📊 Migration Checklist

Use this checklist to track your migration progress:

- [ ] Run migration script in dry-run mode
- [ ] Review migration report
- [ ] Apply automated migrations
- [ ] Update barrel exports
- [ ] Fix `size` → `inputSize` for Input components
- [ ] Update chatbot imports to barrel export
- [ ] Run type checking (`npm run type-check`)
- [ ] Test all affected pages
- [ ] Test dark mode
- [ ] Test responsive layouts
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Update Storybook stories (if applicable)
- [ ] Update tests
- [ ] Commit changes
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Deploy to production

---

## 🎯 Module-Specific Notes

### Dashboard Module

The dashboard uses many KPI cards. Update them to use the new Card component:

```tsx
// ✅ New pattern
<Card variant="neumo" hoverable>
  <CardContent className="flex items-center gap-4">
    {/* KPI content */}
  </CardContent>
</Card>
```

### Forms Modules

Forms use many inputs. Remember the `size` → `inputSize` change:

```tsx
// ✅ New pattern
<Input 
  label="Field Name"
  inputSize="md"
  variant="neumo"
  leftIcon={Icon}
/>
```

### Chatbot Integration

All modules with chatbot need to update to the new barrel export:

```tsx
// ✅ New pattern
import { ChatbotFAB, ChatbotWindow, SuggestionsPanel } from '@/components/oraclusx-ds/chatbot';
```

---

## 📞 Getting Help

If you encounter issues during migration:

1. Check the [Style Guide](./README.md)
2. Review the migration report: `migration-report.json`
3. Check component examples in `/docs/design-system/examples/`
4. Contact the design system team

---

## 🎉 Post-Migration

After successful migration:

1. **Delete old component files** (optional, but recommended):
   ```bash
   # Backup first!
   rm src/components/oraclusx-ds/NeumoButton.tsx
   rm src/components/oraclusx-ds/NeumoInput.tsx
   rm src/components/oraclusx-ds/NeomorphicCard.tsx
   rm src/components/oraclusx-ds/GlassCard.tsx
   ```

2. **Update documentation** to reference new components

3. **Share migration report** with the team

4. **Celebrate!** 🎊 You're now using the consolidated design system

---

**Last Updated:** 2025  
**Version:** 5.1.0