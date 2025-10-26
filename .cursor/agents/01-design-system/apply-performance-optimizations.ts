#!/usr/bin/env npx tsx

/**
 * Performance Optimization Script
 * Applies React.memo to all OraclusX DS components
 * Target: 3-performance-optimization
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DS_DIR = join(process.cwd(), 'src/components/oraclusx-ds');

// Components that should use React.memo
const COMPONENTS_TO_OPTIMIZE = [
  'Button',
  'Input',
  'Card',
  'Badge',
  'Checkbox',
  'Switch',
  'Textarea',
  'Select',
  'Radio',
  'Slider',
  'Progress',
  'RadialProgress',
  'Tabs',
  'Tooltip',
  'Dialog',
  'Toast',
  'Accordion',
  'Alert',
  'Avatar',
  'Dropdown',
  'Modal',
  'Pagination',
  'Breadcrumb',
  'Skeleton',
  'Stepper',
  'Table',
  'IconButtonNeu',
  'DatePicker',
];

function applyReactMemo(content: string, componentName: string): string {
  // Skip if already has React.memo
  if (content.includes('React.memo')) {
    console.log(`  ⏭️  ${componentName} already has React.memo`);
    return content;
  }

  // Find the export statement
  const exportRegex = /export const (\w+) = React\.forwardRef</;
  const match = content.match(exportRegex);

  if (!match) {
    console.log(`  ⚠️  ${componentName} - No forwardRef found`);
    return content;
  }

  const compName = match[1];

  // Add displayName if not present
  let updatedContent = content;
  if (!content.includes(`${compName}.displayName`)) {
    const insertPos = content.lastIndexOf(');');
    if (insertPos !== -1) {
      updatedContent = 
        content.slice(0, insertPos + 2) + 
        `\n\n${compName}.displayName = 'OraclusX${compName}';\n` + 
        content.slice(insertPos + 2);
    }
  }

  // Wrap the forwardRef with React.memo
  updatedContent = updatedContent.replace(
    /export const (\w+) = React\.forwardRef/,
    'const $1Component = React.forwardRef'
  );

  // Add memo export at the end
  const lastExport = updatedContent.lastIndexOf(`export`);
  if (lastExport !== -1) {
    updatedContent = 
      updatedContent.slice(0, lastExport) + 
      `export const ${compName} = React.memo(${compName}Component);\n\n` +
      updatedContent.slice(lastExport);
  }

  console.log(`  ✅ ${componentName} - React.memo applied`);
  return updatedContent;
}

function optimizeComponent(filePath: string, componentName: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Apply React.memo
    const optimized = applyReactMemo(content, componentName);
    
    if (optimized !== content) {
      writeFileSync(filePath, optimized);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`  ❌ Error optimizing ${componentName}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Performance Optimization...\n');
  
  let optimized = 0;
  let skipped = 0;
  let errors = 0;

  for (const componentName of COMPONENTS_TO_OPTIMIZE) {
    const filePath = join(DS_DIR, `${componentName}.tsx`);
    
    try {
      const result = optimizeComponent(filePath, componentName);
      if (result) {
        optimized++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`❌ ${componentName}: ${error}`);
      errors++;
    }
  }

  console.log('\n📊 Performance Optimization Summary:');
  console.log(`   ✅ Optimized: ${optimized}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📦 Total: ${COMPONENTS_TO_OPTIMIZE.length}`);

  if (errors === 0) {
    console.log('\n✨ All components optimized successfully!');
  }
}

main().catch(console.error);

