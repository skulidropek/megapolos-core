ALTER TABLE IF EXISTS public.log
    ADD COLUMN container_id uuid;

ALTER TABLE IF EXISTS public.log
    ADD COLUMN container_name character varying;

ALTER TABLE IF EXISTS public.log
    ADD COLUMN node_id uuid;

ALTER TABLE IF EXISTS public.log
    ADD COLUMN node_name character varying;

ALTER TABLE IF EXISTS public.log
    ADD COLUMN object_id uuid;

ALTER TABLE IF EXISTS public.log
    ADD COLUMN object_name character varying;

ALTER TABLE IF EXISTS public.log
    ADD COLUMN type character varying;

CREATE TABLE image_variable_requirement
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    image_id uuid NOT NULL DEFAULT gen_random_uuid(),
    title character varying COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    default_value character varying COLLATE pg_catalog."default" NOT NULL,
    type character varying COLLATE pg_catalog."default",
    CONSTRAINT image_variable_requirement_pkey PRIMARY KEY (id),
    CONSTRAINT image_variable_requirement_image_id_fkey FOREIGN KEY (image_id)
        REFERENCES public.image (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.container_variable
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    container_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    value character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT container_variable_pkey PRIMARY KEY (id),
    CONSTRAINT container_variable_container_id_fkey FOREIGN KEY (container_id)
        REFERENCES public.container (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);