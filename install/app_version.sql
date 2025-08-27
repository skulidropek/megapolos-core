-- Table: public.app_version

-- DROP TABLE IF EXISTS public.app_version;

CREATE TABLE IF NOT EXISTS public.app_version
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    version character varying COLLATE pg_catalog."default",
    version_comment character varying COLLATE pg_catalog."default",
    app_id character varying COLLATE pg_catalog."default" NOT NULL,
    build_number integer NOT NULL,
    CONSTRAINT app_version_pkey PRIMARY KEY (id)
)