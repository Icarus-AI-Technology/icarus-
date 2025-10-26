-- Criação de usuário ADMIN via SQL Editor usando a extensão HTTP
-- Usa Admin API com SERVICE_ROLE (não usa JWT secret).

create extension if not exists http with schema extensions;

DO $$
DECLARE
  v_url text := 'https://ttswvavcisdnonytslom.supabase.co/auth/v1/admin/users';
  v_service_role text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgzMTUzOSwiZXhwIjoyMDc2NDA3NTM5fQ.5-hOqi1jCpHfqRhlixWxKUc0nkyvchkbwEGmdKuGWzc';
  v_email text := 'dax@newortho.com.br';
  v_password text := '%Ortho#New&25’';
  v_name text := 'Dax Meneghel';
  v_status int;
  v_body text;
BEGIN
  SELECT (resp).status, (resp).content
    INTO v_status, v_body
  FROM (
    SELECT extensions.http_post(
      v_url,
      jsonb_build_object(
        'email', v_email,
        'password', v_password,
        'email_confirm', true,
        'user_metadata', jsonb_build_object('nome', v_name, 'role', 'admin')
      )::text,
      'application/json',
      ARRAY[
        extensions.http_header('authorization', 'Bearer ' || v_service_role),
        extensions.http_header('apikey', v_service_role)
      ]
    ) AS resp
  ) s;

  RAISE NOTICE 'create-admin status=%, body=%', v_status, v_body;
END $$;


