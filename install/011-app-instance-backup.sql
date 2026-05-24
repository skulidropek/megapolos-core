CREATE TABLE "app_instance_backup" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid (),
  "create_date" timestamp(6) NULL DEFAULT now(),
  "update_date" timestamp(6) NULL DEFAULT now(),
  "name" varchar(255) NOT NULL,
  "app_instance_id" uuid NULL,
  "artifact_id" uuid NOT NULL,
  CONSTRAINT "app_instance_backup_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "app_instance_backup" ADD CONSTRAINT "app_instance_backup_app_instance_id_foreign" FOREIGN KEY ("app_instance_id") REFERENCES "app_instance" ("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "app_instance_backup" ADD CONSTRAINT "app_instance_backup_artifact_id_foreign" FOREIGN KEY ("artifact_id") REFERENCES "artifact" ("id") ON UPDATE CASCADE;

CREATE INDEX "app_instance_backup_app_instance_id_index" ON "app_instance_backup" ("app_instance_id");
CREATE INDEX "app_instance_backup_artifact_id_index" ON "app_instance_backup" ("artifact_id");
