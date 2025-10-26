-- Helper para adicionar usuario_id + FK para auth.users(id)
-- Sanitiza dados órfãos antes de criar a FK e valida no final
create or replace function public._ensure_usuario_id(p_schema text, p_table text)
returns void language plpgsql as $$
begin
  -- 1) Garante a coluna
  execute format(
    'alter table if exists %I.%I add column if not exists usuario_id uuid null;',
    p_schema, p_table
  );

  -- 1.0) Força coluna a ser NULLABLE (evita violação em tabelas com NOT NULL pré-existente)
  begin
    execute format(
      'alter table %I.%I alter column usuario_id drop not null;',
      p_schema, p_table
    );
  exception when others then
    -- ignora se já é nullable
    null;
  end;

  -- 1.1) Se a coluna existir como NOT NULL, tornar NULLABLE antes da higienização
  if exists (
    select 1
      from information_schema.columns c
     where c.table_schema = p_schema
       and c.table_name   = p_table
       and c.column_name  = 'usuario_id'
       and c.is_nullable  = 'NO'
  ) then
    execute format(
      'alter table %I.%I alter column usuario_id drop not null;',
      p_schema, p_table
    );
  end if;

  -- 2) Sanitiza valores órfãos (usuario_id sem correspondente em auth.users)
  --    Evita falha ao adicionar a constraint
  execute format(
    'update %I.%I as t
       set usuario_id = null
     where usuario_id is not null
       and not exists (
         select 1 from auth.users u where u.id = t.usuario_id
       );',
    p_schema, p_table
  );

  -- 3) Cria FK se ainda não existir (como NOT VALID para segurança)
  if not exists (
    select 1 from pg_constraint
    where conrelid = format('%I.%I', p_schema, p_table)::regclass
      and contype = 'f'
      and conname = 'fk_' || p_table || '_usuario'
  ) then
    execute format(
      'alter table %I.%I add constraint %I foreign key (usuario_id) references auth.users(id) on delete set null not valid;',
      p_schema, p_table, 'fk_' || p_table || '_usuario'
    );
    -- 4) Valida constraint (não deve falhar após sanitização)
    execute format(
      'alter table %I.%I validate constraint %I;',
      p_schema, p_table, 'fk_' || p_table || '_usuario'
    );
  end if;
end;
$$;

-- Aplique conforme suas tabelas do domínio (exemplos ICARUS; ajuste conforme necessário)
-- select public._ensure_usuario_id('public','cirurgias');
-- select public._ensure_usuario_id('public','produtos');
-- select public._ensure_usuario_id('public','kits');
-- select public._ensure_usuario_id('public','itens_kit');
-- select public._ensure_usuario_id('public','clientes');
-- select public._ensure_usuario_id('public','pedidos');
-- select public._ensure_usuario_id('public','estoques');
-- select public._ensure_usuario_id('public','fornecedores');
-- select public._ensure_usuario_id('public','ocorrencias');
-- select public._ensure_usuario_id('public','faturamentos');


