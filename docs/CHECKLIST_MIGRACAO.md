# ✅ Checklist de Migração - icarus-make → icarus-v5.0

## 📋 Pré-Migração

### Preparação do Ambiente
- [ ] Cursor IDE aberto na raiz do projeto
- [ ] Git status limpo ou alterações commitadas/stashed
- [ ] Node.js 20+ instalado
- [ ] npm/pnpm configurado corretamente
- [ ] Supabase CLI instalado e configurado
- [ ] Conexão com internet estável
- [ ] Espaço em disco suficiente (~3-5GB recomendados)

### Verificações de Segurança
- [ ] Backup manual adicional realizado (opcional mas recomendado)
- [ ] Branches Git principais estão atualizadas
- [ ] Nenhum processo crítico rodando nos diretórios
- [ ] Permissões de leitura/escrita nos diretórios verificadas

### Checklist de Conhecimento
- [ ] Li o documento `PLAYBOOK_MIGRACAO_MAKE_PARA_V5.md`
- [ ] Consultei o `QUICK_REFERENCE_MIGRACAO.md`
- [ ] Entendo o fluxo de 8 etapas
- [ ] Sei onde ficam os backups gerados
- [ ] Conheço o procedimento de rollback

---

## 🚀 Durante a Migração

### Executar o Playbook
- [ ] Abrir terminal no Cursor
- [ ] Executar: `@Orquestrador-ICARUS run migrar-make-para-v5`
- [ ] Aguardar conclusão (15-25 minutos)

### Monitoramento das Etapas

#### Etapa 1: scan-diff (~1 min)
- [ ] Comando executado sem erros
- [ ] Diff gerado em `backups/migration/icarus-make.diff`
- [ ] Arquivo diff tem tamanho razoável

#### Etapa 2: backup-prod-root (~2-5 min)
- [ ] Backup iniciado
- [ ] Arquivo tar.gz criado
- [ ] Tamanho do backup verificado (geralmente 500MB-2GB)
- [ ] Mensagem de confirmação exibida

#### Etapa 3: sync-make-para-v5 (~2-3 min)
- [ ] rsync iniciado
- [ ] Progresso de sincronização visível
- [ ] .git e node_modules excluídos
- [ ] Mensagem de conclusão exibida

#### Etapa 4: git-status-resumo (~5 seg)
- [ ] git status executado
- [ ] Lista de arquivos modificados exibida
- [ ] Nenhum erro crítico reportado

#### Etapa 5: rodar-testes (~5-10 min)
- [ ] npm install concluído
- [ ] npm run lint passou
- [ ] npm test executado (pode ter warnings)
- [ ] npm run build concluído

#### Etapa 6: verificar-supabase (~30 seg)
- [ ] supabase status executado
- [ ] supabase functions list executado
- [ ] Backend respondendo corretamente

#### Etapa 7: relatorio-final (~5 seg)
- [ ] Relatório gerado
- [ ] Arquivo `relatorio-migracao.md` criado
- [ ] Conteúdo do relatório coerente

#### Etapa 8: remover-make-opcional (~5 seg)
- [ ] Instruções exibidas
- [ ] NENHUMA remoção automática executada
- [ ] Comando de remoção manual anotado

---

## 🔍 Pós-Migração

### Verificações Imediatas
- [ ] Relatório lido: `backups/migration/relatorio-migracao.md`
- [ ] Diff analisado: `backups/migration/icarus-make.diff`
- [ ] Git status revisado no icarus-v5.0
- [ ] Nenhum arquivo crítico perdido

### Testes Funcionais

#### Backend/Supabase
- [ ] Supabase local rodando (se aplicável)
- [ ] Edge Functions acessíveis
- [ ] Migrations aplicadas corretamente
- [ ] Banco de dados acessível

#### Frontend
- [ ] `pnpm dev` ou `npm run dev` iniciando sem erros
- [ ] Porta correta (geralmente 3000 ou 5173)
- [ ] Interface carregando
- [ ] Nenhum erro de console crítico

#### APIs e Integrações
- [ ] APIs principais respondendo
- [ ] Variáveis de ambiente carregadas
- [ ] Conexões com serviços externos OK

#### Testes Específicos (Críticos)
- [ ] Login funcionando
- [ ] Navegação entre páginas
- [ ] Formulários principais
- [ ] Modais e componentes interativos

### Testes E2E (Se Configurados)
- [ ] `npm run test:e2e` executado
- [ ] Todos os testes críticos passando
- [ ] Nenhuma regressão detectada

### Validação de Dados
- [ ] Estrutura de diretórios correta
- [ ] Arquivos de configuração presentes
- [ ] .env/.env.local com variáveis corretas
- [ ] package.json consistente

---

## 📝 Revisão e Commit

### Análise de Alterações
- [ ] `git status` revisado linha por linha
- [ ] `git diff` analisado para mudanças inesperadas
- [ ] Nenhum arquivo sensível adicionado (.env, secrets, etc)
- [ ] Nenhum arquivo binário grande adicionado

### Preparar Commit
- [ ] Arquivos relevantes staged
- [ ] Mensagem de commit preparada
- [ ] Descrição detalhada das mudanças

### Commit Sugerido
```bash
cd /users/daxmeneghel/icarus-v5.0
git add .
git status  # Revisar novamente
git commit -m "feat: migração completa do icarus-make para icarus-v5.0

- Sincronização de todos os desenvolvimentos recentes
- Atualização de componentes e módulos
- Testes validados após migração
- Backend Supabase verificado e funcional

Refs: backups/migration/relatorio-migracao.md"
```

