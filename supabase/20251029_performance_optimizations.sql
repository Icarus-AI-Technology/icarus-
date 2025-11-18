-- =============================================================
-- Migration: Performance Optimizations (MVs + Índices FKs)
-- Data: 2025-10-29
-- =============================================================

-- Estatísticas de execução
create extension if not exists pg_stat_statements;

-- ============================================
-- Materialized views para consultas pesadas
-- ============================================
do $$
declare
  v_view text;
  v_mv text;
begin
  foreach v_view in array array[
    'public.vw_estatisticas_emails_30d',
    'public.vw_proximas_reunioes_teams_public',
    'public.view_empresas_sem_dpo',
    'public.workflow_execucoes'
  ] loop
    v_mv := v_view || '_mv';

    if exists (select 1 from pg_views where schemaname = split_part(v_view,'.',1) and viewname = split_part(v_view,'.',2))
       and not exists (select 1 from pg_matviews where schemaname = split_part(v_view,'.',1) and matviewname = split_part(v_view,'.',2) || '_mv') then
      execute format('create materialized view %I.%I as select * from %s;',
                     split_part(v_view,'.',1), split_part(v_view,'.',2) || '_mv', v_view);

      -- Índices usuais (se colunas existirem)
      perform 1 from information_schema.columns where table_schema = split_part(v_mv,'.',1) and table_name = split_part(v_mv,'.',2) and column_name = 'id';
      if found then execute format('create index if not exists %I on %s(id);', replace(v_mv,'.','_')||'_id', v_mv); end if;

      perform 1 from information_schema.columns where table_schema = split_part(v_mv,'.',1) and table_name = split_part(v_mv,'.',2) and column_name = 'data_envio';
      if found then execute format('create index if not exists %I on %s(data_envio);', replace(v_mv,'.','_')||'_data_envio', v_mv); end if;

      perform 1 from information_schema.columns where table_schema = split_part(v_mv,'.',1) and table_name = split_part(v_mv,'.',2) and column_name = 'created_at';
      if found then execute format('create index if not exists %I on %s(created_at);', replace(v_mv,'.','_')||'_created_at', v_mv); end if;
    end if;
  end loop;
end $$;

-- ============================================
-- Índices automáticos em todas as FKs ausentes
-- ============================================
do $$
declare
  r record;
  idx_name text;
begin
  for r in (
    select
      n.nspname as schema_name,
      c.relname as table_name,
      con.conname as constraint_name,
      pg_get_constraintdef(con.oid) as condef,
      array_agg(att.attname order by u.attposition) as colnames
    from pg_constraint con
      join pg_class c on c.oid = con.conrelid
      join pg_namespace n on n.oid = c.relnamespace
      join unnest(con.conkey) with ordinality as u(attnum, attposition) on true
      join pg_attribute att on att.attrelid = c.oid and att.attnum = u.attnum
    where con.contype = 'f'
    group by n.nspname, c.relname, con.conname, con.oid
  ) loop
    idx_name := format('idx_%s_%s_fk', replace(r.schema_name,'','.'){0}, replace(r.table_name,'','.'));
    -- Nome de índice mais robusto e único por tabela/colunas
    idx_name := replace(format('idx_%s_%s_%s_fk', r.schema_name, r.table_name, array_to_string(r.colnames, '_')),'\.','_');

    if not exists (
      select 1 from pg_class i
      join pg_namespace ni on ni.oid = i.relnamespace
      where i.relkind = 'i'
        and ni.nspname = r.schema_name
        and i.relname = idx_name
    ) then
      execute format('create index if not exists %I on %I.%I (%s);',
                     idx_name, r.schema_name, r.table_name,
                     (select string_agg(format('%I', c), ',') from unnest(r.colnames) as c));
    end if;
  end loop;
end $$;

-- ============================================
-- Índices práticos adicionais
-- ============================================
do $$
begin
  if to_regclass('public.usuarios') is not null then
    create index if not exists idx_usuarios_email_lower on public.usuarios (lower(email));
  end if;
end $$;


