#!/bin/bash
# CI/CD Validation - Bloqueia deploy se detectar localhost em produção

set -e

echo "🔍 Validando configurações de IA para produção..."

if [ "$NODE_ENV" = "production" ]; then
  echo "📍 Modo PRODUÇÃO - Validando endpoints..."
  
  # Verifica .env.production
  if grep -q "localhost" .env.production 2>/dev/null; then
    echo "🚨 ERRO: localhost detectado em .env.production"
    echo "   Ação: Substituir por endpoints cloud"
    exit 1
  fi
  
  # Verifica arquivos de config
  if grep -r "localhost:11434" src/ 2>/dev/null; then
    echo "🚨 ERRO: Ollama local detectado em src/"
    echo "   Ação: Usar Edge Functions em produção"
    exit 1
  fi
  
  echo "✅ Validação passou - Nenhum endpoint local em produção"
else
  echo "📍 Modo DEV - Localhost permitido"
fi

exit 0