- [ ] Commit realizado
- [ ] Mensagem de commit clara e descritiva

---

## 🚢 Deploy e Produção

### Preparação para Deploy (Opcional)
- [ ] Branch de deploy criada/atualizada
- [ ] Merge para main/master (se política permitir)
- [ ] CI/CD verificado
- [ ] Variáveis de ambiente em produção atualizadas

### Deploy para Staging
- [ ] Deploy em staging executado
- [ ] Smoke tests em staging
- [ ] Validação funcional em staging
- [ ] Performance aceitável

### Deploy para Produção (Se Aplicável)
- [ ] Checklist de produção revisado
- [ ] Backup de produção realizado
- [ ] Deploy executado
- [ ] Monitoramento ativo
- [ ] Rollback plan preparado

---

## 🗑️ Limpeza (OPCIONAL - Executar com CUIDADO)

### Validação Final Antes de Remover icarus-make
- [ ] Todos os testes passando em icarus-v5.0
- [ ] Funcionalidades críticas validadas
- [ ] Pelo menos 24h de operação estável
- [ ] Backup adicional realizado
- [ ] Time/stakeholders notificados

### Remoção do icarus-make
⚠️ **ATENÇÃO: Esta ação é IRREVERSÍVEL!**

- [ ] Certeza ABSOLUTA de que não precisa mais do icarus-make
- [ ] Todos os dados importantes migrados
- [ ] Último backup do icarus-make realizado
- [ ] Comando de remoção anotado:

```bash
# EXECUTAR COM EXTREMO CUIDADO!
rm -rf /users/daxmeneghel/icarus-make
```

- [ ] Remoção executada
- [ ] Diretório verificado (não existe mais)
- [ ] icarus-v5.0 funcionando perfeitamente

---

## 📊 Métricas de Sucesso

### Indicadores Técnicos
- [ ] 0 erros de build
- [ ] 0 erros de lint críticos
- [ ] >90% dos testes passando
- [ ] Tempo de build <5 minutos
- [ ] Tamanho do bundle aceitável

### Indicadores de Qualidade
- [ ] Código limpo e organizado
- [ ] Documentação atualizada
- [ ] Nenhuma regressão funcional
- [ ] Performance mantida ou melhorada
- [ ] UX/UI preservada

### Indicadores de Processo
- [ ] Migração concluída no tempo estimado
- [ ] Nenhum rollback necessário
- [ ] Documentação de migração completa
- [ ] Equipe notificada das mudanças

---

## 🆘 Troubleshooting

### Problema: Migração falhou em uma etapa
- [ ] Identificar etapa que falhou
- [ ] Revisar logs de erro
- [ ] Executar etapa individual para debug
- [ ] Consultar `PLAYBOOK_MIGRACAO_MAKE_PARA_V5.md`
- [ ] Considerar rollback se necessário

### Problema: Testes falhando após migração
- [ ] Identificar quais testes falharam
- [ ] Revisar mudanças no git diff
- [ ] Verificar variáveis de ambiente
- [ ] Executar testes individualmente
- [ ] Consultar logs detalhados

### Problema: Supabase não responde
- [ ] Verificar se Supabase está rodando
- [ ] Executar `supabase start` se local
- [ ] Verificar credenciais e URLs
- [ ] Verificar migrations aplicadas
- [ ] Consultar logs do Supabase

### Rollback Necessário
- [ ] Parar serviços em icarus-v5.0
- [ ] Navegar para /users/daxmeneghel
- [ ] Executar: `tar -xzf icarus-v5.0/backups/migration/icarus-v5.0-pre-migration.tar.gz`
- [ ] Verificar restauração
- [ ] Reiniciar serviços
- [ ] Documentar motivo do rollback

---

## 📚 Documentos de Referência

Durante a migração, consulte:

- [ ] `PLAYBOOK_MIGRACAO_MAKE_PARA_V5.md` - Guia completo
- [ ] `QUICK_REFERENCE_MIGRACAO.md` - Referência rápida
- [ ] `ARQUITETURA_SISTEMA_MIGRACAO.md` - Diagramas visuais
- [ ] `RESUMO_IMPLEMENTACAO_MIGRACAO.md` - Resumo técnico
- [ ] `backups/migration/relatorio-migracao.md` - Relatório gerado

---

## ✅ Conclusão

### Critérios de Sucesso Total
- [ ] Todas as etapas executadas sem erros críticos
- [ ] Todos os testes passando
- [ ] Funcionalidades críticas validadas
- [ ] Backend Supabase operacional
- [ ] Frontend carregando corretamente
- [ ] Commit realizado com sucesso
- [ ] Documentação atualizada
- [ ] Time notificado

### Status Final
- [ ] ✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO
- [ ] ⚠️ MIGRAÇÃO PARCIAL (ações pendentes)
- [ ] ❌ MIGRAÇÃO FALHOU (rollback executado)

### Próximos Passos
1. [ ] Monitorar por 24-48h
2. [ ] Coletar feedback da equipe
3. [ ] Ajustes finos se necessário
4. [ ] Considerar remoção do icarus-make (após validação)
5. [ ] Atualizar documentação do projeto

---

**Data da Migração**: ____/____/________  
**Executado por**: _______________________  
**Tempo Total**: _________ minutos  
**Status**: [ ] Sucesso  [ ] Parcial  [ ] Falha  
**Observações**:

_______________________________________________
_______________________________________________
_______________________________________________

---

**Versão do Checklist**: 1.0  
**Última Atualização**: 18/11/2025

