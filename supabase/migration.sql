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
