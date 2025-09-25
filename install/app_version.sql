-- сгенерировано ORM по Entity

CREATE TABLE "app_version" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "create_date" timestamp(6) NULL DEFAULT now(),
    "update_date" timestamp(6) NULL DEFAULT now(),
    "app_id" uuid NOT NULL,
    "build_number" int NOT NULL,
    "version" varchar NULL,
    "version_comment" varchar NULL,
    CONSTRAINT "app_version_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "app_version_images" (
    "app_version_id" uuid NOT NULL,
    "image_id" uuid NOT NULL,
    CONSTRAINT "app_version_images_pkey" PRIMARY KEY ("app_version_id", "image_id")
);

ALTER TABLE "app_version"
    ADD CONSTRAINT "app_version_app_id_foreign" FOREIGN KEY ("app_id") REFERENCES "app" ("id") ON UPDATE CASCADE;

ALTER TABLE "app_version_images"
    ADD CONSTRAINT "app_version_images_app_version_id_foreign" FOREIGN KEY ("app_version_id") REFERENCES "app_version" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "app_version_images"
    ADD CONSTRAINT "app_version_images_image_id_foreign" FOREIGN KEY ("image_id") REFERENCES "image" ("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "image"
    ADD COLUMN "build_number" int NOT NULL DEFAULT 0,
    ADD COLUMN "version" varchar NULL,
    ADD COLUMN "version_comment" varchar NULL;

ALTER TABLE "image"
    ALTER COLUMN "app_id" DROP DEFAULT;

ALTER TABLE "image"
    ALTER COLUMN "app_id" TYPE uuid
    USING ("app_id"::text::uuid);

ALTER TABLE "image"
    ALTER COLUMN "app_id" DROP NOT NULL;

ALTER TABLE "image"
    DROP CONSTRAINT "image_name_key";

ALTER TABLE "app_instance"
    ADD COLUMN "app_version_id" uuid NULL;

--- на подумать,не применял
/*
ALTER TABLE "image"
    ALTER COLUMN "status" TYPE text
    USING ("status"::text);

ALTER TABLE "image"
    ADD CONSTRAINT "image_status_check" CHECK ("status" IN ('not_exist', 'building', 'built'));

ALTER TABLE "image"
    ADD CONSTRAINT "image_app_id_foreign" FOREIGN KEY ("app_id") REFERENCES "app" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE "image"
    ADD CONSTRAINT "image_repository_id_foreign" FOREIGN KEY ("repository_id") REFERENCES "repository" ("id") ON UPDATE CASCADE ON DELETE SET NULL;

*/