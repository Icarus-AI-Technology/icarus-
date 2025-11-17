#!/bin/bash

# ICARUS v5.0 - Comandos Rápidos de Deploy
# Execute este script para ver os comandos necessários

cat << 'EOF'
╔════════════════════════════════════════════════════════╗
║                                                        ║
║         ICARUS v5.0 - DEPLOY EM 3 PASSOS             ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

✅ BUILD COMPLETO (12 MB)
⏱️  Tempo restante: 22 minutos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 PASSO 1: Obter Credenciais Supabase (5 min)

  1. Abrir dashboard:
EOF

echo "     open https://supabase.com/dashboard"

cat << 'EOF'

  2. Settings → API → Copiar:
     - Project URL
     - anon public key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 PASSO 2: Configurar .env.prod (2 min)

  Execute:
EOF

echo "     nano /Users/daxmeneghel/icarus-v5.0/.env.prod"

cat << 'EOF'

  Substituir:
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here

  Por valores reais copiados do Supabase
  Salvar: Ctrl+O, Enter, Ctrl+X

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 PASSO 3: Deploy Vercel (15 min)

  Executar sequencialmente:
EOF

cat << 'COMMANDS'
     cd /Users/daxmeneghel/icarus-v5.0
     vercel login
     vercel
     vercel env add VITE_SUPABASE_URL production
     vercel env add VITE_SUPABASE_ANON_KEY production
     vercel env add VITE_ENVIRONMENT production
     vercel --prod
COMMANDS

cat << 'EOF'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ URL final: https://icarus-v5.vercel.app (ou similar)

📚 Documentação completa:
   - DEPLOY_AGORA.md
   - ICARUS_V5_GUIA_DEPLOYMENT.md
   - ICARUS_V5_PROXIMAS_ACOES.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 COMEÇAR AGORA:

EOF

echo "   open https://supabase.com/dashboard"
echo ""

