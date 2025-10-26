#!/usr/bin/env npx tsx

/**
 * Automated Accessibility Testing Setup
 * Integrates axe-core with CI/CD pipeline
 * Target: 4-automated-a11y-testing
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

async function runAxeTest(): Promise<{
  violations: number;
  passes: number;
  incomplete: number;
}> {
  return new Promise((resolve, reject) => {
    console.log('🔍 Running axe-core accessibility tests...\n');
    
    const axe = spawn('npx', [
      '-y',
      '@axe-core/cli',
      'http://localhost:4174/',
      '--tags',
      'wcag2a,wcag2aa',
      '--save',
      './docs/axe-a11y-report.json',
    ]);

    let output = '';
    let errorOutput = '';

    axe.stdout.on('data', (data) => {
      const str = data.toString();
      output += str;
      process.stdout.write(str);
    });

    axe.stderr.on('data', (data) => {
      const str = data.toString();
      errorOutput += str;
      process.stderr.write(str);
    });

    axe.on('close', (code) => {
      if (code !== 0 && !output.includes('violations')) {
        reject(new Error(`axe-core exited with code ${code}`));
        return;
      }

      // Parse output for results
      const violationsMatch = output.match(/(\d+) violations? found/);
      const passesMatch = output.match(/(\d+) passes? found/);
      const incompleteMatch = output.match(/(\d+) incomplete? found/);

      resolve({
        violations: violationsMatch ? parseInt(violationsMatch[1]) : 0,
        passes: passesMatch ? parseInt(passesMatch[1]) : 0,
        incomplete: incompleteMatch ? parseInt(incompleteMatch[1]) : 0,
      });
    });
  });
}

function generateCIConfig() {
  const githubWorkflow = `name: Accessibility Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  a11y-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build project
        run: pnpm build
      
      - name: Start preview server
        run: |
          pnpm preview --port 4174 &
          sleep 10
      
      - name: Run axe-core tests
        run: |
          npx -y @axe-core/cli http://localhost:4174/ \\
            --tags wcag2a,wcag2aa \\
            --save ./axe-report.json \\
            --exit
      
      - name: Upload accessibility report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: axe-accessibility-report
          path: axe-report.json
`;

  const ciFilePath = join(PROJECT_ROOT, '.github/workflows/a11y-tests.yml');
  
  try {
    writeFileSync(ciFilePath, githubWorkflow);
    console.log('✅ GitHub Actions workflow created at .github/workflows/a11y-tests.yml');
  } catch (error) {
    console.log('⚠️  Could not create GitHub Actions workflow:', error);
  }
}

function generateNpmScript() {
  console.log('\n📝 Add these scripts to package.json:');
  console.log(`
"scripts": {
  "test:a11y": "npx -y @axe-core/cli http://localhost:4174/ --tags wcag2a,wcag2aa --save ./docs/axe-report.json",
  "test:a11y:ci": "start-server-and-test preview http://localhost:4174 test:a11y"
}
`);
}

function generatePreCommitHook() {
  const preCommit = `#!/bin/sh
# Pre-commit hook for accessibility testing

echo "Running accessibility checks..."

# Check if preview server is running
if ! curl -s http://localhost:4174/ > /dev/null; then
  echo "⚠️  Preview server not running on port 4174"
  echo "   Run 'pnpm preview --port 4174' in another terminal"
  exit 1
fi

# Run axe-core
npx -y @axe-core/cli http://localhost:4174/ --tags wcag2a,wcag2aa --exit

if [ $? -ne 0 ]; then
  echo "❌ Accessibility violations found. Please fix before committing."
  exit 1
fi

echo "✅ Accessibility checks passed!"
exit 0
`;

  const hookPath = join(PROJECT_ROOT, '.git/hooks/pre-commit');
  
  try {
    writeFileSync(hookPath, preCommit, { mode: 0o755 });
    console.log('✅ Pre-commit hook created at .git/hooks/pre-commit');
  } catch (error) {
    console.log('⚠️  Could not create pre-commit hook:', error);
  }
}

async function main() {
  console.log('♿ Setting up Automated Accessibility Testing\n');
  console.log('═══════════════════════════════════════════════\n');

  // Check if preview server is running
  console.log('Checking if preview server is running...');
  try {
    const response = await fetch('http://localhost:4174/');
    if (response.ok) {
      console.log('✅ Preview server is running\n');
      
      // Run axe test
      try {
        const results = await runAxeTest();
        
        console.log('\n📊 Accessibility Test Results:');
        console.log(`   ✅ Passes: ${results.passes}`);
        console.log(`   ❌ Violations: ${results.violations}`);
        console.log(`   ⚠️  Incomplete: ${results.incomplete}`);
        
        if (results.violations === 0) {
          console.log('\n✨ No accessibility violations found!');
        } else {
          console.log('\n⚠️  Accessibility violations detected. Check docs/axe-a11y-report.json');
        }
      } catch (error) {
        console.log('⚠️  Could not run axe-core test:', error);
        console.log('   (Preview server may not be ready or axe-core may need manual setup)');
      }
    }
  } catch (error) {
    console.log('⚠️  Preview server not running on http://localhost:4174/');
    console.log('   Start it with: pnpm preview --port 4174\n');
  }

  // Generate CI/CD configuration
  console.log('\n📦 Generating CI/CD configurations...\n');
  generateCIConfig();
  generateNpmScript();
  generatePreCommitHook();

  console.log('\n✅ Automated Accessibility Testing Setup Complete!\n');
  console.log('Next steps:');
  console.log('  1. Start preview server: pnpm preview --port 4174');
  console.log('  2. Run a11y tests: pnpm test:a11y');
  console.log('  3. Review report: docs/axe-a11y-report.json');
  console.log('  4. Commit .github/workflows/a11y-tests.yml to enable CI/CD');
}

main().catch(console.error);

