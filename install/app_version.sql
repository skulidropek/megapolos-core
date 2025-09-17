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