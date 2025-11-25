-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector with schema public;

-- Create a table to store your documents
create table if not exists public.documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(1536)
);

-- Create a function to search for documents
create or replace function public.match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create index for faster queries (adjust 'lists' based on data size, 100 is good for <100k rows)
create index on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

