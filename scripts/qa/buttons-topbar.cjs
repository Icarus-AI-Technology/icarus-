#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'src', 'components', 'layout', 'IcarusTopbar.tsx');
const code = fs.readFileSync(file, 'utf-8');
const buttons = [
  'onToggleSidebar',
  'onOpenHelp',
  'onOpenNotifications',
  'onToggleDarkMode',
  'onOpenSettings',
];
const missing = buttons.filter((handler) => !code.includes(`onClick={${handler}}`));

if (missing.length === 0) {
  console.log('✅ Topbar: todos os botões possuem handlers declarados.');
} else {
  console.error('❌ Topbar: handlers ausentes:', missing);
  process.exit(1);
}
