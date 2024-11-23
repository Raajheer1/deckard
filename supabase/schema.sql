DROP TABLE IF EXISTS papers;
DROP TABLE IF EXISTS preferences;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS favorites;

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
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  embedding vector(1024)
);
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  paper_id INT REFERENCES papers (id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE
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
  similarity float,
  is_favorited boolean
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
    similarity_scores.id,
    link,
    title,
    summary,
    max(similarity) as similarity,
    CASE WHEN f.id IS NOT NULL THEN true ELSE false END AS is_favorited
  from similarity_scores
    LEFT JOIN 
    favorites f 
    ON similarity_scores.id = f.paper_id AND f.user_id = match_documents_for_user.user_id
  group by similarity_scores.id, link, title, summary, f.id
  having max(similarity) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Function to search papers based on similarity
CREATE OR REPLACE FUNCTION search_papers (
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  user_id UUID
)
returns table (
  id bigint,
  title text,
  summary text,
  link text,
  similarity float,
  is_favorited boolean
)
language sql stable
as $$
  select
    papers.id,
    papers.title,
    papers.summary,
    papers.link,
    1 - (papers.embedding <=> query_embedding) as similarity,
    CASE WHEN f.id IS NOT NULL THEN true ELSE false END AS is_favorited
  from papers
  left join favorites f on papers.id = f.paper_id and f.user_id = search_papers.user_id
  where 1 - (papers.embedding <=> query_embedding) > match_threshold
  order by (papers.embedding <=> query_embedding) asc
  limit match_count;
$$;

-- Table to store user profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,

  PRIMARY KEY (id)
);

-- Function to insert a row into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();