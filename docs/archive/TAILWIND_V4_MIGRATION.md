# Tailwind CSS v4 Migration Guide

## Overview
This document outlines the migration from Tailwind CSS v3 to v4 for the ICARUS project.

## What Changed in Tailwind v4

### 1. **CSS-First Configuration**
- **v3**: JavaScript config file (`tailwind.config.js`)
- **v4**: CSS-based configuration using `@theme` directive

### 2. **New Vite Plugin**
- **v3**: PostCSS plugin
- **v4**: Native Vite plugin (`@tailwindcss/vite`)

### 3. **Import Changes**
- **v3**: `@tailwind base; @tailwind components; @tailwind utilities;`
- **v4**: `@import "tailwindcss";`

## Migration Steps Completed

### ✅ Step 1: Package Installation
```bash
npm install -D tailwindcss@next @tailwindcss/vite@next
```

### ✅ Step 2: Created New Theme File
- **File**: `src/styles/tailwind-v4-theme.css`
- **Purpose**: CSS-based theme configuration using `@theme` directive
- **Features**:
  - All custom colors from v3 config
  - Custom spacing, border radius, shadows
  - OraclusX design tokens
  - Neumorphic shadows
  - Animations and keyframes

### ✅ Step 3: Updated Vite Configuration
- **File**: `vite.config.ts`
- **Change**: Added `@tailwindcss/vite` plugin
```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), contactApiPlugin()],
  // ...
});
```

## Next Steps (To Complete After npm update finishes)

### Step 4: Update Main CSS Entry Point
Update `src/index.css` or `src/globals.css`:

**Before (v3):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**After (v4):**
```css
@import "tailwindcss";
@import "./styles/tailwind-v4-theme.css";
```

### Step 5: Remove Old Config Files
- Delete `tailwind.config.js` (no longer needed)
- Delete `postcss.config.js` (Tailwind v4 doesn't use PostCSS)

### Step 6: Update Package Scripts
No changes needed - all scripts remain the same.

### Step 7: Test the Application
1. Stop dev server
2. Clear cache: `rm -rf node_modules/.vite`
3. Restart dev server: `npm run dev`
4. Test all pages and components
5. Verify neumorphic styles are working

## Breaking Changes to Watch For

### 1. **Custom Plugin Syntax**
If you have custom Tailwind plugins, they need to be rewritten for v4.

### 2. **JIT Mode**
v4 has JIT mode built-in and always enabled (no configuration needed).

### 3. **Dark Mode**
Dark mode configuration stays in CSS using `@media (prefers-color-scheme: dark)` or class-based.

### 4. **Color Opacity Modifiers**
- **v3**: `bg-blue-500/50`
- **v4**: Same syntax works

### 5. **Arbitrary Values**
- **v3**: `w-[123px]`
- **v4**: Same syntax works

## Compatibility

### ✅ What Still Works
- All utility classes
- Arbitrary values
- Color opacity modifiers
- Responsive prefixes
- Hover/focus/active states
- Dark mode
- Custom CSS variables

### ⚠️ What Needs Attention
- Custom plugins (if any)
- Third-party Tailwind plugins (check v4 compatibility)

## Benefits of v4

1. **Faster Build Times**: New Rust-based engine (Oxide)
2. **Smaller Bundle Size**: More efficient CSS generation
3. **Better DX**: CSS-first configuration is more intuitive
4. **Native CSS Features**: Better integration with modern CSS
5. **Improved Performance**: Lightning-fast HMR

## Rollback Plan

If issues arise, rollback is simple:

```bash
npm install -D tailwindcss@3.4.10
npm uninstall @tailwindcss/vite
```

Then:
1. Restore `tailwind.config.js`
2. Restore `postcss.config.js`
3. Revert `vite.config.ts`
4. Revert CSS imports

## Resources

- [Tailwind v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Vite Plugin Docs](https://github.com/tailwindlabs/tailwindcss-vite)

## Status

- ✅ Packages installed
- ✅ Theme file created
- ✅ Vite config updated
- ⏳ Waiting for npm update to complete
- ⏳ CSS imports to be updated
- ⏳ Testing pending