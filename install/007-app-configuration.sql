-- AppVersion без конфигурации, не имеют сыыслв. 
-- Решение, удалить все  appVersion. 
-- Альтернатива для каждой существующей создавать пустышку конфигурацию, что сложнее.

DELETE FROM "app_version";

-------
ALTER TABLE "app_version"
    ADD COLUMN "configuration_id" uuid NOT NULL;

-------
CREATE TABLE "configuration" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "create_date" timestamp(6) NULL DEFAULT now(),
    "update_date" timestamp(6) NULL DEFAULT now(),
    "app_id" uuid NOT NULL,
    "name" varchar NOT NULL,
    CONSTRAINT "configuration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "configuration_service" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "create_date" timestamp(6) NULL DEFAULT now(),
    "update_date" timestamp(6) NULL DEFAULT now(),
    "configuration_id" uuid NOT NULL,
    "role" varchar NOT NULL,
    CONSTRAINT "configuration_service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "configuration_volume" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "create_date" timestamp(6) NULL DEFAULT now(),
    "update_date" timestamp(6) NULL DEFAULT now(),
    "service_id" uuid NOT NULL,
    "role" varchar NOT NULL,
    "inner_path" varchar NOT NULL,
    CONSTRAINT "configuration_volume_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "configuration_port" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "create_date" timestamp(6) NULL DEFAULT now(),
    "update_date" timestamp(6) NULL DEFAULT now(),
    "service_id" uuid NOT NULL,
    "role" varchar NOT NULL,
    "inner_port" int NOT NULL,
    "outer_port" int NULL,
    "is_domain_required" boolean NOT NULL DEFAULT FALSE,
    "is_login_and_password_required" boolean NOT NULL DEFAULT FALSE,
    CONSTRAINT "configuration_port_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "configuration_env_option" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "create_date" timestamp(6) NULL DEFAULT now(),
    "update_date" timestamp(6) NULL DEFAULT now(),
    "service_id" uuid NOT NULL,
    "name" varchar NOT NULL,
    "type" text CHECK ("type" IN ('int', 'boolean', 'string', 'list')) NOT NULL,
    "default_value" varchar NOT NULL,
    "is_required" boolean NOT NULL DEFAULT TRUE,
    CONSTRAINT "configuration_env_option_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "configuration_env_option_value" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "create_date" timestamp(6) NULL DEFAULT now(),
    "update_date" timestamp(6) NULL DEFAULT now(),
    "env_id" uuid NOT NULL,
    "value" varchar NOT NULL,
    "order" int NOT NULL,
    CONSTRAINT "configuration_env_option_value_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "configuration_db_with_user" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "create_date" timestamp(6) NULL DEFAULT now(),
    "update_date" timestamp(6) NULL DEFAULT now(),
    "service_id" uuid NOT NULL,
    "db_role" varchar NOT NULL,
    "db_user_role" varchar NOT NULL,
    CONSTRAINT "configuration_db_with_user_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "configuration"
    ADD CONSTRAINT "configuration_app_id_foreign" FOREIGN KEY ("app_id") REFERENCES "app" ("id") ON UPDATE CASCADE;

ALTER TABLE "configuration_service"
    ADD CONSTRAINT "configuration_service_configuration_id_foreign" FOREIGN KEY ("configuration_id") REFERENCES "configuration" ("id") ON UPDATE CASCADE;

ALTER TABLE "configuration_volume"
    ADD CONSTRAINT "configuration_volume_service_id_foreign" FOREIGN KEY ("service_id") REFERENCES "configuration_service" ("id") ON UPDATE CASCADE;

ALTER TABLE "configuration_port"
    ADD CONSTRAINT "configuration_port_service_id_foreign" FOREIGN KEY ("service_id") REFERENCES "configuration_service" ("id") ON UPDATE CASCADE;

ALTER TABLE "configuration_env_option"
    ADD CONSTRAINT "configuration_env_option_service_id_foreign" FOREIGN KEY ("service_id") REFERENCES "configuration_service" ("id") ON UPDATE CASCADE;

ALTER TABLE "configuration_env_option_value"
    ADD CONSTRAINT "configuration_env_option_value_env_id_foreign" FOREIGN KEY ("env_id") REFERENCES "configuration_env_option" ("id") ON UPDATE CASCADE;

ALTER TABLE "configuration_db_with_user"
    ADD CONSTRAINT "configuration_db_with_user_service_id_foreign" FOREIGN KEY ("service_id") REFERENCES "configuration_service" ("id") ON UPDATE CASCADE;

----
ALTER TABLE "image"
    ADD COLUMN "role" varchar NULL;

ALTER TABLE IF EXISTS public.app_version
    ADD FOREIGN KEY (configuration_id)
    REFERENCES public.configuration (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.container_volume
    ADD COLUMN role character varying;

ALTER TABLE IF EXISTS public.container
    ADD COLUMN role character varying;

ALTER TABLE IF EXISTS public.configuration_service
    ADD COLUMN repository_id uuid;

ALTER TABLE IF EXISTS public.configuration_service
    ADD COLUMN cpu_count integer;

ALTER TABLE IF EXISTS public.configuration_service
    ADD COLUMN ram_size integer;

ALTER TABLE IF EXISTS public.configuration_service
    ADD COLUMN disk_size integer;
ALTER TABLE IF EXISTS public.configuration_service
    ADD FOREIGN KEY (repository_id)
    REFERENCES public.repository (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;