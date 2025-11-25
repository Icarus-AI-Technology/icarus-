# Status dos Formulários - ICARUS v5.0

**Data:** $(date)  
**Status:** Em padronização

## Formulários Encontrados

### Cadastros (8 formulários)
1. ✅ `FormularioMedicos.tsx` - Usa FORM_GRID e FormTemplate
2. ✅ `FormularioHospitais.tsx` - Precisa verificar grid
3. ✅ `FormularioPacientes.tsx` - Precisa verificar grid
4. ✅ `FormularioFornecedores.tsx` - Precisa verificar grid
5. ✅ `FormularioProdutos.tsx` - Precisa verificar grid
6. ✅ `FormularioConvenios.tsx` - Precisa verificar grid
7. ✅ `FormularioEquipesMedicas.tsx` - Precisa verificar grid
8. ✅ `FormularioTransportadoras.tsx` - Precisa verificar grid

### Operacionais (6 formulários)
9. ✅ `FormularioCirurgias.tsx` - Precisa verificar grid
10. ✅ `FormularioPedidosCompra.tsx` - Precisa verificar grid
11. ✅ `FormularioRemessasConsignacao.tsx` - Precisa verificar grid
12. ✅ `FormularioEstoque.tsx` - Precisa verificar grid
13. ✅ `FormularioEntregas.tsx` - Precisa verificar grid
14. ✅ `FormularioCotacoes.tsx` - Precisa verificar grid

### Financeiros (3 formulários)
15. ✅ `FormularioContasReceber.tsx` - Precisa verificar grid
16. ✅ `FormularioContasPagar.tsx` - Precisa verificar grid
17. ✅ `FormularioNotasFiscais.tsx` - Precisa verificar grid

## Rotas dos Formulários

### Formulários com Rotas
- ✅ `/cadastros/medicos` → `CadastroMedicos.tsx` (usa FormularioMedicos)
- ✅ `/cadastros/hospitais` → `CadastroHospitais.tsx`
- ✅ `/cadastros/pacientes` → `CadastroPacientes.tsx`
- ✅ `/cadastros/fornecedores` → `CadastroFornecedores.tsx`

### Formulários Órfãos (sem rota direta)
- `FormularioMedicos.tsx` - usado em CadastroMedicos
- `FormularioHospitais.tsx` - usado em CadastroHospitais
- Outros seguem mesmo padrão

## Padrões a Aplicar

1. **Grid:** Todos devem usar `FORM_GRID` com `FORM_COL` para colunas
2. **Template:** Todos devem usar `FormTemplate`
3. **Cores:** Todos devem usar tokens `var(--orx-text-primary)`
4. **Espaçamentos:** Todos devem usar `var(--orx-spacing-*)`

## Próximos Passos

1. Verificar uso de FORM_GRID em todos os formulários
2. Padronizar espaçamentos
3. Aplicar tokens de cor consistentes

