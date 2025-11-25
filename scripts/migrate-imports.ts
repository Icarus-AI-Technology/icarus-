/**
 * ICARUS Design System - Import Migration Script
 * Version: 5.1.0
 *
 * Automatically migrates old component imports to new consolidated components
 *
 * Usage:
 *   npx tsx scripts/migrate-imports.ts
 *   npx tsx scripts/migrate-imports.ts --dry-run
 *   npx tsx scripts/migrate-imports.ts --path src/components/modules
 */

import * as fs from 'fs';
import { glob } from 'glob';

interface MigrationRule {
  oldImport: RegExp;
  newImport: string;
  description: string;
}

interface MigrationResult {
  file: string;
  changes: number;
  rules: string[];
}

// Migration rules mapping
const MIGRATION_RULES: MigrationRule[] = [
  // Button migrations
  {
    oldImport: /import\s+{\s*Button\s*}\s+from\s+['"]@\/components\/ui\/button['"]/g,
    newImport: "import { Button } from '@/components/oraclusx-ds/Button'",
    description: 'Button: ui/button → oraclusx-ds/Button',
  },
  {
    oldImport:
      /import\s+{\s*NeumoButton\s*}\s+from\s+['"]@\/components\/oraclusx-ds\/NeumoButton['"]/g,
    newImport: "import { Button } from '@/components/oraclusx-ds/Button'",
    description: 'NeumoButton → Button (use variant="neumo")',
  },
  {
    oldImport: /import\s+NeumoButton\s+from\s+['"]@\/components\/oraclusx-ds\/NeumoButton['"]/g,
    newImport: "import { Button } from '@/components/oraclusx-ds/Button'",
    description: 'NeumoButton default import → Button',
  },

  // Input migrations
  {
    oldImport: /import\s+{\s*Input\s*}\s+from\s+['"]@\/components\/ui\/input['"]/g,
    newImport: "import { Input } from '@/components/oraclusx-ds/Input'",
    description: 'Input: ui/input → oraclusx-ds/Input',
  },
  {
    oldImport:
      /import\s+{\s*NeumoInput\s*}\s+from\s+['"]@\/components\/oraclusx-ds\/NeumoInput['"]/g,
    newImport: "import { Input } from '@/components/oraclusx-ds/Input'",
    description: 'NeumoInput → Input (use variant="neumo")',
  },
  {
    oldImport: /import\s+NeumoInput\s+from\s+['"]@\/components\/oraclusx-ds\/NeumoInput['"]/g,
    newImport: "import { Input } from '@/components/oraclusx-ds/Input'",
    description: 'NeumoInput default import → Input',
  },

  // Card migrations
  {
    oldImport: /import\s+{\s*Card\s*}\s+from\s+['"]@\/components\/ui\/card['"]/g,
    newImport: "import { Card } from '@/components/oraclusx-ds/Card'",
    description: 'Card: ui/card → oraclusx-ds/Card',
  },
  {
    oldImport:
      /import\s+{\s*NeomorphicCard\s*}\s+from\s+['"]@\/components\/oraclusx-ds\/NeomorphicCard['"]/g,
    newImport: "import { Card } from '@/components/oraclusx-ds/Card'",
    description: 'NeomorphicCard → Card (use variant="neumo")',
  },
  {
    oldImport: /import\s+{\s*GlassCard\s*}\s+from\s+['"]@\/components\/oraclusx-ds\/GlassCard['"]/g,
    newImport: "import { Card } from '@/components/oraclusx-ds/Card'",
    description: 'GlassCard → Card (use variant="glass")',
  },

  // Chatbot migrations
  {
    oldImport:
      /import\s+{\s*ChatbotFAB\s*}\s+from\s+['"]@\/components\/oraclusx-ds\/ChatbotFAB['"]/g,
    newImport: "import { ChatbotFAB } from '@/components/oraclusx-ds/chatbot'",
    description: 'ChatbotFAB: direct import → chatbot barrel',
  },
  {
    oldImport:
      /import\s+{\s*ChatbotWithResearch\s*}\s+from\s+['"]@\/components\/oraclusx-ds\/ChatbotWithResearch['"]/g,
    newImport: "import { ChatbotWindow } from '@/components/oraclusx-ds/chatbot'",
    description: 'ChatbotWithResearch → ChatbotWindow',
  },
];

// Component usage migrations (for component names in JSX)
const COMPONENT_USAGE_RULES: Array<{ old: RegExp; new: string; note: string }> = [
  {
    old: /<NeumoButton\s/g,
    new: '<Button variant="neumo" ',
    note: 'NeumoButton → Button with variant="neumo"',
  },
  {
    old: /<NeumoInput\s/g,
    new: '<Input variant="neumo" ',
    note: 'NeumoInput → Input with variant="neumo"',
  },
  {
    old: /<\/NeumoButton>/g,
    new: '</Button>',
    note: 'Closing tag: NeumoButton → Button',
  },
  {
    old: /<\/NeumoInput>/g,
    new: '</Input>',
    note: 'Closing tag: NeumoInput → Input',
  },
  {
    old: /<NeomorphicCard\s/g,
    new: '<Card variant="neumo" ',
    note: 'NeomorphicCard → Card with variant="neumo"',
  },
  {
    old: /<\/NeomorphicCard>/g,
    new: '</Card>',
    note: 'Closing tag: NeomorphicCard → Card',
  },
  {
    old: /<GlassCard\s/g,
    new: '<Card variant="glass" ',
    note: 'GlassCard → Card with variant="glass"',
  },
  {
    old: /<\/GlassCard>/g,
    new: '</Card>',
    note: 'Closing tag: GlassCard → Card',
  },
];

class ImportMigrator {
  private dryRun: boolean;
  private results: MigrationResult[] = [];
  private stats = {
    filesScanned: 0,
    filesModified: 0,
    totalChanges: 0,
  };

  constructor(dryRun = false) {
    this.dryRun = dryRun;
  }

  async migrateDirectory(directory: string): Promise<void> {
    console.log(`\n🔍 Scanning directory: ${directory}\n`);

    const files = await glob(`${directory}/**/*.{ts,tsx}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    });

    console.log(`Found ${files.length} TypeScript files\n`);

    for (const file of files) {
      await this.migrateFile(file);
    }

    this.printSummary();
  }

  async migrateFile(filePath: string): Promise<void> {
    this.stats.filesScanned++;

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const appliedRules: string[] = [];
    let changeCount = 0;

    // Apply import migrations
    for (const rule of MIGRATION_RULES) {
      const matches = content.match(rule.oldImport);
      if (matches) {
        content = content.replace(rule.oldImport, rule.newImport);
        appliedRules.push(rule.description);
        changeCount += matches.length;
      }
    }

    // Apply component usage migrations
    for (const rule of COMPONENT_USAGE_RULES) {
      const matches = content.match(rule.old);
      if (matches) {
        content = content.replace(rule.old, rule.new);
        if (!appliedRules.includes(rule.note)) {
          appliedRules.push(rule.note);
        }
        changeCount += matches.length;
      }
    }

    if (content !== originalContent) {
      this.stats.filesModified++;
      this.stats.totalChanges += changeCount;

      this.results.push({
        file: filePath,
        changes: changeCount,
        rules: appliedRules,
      });

      if (!this.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Migrated: ${filePath} (${changeCount} changes)`);
      } else {
        console.log(`🔄 Would migrate: ${filePath} (${changeCount} changes)`);
      }

      appliedRules.forEach((rule) => {
        console.log(`   - ${rule}`);
      });
      console.log('');
    }
  }

  printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Mode: ${this.dryRun ? '🔍 DRY RUN' : '✏️  WRITE'}`);
    console.log(`Files scanned: ${this.stats.filesScanned}`);
    console.log(`Files modified: ${this.stats.filesModified}`);
    console.log(`Total changes: ${this.stats.totalChanges}`);
    console.log('='.repeat(60));

    if (this.results.length > 0) {
      console.log('\n📝 Detailed Results:\n');
      this.results.forEach((result) => {
        console.log(`${result.file}:`);
        result.rules.forEach((rule) => {
          console.log(`  - ${rule}`);
        });
        console.log('');
      });
    }

    if (this.dryRun) {
      console.log('\n💡 Run without --dry-run to apply changes\n');
    } else {
      console.log('\n✨ Migration complete!\n');
      console.log('📌 Next steps:');
      console.log('  1. Run: npm run type-check');
      console.log('  2. Test your application');
      console.log('  3. Commit the changes\n');
    }
  }

  async generateReport(outputPath: string): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      mode: this.dryRun ? 'dry-run' : 'write',
      stats: this.stats,
      results: this.results,
      rules: MIGRATION_RULES.map((r) => r.description),
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n📄 Report saved to: ${outputPath}\n`);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const pathArg = args.find((arg) => arg.startsWith('--path='));
  const targetPath = pathArg ? pathArg.split('=')[1] : 'src';

  console.log('\n' + '='.repeat(60));
  console.log('🚀 ICARUS Design System - Import Migration Tool');
  console.log('='.repeat(60));

  const migrator = new ImportMigrator(dryRun);
  await migrator.migrateDirectory(targetPath);
  await migrator.generateReport('migration-report.json');
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
