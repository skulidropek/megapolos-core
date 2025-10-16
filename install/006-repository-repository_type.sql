ALTER TABLE IF EXISTS public.repository
    ADD COLUMN repository_type VARCHAR(20) NOT NULL DEFAULT '';