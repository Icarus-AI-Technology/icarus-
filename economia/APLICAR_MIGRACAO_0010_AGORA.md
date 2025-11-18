# 🚀 APLICAR MIGRAÇÃO 0010 — FULL-TEXT SEARCH

**Status:** ✅ SQL copiado para clipboard!

---

## 📋 PASSO A PASSO (5 minutos):

### **1. Abrir SQL Editor do Supabase**
👉 **[CLIQUE AQUI PARA ABRIR](https://supabase.com/dashboard/project/ttswvavcisdnonytslom/sql/new)**

### **2. Colar o SQL** 
- O SQL já está no seu clipboard (Cmd+V)
- Cole no editor

### **3. Executar**
- Clique em **"RUN"** (canto inferior direito)
- Aguarde ~10-30 segundos

### **4. Verificar Sucesso**
Você verá no final:
```
NOTICE: Migração 0010 concluída! Índices FTS criados: X
NOTICE: Substituindo Meilisearch por PostgreSQL FTS (economia: US$ 600-1.2k/ano)
```

---

## ✅ O QUE SERÁ CRIADO:

### **Extensions:**
- `pg_trgm` - Busca aproximada (typos)
- `unaccent` - Remove acentos

### **Índices GIN:**
- `idx_conhecimento_fts` - Full-text em conhecimento_base
- `idx_conhecimento_trgm` - Busca aproximada
- `idx_legislacao_fts` - Full-text em legislação

### **5 Funções SQL:**
1. `buscar_conhecimento()` - Busca principal com ranking
2. `buscar_similar()` - Tolera typos
3. `buscar_legislacao()` - Busca em atualizações de leis
4. `sugerir_termos()` - Autocomplete
5. `refresh_busca_cache()` - Atualiza cache

### **Materialized View:**
- `mv_busca_rapida` - Cache de performance

---

## 🧪 TESTAR APÓS APLICAR:

```sql
-- 1. Buscar conhecimento (exemplo)
SELECT * FROM buscar_conhecimento('cirurgia ortopedia');

-- 2. Busca com typo (vai funcionar!)
SELECT * FROM buscar_similar('cirujia ortopedia');

-- 3. Autocomplete
SELECT * FROM sugerir_termos('cirug');

-- 4. Refresh cache
SELECT refresh_busca_cache();
```

---

## 🆘 SE DER ERRO:

### **Erro: "extension pg_trgm already exists"**
✅ **Ignorar** - É seguro, extension já está instalada

### **Erro: "relation already exists"**
✅ **Ignorar** - Tabela/índice já criado (migração é idempotente)

### **Erro: "syntax error"**
❌ **Copiar novamente** - Pode ter sido cortado no clipboard

---

## 📞 APÓS APLICAR:

Me avise aqui que eu vou:
1. ✅ Validar a migração
2. ✅ Atualizar código frontend para usar a busca
3. ✅ Popular base de conhecimento inicial
4. ✅ Criar componente de busca com autocomplete

---

**🎯 Pronto para aplicar? Cole o SQL no Supabase e clique RUN!**

Depois me diga "aplicado" ou "deu erro X" que continuo daqui! 🚀

