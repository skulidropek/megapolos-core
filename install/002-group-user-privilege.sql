
CREATE TABLE public.group_user_privilege (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_user_id uuid NOT NULL,
    object_name character varying NOT NULL,
    object_id character varying NOT NULL,
    action character varying NOT NULL
);

ALTER TABLE ONLY public.group_user_privilege
    ADD CONSTRAINT group_user_privilege_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);