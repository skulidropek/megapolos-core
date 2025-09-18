ALTER TABLE IF EXISTS public.log
    ADD COLUMN object_type character varying COLLATE pg_catalog."default";

UPDATE public.log
	SET  object_type='Image'
	WHERE type='image_build';