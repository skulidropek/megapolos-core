CREATE TABLE IF NOT EXISTS public.volume_backup
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    artifact_id uuid,
    CONSTRAINT volume_backup_pkey PRIMARY KEY (id),
    CONSTRAINT volume_backup_artifact_id_fkey FOREIGN KEY (artifact_id)
        REFERENCES public.artifact (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

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

ALTER TABLE IF EXISTS public.image_env_requirement
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
    container_id uuid NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    type character varying COLLATE pg_catalog."default" NOT NULL,
    value character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT container_variable_pkey PRIMARY KEY (id),
    CONSTRAINT container_variable_container_id_fkey FOREIGN KEY (container_id)
        REFERENCES public.container (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER TABLE domain
    ADD COLUMN create_date timestamp without time zone DEFAULT now(),
    ADD COLUMN update_date timestamp without time zone
;

ALTER TABLE IF EXISTS public.repository
    ADD COLUMN app_id uuid;

ALTER TABLE IF EXISTS public.repository
    ADD COLUMN microservice_name character varying;

ALTER TABLE IF EXISTS public.repository
    ADD COLUMN title character varying;
ALTER TABLE IF EXISTS public.repository
    ADD FOREIGN KEY (app_id)
    REFERENCES public.app (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE image_volume_requirement
    ADD COLUMN create_date timestamp without time zone DEFAULT now(),
    ADD COLUMN update_date timestamp without time zone
;

CREATE TABLE public.container_db
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    db_id uuid NOT NULL,
    db_user_id uuid NOT NULL,
    container_id uuid NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    name character varying NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (db_id)
        REFERENCES public.db (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY (db_user_id)
        REFERENCES public.db_user (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY (container_id)
        REFERENCES public.container (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE public.image_db_requirement
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    create_date timestamp with time zone DEFAULT now(),
    update_date timestamp without time zone,
    dbms_type character varying,
    db_backup_id uuid,
    name character varying,
    PRIMARY KEY (id),
    FOREIGN KEY (db_backup_id)
        REFERENCES public.db_backup (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
