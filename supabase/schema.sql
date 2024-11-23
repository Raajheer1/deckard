CREATE TABLE papers (
    id SERIAL PRIMARY KEY,
    link VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    embedding vector(1024)
);
CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  preference VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE
  embedding vector(1024)
);

-- Function to match documents based on similarity
CREATE OR REPLACE FUNCTION match_documents_for_user (
  user_id UUID,  -- User ID to get the query embeddings
  match_threshold float,
  match_count int
)
returns table (
  id int,
  link text,
  title text,
  summary text,
  similarity float
)
language sql stable
as $$
  with user_embeddings as (
    select embedding
    from preferences
    where user_id = match_documents_for_user.user_id
  ),
  similarity_scores as (
    select
      papers.id,
      papers.link,
      papers.title,
      papers.summary,
      1 - (papers.embedding <=> user_embeddings.embedding) as similarity
    from papers
    cross join lateral (select embedding from user_embeddings) as user_embeddings
  )
  select
    id,
    link,
    title,
    summary,
    max(similarity) as similarity
  from similarity_scores
  group by id, link, title, summary
  having max(similarity) > match_threshold
  order by similarity desc
  limit match_count;
$$;

CREATE OR REPLACE FUNCTION search_papers (
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  title text,
  summary text,
  link text,
  similarity float
)
language sql stable
as $$
  select
    papers.id,
    papers.title,
    papers.summary,
    papers.link,
    1 - (papers.embedding <=> query_embedding) as similarity
  from papers
  where 1 - (papers.embedding <=> query_embedding) > match_threshold
  order by (papers.embedding <=> query_embedding) asc
  limit match_count;
$$;

CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,

  PRIMARY KEY (id)
);

-- Inserts a row into public.profiles
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
