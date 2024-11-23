CREATE TABLE papers (
    url VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    abstract VARCHAR(500) NOT NULL
    embedding vector(1024)
);
CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  preference VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE
  embedding vector(1024)
);

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
