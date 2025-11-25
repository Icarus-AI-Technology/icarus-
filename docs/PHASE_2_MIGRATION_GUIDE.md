# Phase 2 Migration Guide
## Icarus Prime - Supabase Schema & Security Audit

**Date:** 2025-11-24  
**Author:** Icarus Prime Orchestrator  
**Phase:** 2 of 4 (Supabase Integration & Security Audit)

---

## Overview

This guide provides step-by-step instructions for applying the Phase 2 database migrations and running the initial security audit. Two migration files have been created to enhance the surgical Kanban system and implement comprehensive security auditing.

---

## Migration Files

### 1. Cirurgias Kanban Enhancements
**File:** `supabase/migrations/20251124_cirurgias_kanban_enhancements.sql`

**Purpose:** Enhance the existing `cirurgias` table to support advanced Kanban workflow with improved status tracking, priority management, and performance optimization.

**Key Changes:**
- Extended `status_cirurgia` enum (added `preparacao`, `recuperacao`)
- Added 12 new columns (procedimento, urgencia, prioridade, paciente_nome, etc.)
- Created 4 optimized indexes for Kanban queries
- Added `v_kanban_cirurgias` view for efficient board rendering
- Implemented `move_cirurgia_kanban()` RPC for status updates
- Implemented `get_cirurgias_kanban_stats()` for dashboard metrics

### 2. Auditor Pro Toolkit
**File:** `supabase/migrations/20251124_auditor_pro_toolkit.sql`

**Purpose:** Implement comprehensive security and performance auditing system.

**Key Components:**
- `audit_executions` table for audit history
- `check_missing_rls()` - Detect RLS issues
- `check_missing_indexes()` - Find performance bottlenecks
- `check_orphaned_tables()` - Identify unused resources
- `monitor_table_bloat` view - Track database health
- `audit_project_health()` - Master audit function
- `generate_audit_report()` - Human-readable reports

---

## Migration Application Methods

### Method 1: Supabase CLI (Recommended)

#### Prerequisites
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
cd /Users/daxmeneghel/icarus-make
supabase link --project-ref gjtavrcqzlolaueqauet
```

#### Apply Migrations
```bash
# Push all pending migrations
supabase db push

# Verify migrations
supabase migration list
```

#### Generate Updated Types
```bash
# Generate TypeScript types from your schema
supabase gen types typescript --project-id gjtavrcqzlolaueqauet > src/lib/database.types.generated.ts

# Verify types were generated
ls -lh src/lib/database.types.generated.ts
```

---

### Method 2: Supabase Dashboard (Manual)

#### Step 1: Open SQL Editor
1. Go to https://supabase.com/dashboard/project/gjtavrcqzlolaueqauet
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

#### Step 2: Apply Kanban Enhancement Migration
1. Open `supabase/migrations/20251124_cirurgias_kanban_enhancements.sql` in your code editor
2. Copy the entire SQL content
3. Paste into Supabase SQL Editor
4. Click **Run** or press `Cmd+Enter`
5. Verify success message (should show "Success. No rows returned")

#### Step 3: Apply Auditor Pro Migration
1. Open `supabase/migrations/20251124_auditor_pro_toolkit.sql` in your code editor
2. Copy the entire SQL content
3. Paste into Supabase SQL Editor
4. Click **Run** or press `Cmd+Enter`
5. Verify success message

#### Step 4: Generate TypeScript Types
1. Navigate to **Settings** → **API** in Supabase Dashboard
2. Scroll to **Generate Types** section
3. Select **TypeScript** from the dropdown
4. Click **Generate Types**
5. Copy the generated code
6. Paste into `src/lib/database.types.generated.ts`

---

## Post-Migration Verification

### 1. Verify Schema Changes

Run in Supabase SQL Editor:

```sql
-- Check new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'cirurgias'
  AND column_name IN (
    'procedimento', 'urgencia', 'prioridade', 
    'paciente_nome', 'hora_cirurgia', 'tipo_procedimento'
  );

-- Check new indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'cirurgias'
  AND indexname LIKE '%kanban%';

-- Check new functions exist
SELECT proname, prosrc
FROM pg_proc
WHERE proname IN ('move_cirurgia_kanban', 'get_cirurgias_kanban_stats', 'audit_project_health');
```

**Expected Results:**
- 6 new columns should be listed
- 4 new indexes should be found
- 3 new functions should be present

### 2. Verify Auditor Pro Installation

Run in Supabase SQL Editor:

```sql
-- Check audit functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%audit%' OR routine_name LIKE '%check_%';

-- Check audit_executions table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'audit_executions'
) AS audit_table_exists;

