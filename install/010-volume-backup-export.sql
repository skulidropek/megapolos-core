-- Migration for VolumeBackup changes and adding new log types
-- Added optional volume relation to VolumeBackup
ALTER TABLE "volume_backup" ADD COLUMN IF NOT EXISTS "volume_id" uuid NULL;
ALTER TABLE "volume_backup" ADD COLUMN IF NOT EXISTS "container_id" uuid NULL;

-- Fix VolumeBackup table to match entity (ensure audit columns exist if they didn't)
-- Based on the entity class VolumeBackup extends BaseEntity, 
-- but we are keeping create_date and update_date as specified by the user.
ALTER TABLE "volume_backup" ADD COLUMN IF NOT EXISTS "create_date" timestamp(6) NULL DEFAULT now();
ALTER TABLE "volume_backup" ADD COLUMN IF NOT EXISTS "update_date" timestamp(6) NULL;

-- Added FK for volume relation
ALTER TABLE "volume_backup" 
ADD CONSTRAINT "volume_backup_volume_id_foreign" 
FOREIGN KEY ("volume_id") REFERENCES "volume" ("id") ON UPDATE CASCADE ON DELETE SET NULL;
