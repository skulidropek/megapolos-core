CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL UNIQUE,
  create_date timestamp without time zone DEFAULT now(),
  update_date timestamp without time zone DEFAULT now()
);