-- Check monitor_table_bloat view
SELECT EXISTS (
  SELECT FROM information_schema.views 
  WHERE table_schema = 'public' 
    AND table_name = 'monitor_table_bloat'
) AS bloat_view_exists;
```

**Expected Results:**
- 5+ audit/check functions found
- `audit_executions` table exists = true
- `monitor_table_bloat` view exists = true

---

## Initial Security Audit

### Run Comprehensive Audit

```sql
-- Execute master audit function
SELECT public.audit_project_health();
```

**Expected Output (JSON):**
```json
{
  "audit_id": "uuid-here",
  "status": "completed",
  "severity": "INFO|LOW|MEDIUM|HIGH|CRITICAL",
  "findings": {
    "rls_issues": [],
    "index_issues": [],
    "bloat_issues": [],
    "orphan_tables": [],
    "summary": {
      "total_rls_issues": 0,
      "total_index_issues": 2,
      "total_bloat_issues": 1,
      "total_orphan_tables": 3,
      "overall_severity": "MEDIUM"
    }
  },
  "recommendations": [
    "🚨 CRITICAL: X tables have RLS issues...",
    "⚠️  HIGH: Y foreign keys missing indexes...",
    "ℹ️  MEDIUM: Z tables have high bloat..."
  ],
  "executed_at": "2025-11-24T...",
  "duration_ms": 450
}
```

### Generate Human-Readable Report

```sql
-- Get formatted text report
SELECT public.generate_audit_report();
```

**Expected Output (Text):**
```
================================================================================
🛡️  SUPABASE AUDITOR PRO - PROJECT HEALTH REPORT
================================================================================
Audit ID: a1b2c3d4-...
Executed: 2025-11-24 15:30:45.123
Duration: 450 ms
Overall Severity: MEDIUM
================================================================================

📋 RECOMMENDATIONS:

  1. ⚠️  HIGH: 2 foreign keys missing indexes. Add indexes for performance.
  2. ℹ️  MEDIUM: 1 tables have high bloat. Run VACUUM ANALYZE.
  3. 📊 INFO: 3 tables appear unused. Review for cleanup.
================================================================================

🔍 DETAILED FINDINGS:

RLS Issues: 0
Index Issues: 2
Bloat Issues: 1
Orphan Tables: 3
================================================================================

✅ Audit completed successfully.
================================================================================
```

### View Audit History

```sql
-- View last 10 audits
SELECT 
  id,
  severity,
  executed_at,
  duration_ms,
  (findings->'summary'->>'total_rls_issues')::INT as rls_issues,
  (findings->'summary'->>'total_index_issues')::INT as index_issues
FROM public.audit_executions
ORDER BY executed_at DESC
LIMIT 10;
```

---

## Test Kanban Functions

### 1. Query Kanban Board View

```sql
-- Get active surgeries for Kanban board
SELECT 
  id,
  numero_cirurgia,
  paciente_nome,
  procedimento,
  status_cirurgia,
  urgencia,
  prioridade,
  data_agendada,
  medico_nome,
  hospital_nome
FROM public.v_kanban_cirurgias
WHERE empresa_id = '<your-empresa-id>'
LIMIT 20;
```

### 2. Test Card Movement Function

```sql
-- Move a surgery to 'preparacao' status
SELECT public.move_cirurgia_kanban(
  '<surgery-id>'::UUID,
  'preparacao'::status_cirurgia,
  'Material OPME separado e conferido'
);
```

**Expected Output:**
```json
{
  "success": true,
  "cirurgia_id": "uuid-here",
  "old_status": "confirmada",
  "new_status": "preparacao",
  "changed_at": "2025-11-24T..."
}
```

### 3. Get Kanban Statistics

```sql
-- Get statistics for current month
SELECT public.get_cirurgias_kanban_stats(
  '<your-empresa-id>'::UUID,
  '2025-11-01'::DATE,
  '2025-11-30'::DATE
);
```

**Expected Output:**
```json
{
  "total": 45,
  "por_status": {
    "agendada": 12,
    "confirmada": 8,
    "preparacao": 5,
    "andamento": 3,
    "recuperacao": 4,
    "concluida": 10,
    "cancelada": 3
  },
  "por_urgencia": {
    "eletiva": 35,
    "urgente": 8,
    "emergencia": 2
  },
  "por_prioridade": {
    "baixa": 10,
    "media": 25,
    "alta": 8,
    "urgente": 2
  }
}
```

---

## Troubleshooting

### Issue: "relation does not exist"

**Cause:** Migration not applied or wrong schema

**Solution:**
```sql
-- Check if table exists
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'cirurgias';

-- If missing, re-run migration
```

### Issue: "permission denied for function"

**Cause:** Missing GRANT statements or auth context

**Solution:**
```sql
-- Verify grants
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'audit_project_health';

-- Re-apply Auditor Pro migration if needed
```

### Issue: "enum value does not exist"

**Cause:** Enum values not added properly

**Solution:**
```sql
-- Check enum values
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'status_cirurgia'
ORDER BY enumsortorder;

-- Should include: agendada, confirmada, preparacao, em_andamento, 
-- andamento, recuperacao, concluida, cancelada
```

---

## Next Steps

Once migrations are applied and verified:

1. ✅ **Update Frontend Types:**
   - Ensure `src/lib/database.types.generated.ts` is current
   - Check that `Cirurgia` interface in `src/hooks/useCirurgias.ts` matches new schema

2. ✅ **Proceed to Phase 3:**
   - Refactor `src/operacional/KanbanCirurgias.tsx` to use HeroUI
   - Create `src/pages/Cirurgias/SurgeryKanban.tsx`
   - Implement drag-and-drop with `@dnd-kit`
   - Connect to Supabase realtime

3. ✅ **Schedule Regular Audits:**
   - Set up cron job to run `audit_project_health()` daily
   - Monitor `audit_executions` table for severity escalations
   - Review `monitor_table_bloat` weekly

---

## Support

**Documentation:**
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/managing-migrations)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)

**Project Contacts:**
- **Architect:** Icarus Prime Orchestrator
- **Status:** Phase 2 Complete ✅
- **Next Phase:** Frontend Refactoring (Phase 3)

---

**Generated:** 2025-11-24  
**Migration Files:** 2  
**Audit Functions:** 5  
**New Indexes:** 4  
**Status:** READY FOR APPLICATION

