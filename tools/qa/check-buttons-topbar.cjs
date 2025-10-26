#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const TOPBAR_PATH = path.resolve(__dirname, '..', '..', 'src', 'components', 'layout', 'IcarusTopbar.tsx');
const REQUIRED = [
  { handler: 'onToggleSidebar', label: 'Menu lateral' },
  { handler: 'onOpenHelp', label: 'Central de ajuda' },
  { handler: 'onOpenNotifications', label: 'Notificações' },
  { handler: 'onToggleDarkMode', label: 'Troca de tema' },
  { handler: 'onOpenSettings', label: 'Configurações / Perfil' }
];

if (!fs.existsSync(TOPBAR_PATH)) {
  console.error(`❌  Topbar não encontrada em ${TOPBAR_PATH}`);
  process.exit(1);
}

const code = fs.readFileSync(TOPBAR_PATH, 'utf8');
const missingHandlers = REQUIRED.filter(({ handler }) => !code.includes(`onClick={${handler}}`));

if (missingHandlers.length > 0) {
  console.error('❌  Handlers ausentes na Topbar:');
  missingHandlers.forEach(({ handler, label }) => console.error(`   • ${label} → ${handler}`));
  process.exit(1);
}

console.log('✅  Topbar: todos os botões e handlers obrigatórios presentes.');
