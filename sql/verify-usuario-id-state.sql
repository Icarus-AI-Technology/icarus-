-- Verificar colunas e FKs criadas para usuario_id

-- 1) Tabelas com coluna usuario_id
select table_schema, table_name
from information_schema.columns
where column_name='usuario_id' and table_schema='public'
order by table_name;

-- 2) FKs com sufixo _usuario
select conname, conrelid::regclass as table
from pg_constraint
where contype='f' and conname like 'fk_%_usuario'
order by 2;


