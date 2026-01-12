CREATE TABLE IF NOT EXISTS public.app_export (
  id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  create_date timestamp without time zone DEFAULT now(),
  update_date timestamp without time zone DEFAULT now()
);
