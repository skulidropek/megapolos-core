ALTER TABLE IF EXISTS public.image
    ADD COLUMN role_in_app text NOT NULL DEFAULT '';