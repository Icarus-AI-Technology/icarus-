#!/bin/bash

# Script para adicionar variáveis de ambiente no Vercel
# Uso: ./add-vercel-env.sh

echo "🚀 Adicionando Variáveis de Ambiente no Vercel..."
echo ""

# Variável 1: VITE_SUPABASE_URL
echo "📝 Adicionando VITE_SUPABASE_URL..."
echo "https://ttswvavcisdnonytslom.supabase.co" | npx vercel env add VITE_SUPABASE_URL production
echo "https://ttswvavcisdnonytslom.supabase.co" | npx vercel env add VITE_SUPABASE_URL preview
echo "https://ttswvavcisdnonytslom.supabase.co" | npx vercel env add VITE_SUPABASE_URL development
echo "✅ VITE_SUPABASE_URL adicionada!"
echo ""

# Variável 2: VITE_SUPABASE_ANON_KEY
echo "📝 Adicionando VITE_SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzE1MzksImV4cCI6MjA3NjQwNzUzOX0.pZhNjYp2M9S9wF_drLA6-ZK-tk_GaaJn5kYBTxQE1xg" | npx vercel env add VITE_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzE1MzksImV4cCI6MjA3NjQwNzUzOX0.pZhNjYp2M9S9wF_drLA6-ZK-tk_GaaJn5kYBTxQE1xg" | npx vercel env add VITE_SUPABASE_ANON_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzE1MzksImV4cCI6MjA3NjQwNzUzOX0.pZhNjYp2M9S9wF_drLA6-ZK-tk_GaaJn5kYBTxQE1xg" | npx vercel env add VITE_SUPABASE_ANON_KEY development
echo "✅ VITE_SUPABASE_ANON_KEY adicionada!"
echo ""

# Variável 3: VITE_APP_URL
echo "📝 Adicionando VITE_APP_URL..."
echo "https://icarus-make-gl4ldep38-daxs-projects-5db3d203.vercel.app" | npx vercel env add VITE_APP_URL production
echo "https://icarus-make-gl4ldep38-daxs-projects-5db3d203.vercel.app" | npx vercel env add VITE_APP_URL preview
echo "https://icarus-make-gl4ldep38-daxs-projects-5db3d203.vercel.app" | npx vercel env add VITE_APP_URL development
echo "✅ VITE_APP_URL adicionada!"
echo ""

echo "🎉 Todas as variáveis foram adicionadas!"
echo ""
echo "📋 Verificando variáveis..."
npx vercel env ls
echo ""
echo "🚀 Agora faça o redeploy:"
echo "   npx vercel --prod"

