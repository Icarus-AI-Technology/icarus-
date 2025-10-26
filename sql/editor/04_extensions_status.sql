-- Extensões disponíveis e instaladas (somente leitura, não aplica mudanças)

SELECT name, default_version, installed_version
FROM pg_available_extensions
ORDER BY name;

-- Estado atual (instaladas)
SELECT extname AS name, extversion
FROM pg_extension
ORDER BY extname;

-- Recomendação (não executar sem validação):
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;


