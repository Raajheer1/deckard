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
create or replace function match_documents (
  query_embeddings vector(1024)[],  -- Array of embeddings
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
  with similarity_scores as (
    select
      papers.id,
      papers.link,
      papers.title,
      papers.summary,
      max(1 - (papers.embedding <=> unnest(query_embeddings))) as max_similarity
    from papers
    cross join unnest(query_embeddings) as query_embedding
    group by papers.id, papers.link, papers.title, papers.summary
  )
  select
    id,
    link,
    title,
    summary,
    max_similarity as similarity
  from similarity_scores
  where max_similarity > match_threshold
  order by max_similarity desc
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
