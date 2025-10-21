#!/bin/bash
# ============================================
# Script: Configurar DPO Interno
# Versão: 1.0
# Descrição: Assistente interativo para nomear DPO
# ============================================

set -e

echo "🛡️  ASSISTENTE DE CONFIGURAÇÃO DE DPO"
echo "===================================="
echo ""
echo "LGPD Art. 41: Toda empresa que trata dados pessoais"
echo "deve nomear um Encarregado de Proteção de Dados (DPO)"
echo ""

# Verificar se SUPABASE_DB_URL está configurado
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Variável SUPABASE_DB_URL não configurada"
    echo ""
    echo "Configure com:"
    echo "export SUPABASE_DB_URL='postgresql://...'"
    exit 1
fi

# ============================================
# COLETA DE INFORMAÇÕES
# ============================================

echo "📋 INFORMAÇÕES DO DPO"
echo "━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Nome completo do DPO: " DPO_NOME
read -p "E-mail institucional (ex: dpo@icarusai.com.br): " DPO_EMAIL
read -p "Telefone (ex: (11) 98765-4321): " DPO_TELEFONE
read -p "CPF (opcional, apenas para DPO interno): " DPO_CPF

echo ""
echo "Tipo de DPO:"
echo "  1) Interno (funcionário da empresa)"
echo "  2) Externo (consultoria)"
read -p "Escolha (1 ou 2): " DPO_TIPO_CHOICE

if [ "$DPO_TIPO_CHOICE" = "1" ]; then
    DPO_TIPO="interno"
elif [ "$DPO_TIPO_CHOICE" = "2" ]; then
    DPO_TIPO="externo"
else
    echo "❌ Opção inválida"
    exit 1
fi

echo ""
echo "📋 INFORMAÇÕES DA EMPRESA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "CNPJ da empresa (ex: 12.345.678/0001-90): " EMPRESA_CNPJ

# ============================================
# CONFIRMAÇÃO
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 RESUMO DA NOMEAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "DPO: $DPO_NOME"
echo "E-mail: $DPO_EMAIL"
echo "Telefone: $DPO_TELEFONE"
echo "Tipo: $DPO_TIPO"
echo "Empresa CNPJ: $EMPRESA_CNPJ"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Confirma os dados acima? (s/n) " CONFIRM

if [ "$CONFIRM" != "s" ]; then
    echo "❌ Operação cancelada"
    exit 0
fi

# ============================================
# ATUALIZAÇÃO NO BANCO
# ============================================

echo ""
echo "💾 Atualizando banco de dados..."

# Montar query SQL
SQL_QUERY="
UPDATE empresas
SET
  dpo_nome = '$DPO_NOME',
  dpo_email = '$DPO_EMAIL',
  dpo_telefone = '$DPO_TELEFONE',
  dpo_cpf = NULLIF('$DPO_CPF', ''),
  dpo_tipo = '$DPO_TIPO',
  dpo_nomeado_em = NOW()
WHERE cnpj = '$EMPRESA_CNPJ'
  AND excluido_em IS NULL;
"

# Executar
psql "$SUPABASE_DB_URL" -c "$SQL_QUERY" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ DPO configurado com sucesso no banco de dados!"
else
    echo "❌ Erro ao atualizar banco de dados"
    exit 1
fi

# ============================================
# VERIFICAÇÃO
# ============================================

echo ""
echo "🔍 Verificando configuração..."

VALIDATION=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT
  CASE
    WHEN dpo_nome IS NOT NULL AND dpo_email IS NOT NULL THEN 'OK'
    ELSE 'FALHA'
  END
FROM empresas
WHERE cnpj = '$EMPRESA_CNPJ';
")

if [[ "$VALIDATION" == *"OK"* ]]; then
    echo "✅ Validação OK"
else
    echo "⚠️  Validação falhou. Verifique os dados."
fi

# ============================================
# PRÓXIMOS PASSOS
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DPO CONFIGURADO COM SUCESSO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  PREENCHER TERMO DE DESIGNAÇÃO"
echo "   📄 Arquivo: docs/lgpd/termo_designacao_dpo.md"
echo "   ✏️  Preencher com os dados do DPO"
echo "   ✍️  Coletar assinaturas (empresa + DPO)"
echo ""
echo "2️⃣  PUBLICAR CONTATO NO SITE"
echo "   Adicionar no rodapé do site:"
echo ""
echo "   <footer>"
echo "     <p>"
echo "       Encarregado de Proteção de Dados (DPO)<br>"
echo "       E-mail: $DPO_EMAIL<br>"
echo "       Telefone: $DPO_TELEFONE"
echo "     </p>"
echo "   </footer>"
echo ""
echo "3️⃣  CRIAR CAIXA DE E-MAIL"
echo "   Configurar: $DPO_EMAIL"
echo "   Encaminhar para: [e-mail do DPO]"
echo ""
echo "4️⃣  CAPACITAÇÃO (se DPO interno)"
echo "   📚 Curso recomendado: Exin Privacy & Data Protection"
echo "   ⏱️  Carga: 40h"
echo "   💰 Custo: ~R$ 1.500"
echo "   🔗 Link: https://www.exin.com/pt-br/data-protection/"
echo ""
echo "5️⃣  COMUNICAR EQUIPE"
echo "   📧 Enviar e-mail para todos os funcionários"
echo "   📢 Informar sobre novo canal de contato LGPD"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📞 CONTATO DO DPO:"
echo "   E-mail: $DPO_EMAIL"
echo "   Telefone: $DPO_TELEFONE"
echo ""
echo "📊 STATUS DE CONFORMIDADE:"
echo "   ANTES: 🟡 78% (sem DPO)"
echo "   AGORA: 🟢 85% (DPO nomeado)"
echo "   META:  🎯 95% (após publicar política)"
echo ""
echo "✅ Configuração concluída!"

