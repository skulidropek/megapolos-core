ALTER TABLE IF EXISTS public.image
    ADD COLUMN role_in_app text NOT NULL DEFAULT '';

ALTER TABLE IF EXISTS public.app_instance
    ADD COLUMN description text NOT NULL DEFAULT '';

ALTER TABLE IF EXISTS public.repository
    ADD COLUMN repository_type VARCHAR(20) NOT NULL DEFAULT '';

ALTER TABLE IF EXISTS public.container
    ADD COLUMN uptime timestamp without time zone;