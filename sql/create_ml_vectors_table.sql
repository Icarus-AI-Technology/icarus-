-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- Helper function to auto-update the updated_at column
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Table to store persisted embeddings for AI tutors / RAG
create table if not exists public.ml_vectors (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  module text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536) not null,
  dimension integer not null,
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create unique index if not exists ml_vectors_external_id_key on public.ml_vectors (external_id);
create index if not exists ml_vectors_module_idx on public.ml_vectors (module);

create trigger set_updated_at
  before update on public.ml_vectors
  for each row
  execute function public.set_current_timestamp_updated_at();
