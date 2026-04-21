-- Run this in Supabase SQL Editor

create extension if not exists vector;

create table document_chunks (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  is_demo     boolean default false,
  page_num    int,
  chunk_text  text,
  embedding   vector(1024),
  created_at  timestamptz default now()
);

create index on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Vector similarity search function
create or replace function match_document_chunks(
  query_embedding vector(1024),
  session_id_filter text,
  match_count int default 5
)
returns table (
  id uuid,
  chunk_text text,
  page_num int,
  session_id text,
  similarity float
)
language sql stable
as $$
  select
    id,
    chunk_text,
    page_num,
    session_id,
    1 - (embedding <=> query_embedding) as similarity
  from document_chunks
  where session_id = session_id_filter
  order by embedding <=> query_embedding
  limit match_count;
$$;
