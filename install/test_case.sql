-- Table: public.test_case

-- DROP TABLE IF EXISTS public.test_case;

CREATE TABLE IF NOT EXISTS public.test_case
(
    name character varying COLLATE pg_catalog."default",
    title character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    CONSTRAINT test_case_pkey PRIMARY KEY (id)
)
