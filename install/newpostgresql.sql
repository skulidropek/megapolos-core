--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1 (Debian 16.1-1.pgdg120+1)
-- Dumped by pg_dump version 16.1 (Debian 16.1-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.web_server DROP CONSTRAINT IF EXISTS web_server_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS user_group_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resource_repository DROP CONSTRAINT IF EXISTS resource_repository_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resource_domain DROP CONSTRAINT IF EXISTS resource_domain_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resource_docker_image DROP CONSTRAINT IF EXISTS resource_docker_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resource DROP CONSTRAINT IF EXISTS resource_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resource_device_aux_option DROP CONSTRAINT IF EXISTS resource_device_aux_option_resource_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resource_device_aux_option DROP CONSTRAINT IF EXISTS resource_device_aux_option_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resource_db DROP CONSTRAINT IF EXISTS resource_db_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resource_certificate DROP CONSTRAINT IF EXISTS resource_certificate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_volume_requirement DROP CONSTRAINT IF EXISTS image_volume_requirement_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_volume DROP CONSTRAINT IF EXISTS image_volume_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_resource_requirement DROP CONSTRAINT IF EXISTS image_resource_requirement_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image DROP CONSTRAINT IF EXISTS image_repository_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_env_requirement DROP CONSTRAINT IF EXISTS image_env_requirement_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_env_option DROP CONSTRAINT IF EXISTS image_env_option_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_device DROP CONSTRAINT IF EXISTS image_device_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_device_env_option DROP CONSTRAINT IF EXISTS image_device_env_option_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_device_env_option DROP CONSTRAINT IF EXISTS image_device_env_option_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_device DROP CONSTRAINT IF EXISTS image_device_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_device_aux_option DROP CONSTRAINT IF EXISTS image_device_aux_option_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image_device_aux_option DROP CONSTRAINT IF EXISTS image_device_aux_option_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.image DROP CONSTRAINT IF EXISTS image_app_id_fkey;
ALTER TABLE IF EXISTS ONLY public.driver DROP CONSTRAINT IF EXISTS driver_app_id_fkey;
ALTER TABLE IF EXISTS ONLY public.docker_registry DROP CONSTRAINT IF EXISTS docker_registry_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device_option DROP CONSTRAINT IF EXISTS device_option_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device DROP CONSTRAINT IF EXISTS device_node_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device DROP CONSTRAINT IF EXISTS device_driver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device DROP CONSTRAINT IF EXISTS device_device_type_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device DROP CONSTRAINT IF EXISTS device_backup_volume_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device_backup DROP CONSTRAINT IF EXISTS device_backup_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device_backup DROP CONSTRAINT IF EXISTS device_backup_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.device_backup DROP CONSTRAINT IF EXISTS device_backup_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.db_user DROP CONSTRAINT IF EXISTS db_user_dbms_id_fkey;
ALTER TABLE IF EXISTS ONLY public.db DROP CONSTRAINT IF EXISTS db_dbms_id_fkey;
ALTER TABLE IF EXISTS ONLY public.db_db_user DROP CONSTRAINT IF EXISTS db_db_user_db_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.db_db_user DROP CONSTRAINT IF EXISTS db_db_user_db_id_fkey;
ALTER TABLE IF EXISTS ONLY public.db_backup DROP CONSTRAINT IF EXISTS db_backup_artifact_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_volume DROP CONSTRAINT IF EXISTS container_volume_volume_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_volume DROP CONSTRAINT IF EXISTS container_volume_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_resource DROP CONSTRAINT IF EXISTS container_resource_resource_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_resource_env_option DROP CONSTRAINT IF EXISTS container_resource_env_option_resource_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_resource_env_option DROP CONSTRAINT IF EXISTS container_resource_env_option_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_resource DROP CONSTRAINT IF EXISTS container_resource_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container DROP CONSTRAINT IF EXISTS container_node_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container DROP CONSTRAINT IF EXISTS container_image_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_env_option DROP CONSTRAINT IF EXISTS container_env_option_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container DROP CONSTRAINT IF EXISTS container_domain_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_repository DROP CONSTRAINT IF EXISTS container_device_repository_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_repository DROP CONSTRAINT IF EXISTS container_device_repository_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_env_option DROP CONSTRAINT IF EXISTS container_device_env_option_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_env_option DROP CONSTRAINT IF EXISTS container_device_env_option_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_domain DROP CONSTRAINT IF EXISTS container_device_domain_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_domain DROP CONSTRAINT IF EXISTS container_device_domain_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device DROP CONSTRAINT IF EXISTS container_device_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_db DROP CONSTRAINT IF EXISTS container_device_db_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_db DROP CONSTRAINT IF EXISTS container_device_db_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device DROP CONSTRAINT IF EXISTS container_device_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_certificate DROP CONSTRAINT IF EXISTS container_device_certificate_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_certificate DROP CONSTRAINT IF EXISTS container_device_certificate_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_aux_option DROP CONSTRAINT IF EXISTS container_device_aux_option_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container_device_aux_option DROP CONSTRAINT IF EXISTS container_device_aux_option_container_id_fkey;
ALTER TABLE IF EXISTS ONLY public.container DROP CONSTRAINT IF EXISTS container_app_instance_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app DROP CONSTRAINT IF EXISTS app_owner_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_instance DROP CONSTRAINT IF EXISTS app_instance_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_instance DROP CONSTRAINT IF EXISTS app_instance_remove_strategy_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_instance DROP CONSTRAINT IF EXISTS app_instance_instance_type_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_instance_device DROP CONSTRAINT IF EXISTS app_instance_device_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_instance_device DROP CONSTRAINT IF EXISTS app_instance_device_app_instance_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_instance DROP CONSTRAINT IF EXISTS app_instance_deploy_strategy_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_instance DROP CONSTRAINT IF EXISTS app_instance_app_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_device DROP CONSTRAINT IF EXISTS app_device_device_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_device DROP CONSTRAINT IF EXISTS app_device_app_id_fkey;
ALTER TABLE IF EXISTS ONLY public.volume DROP CONSTRAINT IF EXISTS volume_pkey;
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS user_pkey;
ALTER TABLE IF EXISTS ONLY public.resource_repository DROP CONSTRAINT IF EXISTS resource_repository_pkey;
ALTER TABLE IF EXISTS ONLY public.resource DROP CONSTRAINT IF EXISTS resource_pkey;
ALTER TABLE IF EXISTS ONLY public.resource_domain DROP CONSTRAINT IF EXISTS resource_domain_pkey;
ALTER TABLE IF EXISTS ONLY public.resource_docker_image DROP CONSTRAINT IF EXISTS resource_docker_image_pkey;
ALTER TABLE IF EXISTS ONLY public.resource_device_aux_option DROP CONSTRAINT IF EXISTS resource_device_aux_option_pkey;
ALTER TABLE IF EXISTS ONLY public.resource_db DROP CONSTRAINT IF EXISTS resource_db_pkey;
ALTER TABLE IF EXISTS ONLY public.resource_certificate DROP CONSTRAINT IF EXISTS resource_certificate_pkey;
ALTER TABLE IF EXISTS ONLY public.repository DROP CONSTRAINT IF EXISTS repository_pkey;
ALTER TABLE IF EXISTS ONLY public.remove_strategy DROP CONSTRAINT IF EXISTS remove_strategy_pkey;
ALTER TABLE IF EXISTS ONLY public.remove_strategy DROP CONSTRAINT IF EXISTS remove_strategy_name_key;
ALTER TABLE IF EXISTS ONLY public.node DROP CONSTRAINT IF EXISTS node_pkey;
ALTER TABLE IF EXISTS ONLY public.node DROP CONSTRAINT IF EXISTS node_name_key;
ALTER TABLE IF EXISTS ONLY public.log DROP CONSTRAINT IF EXISTS log_pkey;
ALTER TABLE IF EXISTS ONLY public.instance_type DROP CONSTRAINT IF EXISTS instance_type_pkey;
ALTER TABLE IF EXISTS ONLY public.instance_type DROP CONSTRAINT IF EXISTS instance_type_name_key;
ALTER TABLE IF EXISTS ONLY public.image_volume_requirement DROP CONSTRAINT IF EXISTS image_volume_requirement_pkey;
ALTER TABLE IF EXISTS ONLY public.image_volume DROP CONSTRAINT IF EXISTS image_volume_pkey;
ALTER TABLE IF EXISTS ONLY public.image_resource_requirement DROP CONSTRAINT IF EXISTS image_resource_requirement_pkey;
ALTER TABLE IF EXISTS ONLY public.image DROP CONSTRAINT IF EXISTS image_pkey;
ALTER TABLE IF EXISTS ONLY public.image DROP CONSTRAINT IF EXISTS image_name_key;
ALTER TABLE IF EXISTS ONLY public.image_env_requirement DROP CONSTRAINT IF EXISTS image_env_requirement_pkey;
ALTER TABLE IF EXISTS ONLY public.image_env_option DROP CONSTRAINT IF EXISTS image_env_option_pkey;
ALTER TABLE IF EXISTS ONLY public.image_device DROP CONSTRAINT IF EXISTS image_device_pkey;
ALTER TABLE IF EXISTS ONLY public.image_device_env_option DROP CONSTRAINT IF EXISTS image_device_env_option_pkey;
ALTER TABLE IF EXISTS ONLY public.image_device_aux_option DROP CONSTRAINT IF EXISTS image_device_aux_option_pkey;
ALTER TABLE IF EXISTS ONLY public.group_user DROP CONSTRAINT IF EXISTS group_user_pkey;
ALTER TABLE IF EXISTS ONLY public.driver DROP CONSTRAINT IF EXISTS driver_pkey;
ALTER TABLE IF EXISTS ONLY public.driver DROP CONSTRAINT IF EXISTS driver_name_key;
ALTER TABLE IF EXISTS ONLY public.domain DROP CONSTRAINT IF EXISTS domain_pkey;
ALTER TABLE IF EXISTS ONLY public.device_type DROP CONSTRAINT IF EXISTS device_type_pkey;
ALTER TABLE IF EXISTS ONLY public.device_type DROP CONSTRAINT IF EXISTS device_type_name_key;
ALTER TABLE IF EXISTS ONLY public.device DROP CONSTRAINT IF EXISTS device_pkey;
ALTER TABLE IF EXISTS ONLY public.device_option DROP CONSTRAINT IF EXISTS device_option_pkey;
ALTER TABLE IF EXISTS ONLY public.device DROP CONSTRAINT IF EXISTS device_name_key;
ALTER TABLE IF EXISTS ONLY public.device_backup DROP CONSTRAINT IF EXISTS device_backup_pkey;
ALTER TABLE IF EXISTS ONLY public.deploy_strategy DROP CONSTRAINT IF EXISTS deploy_strategy_pkey;
ALTER TABLE IF EXISTS ONLY public.deploy_strategy DROP CONSTRAINT IF EXISTS deploy_strategy_name_key;
ALTER TABLE IF EXISTS ONLY public.dbms DROP CONSTRAINT IF EXISTS dbms_pkey;
ALTER TABLE IF EXISTS ONLY public.db_user DROP CONSTRAINT IF EXISTS db_user_pkey;
ALTER TABLE IF EXISTS ONLY public.db_schema DROP CONSTRAINT IF EXISTS db_schema_pkey;
ALTER TABLE IF EXISTS ONLY public.db DROP CONSTRAINT IF EXISTS db_pkey;
ALTER TABLE IF EXISTS ONLY public.db_backup DROP CONSTRAINT IF EXISTS db_backup_pkey;
ALTER TABLE IF EXISTS ONLY public.container_volume DROP CONSTRAINT IF EXISTS container_volume_pkey;
ALTER TABLE IF EXISTS ONLY public.container_resource DROP CONSTRAINT IF EXISTS container_resource_pkey;
ALTER TABLE IF EXISTS ONLY public.container_resource_env_option DROP CONSTRAINT IF EXISTS container_resource_env_option_pkey;
ALTER TABLE IF EXISTS ONLY public.container DROP CONSTRAINT IF EXISTS container_pkey;
ALTER TABLE IF EXISTS ONLY public.container DROP CONSTRAINT IF EXISTS container_name_key;
ALTER TABLE IF EXISTS ONLY public.container_env_option DROP CONSTRAINT IF EXISTS container_env_option_pkey;
ALTER TABLE IF EXISTS ONLY public.container_device_repository DROP CONSTRAINT IF EXISTS container_device_repository_pkey;
ALTER TABLE IF EXISTS ONLY public.container_device DROP CONSTRAINT IF EXISTS container_device_pkey;
ALTER TABLE IF EXISTS ONLY public.container_device_env_option DROP CONSTRAINT IF EXISTS container_device_env_option_pkey;
ALTER TABLE IF EXISTS ONLY public.container_device_domain DROP CONSTRAINT IF EXISTS container_device_domain_pkey;
ALTER TABLE IF EXISTS ONLY public.container_device_db DROP CONSTRAINT IF EXISTS container_device_db_pkey;
ALTER TABLE IF EXISTS ONLY public.container_device_certificate DROP CONSTRAINT IF EXISTS container_device_certificate_pkey;
ALTER TABLE IF EXISTS ONLY public.container_device_aux_option DROP CONSTRAINT IF EXISTS container_device_aux_option_pkey;
ALTER TABLE IF EXISTS ONLY public.artifact DROP CONSTRAINT IF EXISTS artifact_pkey;
ALTER TABLE IF EXISTS ONLY public.app DROP CONSTRAINT IF EXISTS app_pkey;
ALTER TABLE IF EXISTS ONLY public.app DROP CONSTRAINT IF EXISTS app_name_key;
ALTER TABLE IF EXISTS ONLY public.app_instance DROP CONSTRAINT IF EXISTS app_instance_pkey;
ALTER TABLE IF EXISTS ONLY public.app_instance DROP CONSTRAINT IF EXISTS app_instance_name_key;
ALTER TABLE IF EXISTS ONLY public.app_instance_device DROP CONSTRAINT IF EXISTS app_instance_device_pkey;
ALTER TABLE IF EXISTS ONLY public.app_device DROP CONSTRAINT IF EXISTS app_device_pkey;
DROP TABLE IF EXISTS public.web_server;
DROP TABLE IF EXISTS public.volume;
DROP TABLE IF EXISTS public."user";
DROP TABLE IF EXISTS public.resource_repository;
DROP TABLE IF EXISTS public.resource_domain;
DROP TABLE IF EXISTS public.resource_docker_image;
DROP TABLE IF EXISTS public.resource_device_aux_option;
DROP TABLE IF EXISTS public.resource_db;
DROP TABLE IF EXISTS public.resource_certificate;
DROP TABLE IF EXISTS public.resource;
DROP TABLE IF EXISTS public.repository;
DROP TABLE IF EXISTS public.remove_strategy;
DROP TABLE IF EXISTS public.node;
DROP TABLE IF EXISTS public.log;
DROP TABLE IF EXISTS public.instance_type;
DROP TABLE IF EXISTS public.image_volume_requirement;
DROP TABLE IF EXISTS public.image_volume;
DROP TABLE IF EXISTS public.image_resource_requirement;
DROP TABLE IF EXISTS public.image_env_requirement;
DROP TABLE IF EXISTS public.image_env_option;
DROP TABLE IF EXISTS public.image_device_env_option;
DROP TABLE IF EXISTS public.image_device_aux_option;
DROP TABLE IF EXISTS public.image_device;
DROP TABLE IF EXISTS public.image;
DROP TABLE IF EXISTS public.group_user;
DROP TABLE IF EXISTS public.driver;
DROP TABLE IF EXISTS public.domain;
DROP TABLE IF EXISTS public.docker_registry;
DROP TABLE IF EXISTS public.device_type;
DROP TABLE IF EXISTS public.device_option;
DROP TABLE IF EXISTS public.device_backup;
DROP TABLE IF EXISTS public.device;
DROP TABLE IF EXISTS public.deploy_strategy;
DROP TABLE IF EXISTS public.dbms;
DROP TABLE IF EXISTS public.db_user;
DROP TABLE IF EXISTS public.db_schema;
DROP TABLE IF EXISTS public.db_db_user;
DROP TABLE IF EXISTS public.db_backup;
DROP TABLE IF EXISTS public.db;
DROP TABLE IF EXISTS public.container_volume;
DROP TABLE IF EXISTS public.container_resource_env_option;
DROP TABLE IF EXISTS public.container_resource;
DROP TABLE IF EXISTS public.container_env_option;
DROP TABLE IF EXISTS public.container_device_repository;
DROP TABLE IF EXISTS public.container_device_env_option;
DROP TABLE IF EXISTS public.container_device_domain;
DROP TABLE IF EXISTS public.container_device_db;
DROP TABLE IF EXISTS public.container_device_certificate;
DROP TABLE IF EXISTS public.container_device_aux_option;
DROP TABLE IF EXISTS public.container_device;
DROP TABLE IF EXISTS public.container;
DROP TABLE IF EXISTS public.artifact;
DROP TABLE IF EXISTS public.app_instance_device;
DROP TABLE IF EXISTS public.app_instance;
DROP TABLE IF EXISTS public.app_device;
DROP TABLE IF EXISTS public.app;
DROP TYPE IF EXISTS public.image_status;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: image_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.image_status AS ENUM (
    'not_exist',
    'building',
    'built'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    owner_user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    status character varying DEFAULT 'stoppd'::character varying,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now()
);


--
-- Name: app_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: app_instance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_instance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    user_id uuid NOT NULL,
    life_status character varying NOT NULL,
    app_instance_url character varying NOT NULL,
    app_id uuid NOT NULL,
    instance_type_id uuid,
    deploy_strategy_id uuid,
    remove_strategy_id uuid,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    remove_date timestamp without time zone
);


--
-- Name: app_instance_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_instance_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_instance_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: artifact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artifact (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    type character varying
);


--
-- Name: container; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    image_id uuid NOT NULL,
    node_id uuid NOT NULL,
    outer_port integer,
    app_instance_id uuid NOT NULL,
    life_status character varying DEFAULT 'stopped'::character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    remove_date timestamp without time zone,
    docker_runtime_id character varying,
    domain_id uuid
);


--
-- Name: container_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: container_device_aux_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_aux_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_option_name character varying NOT NULL,
    container_option_value character varying NOT NULL
);


--
-- Name: container_device_certificate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_certificate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    private_key_path character varying NOT NULL,
    public_key_path character varying NOT NULL
);


--
-- Name: container_device_db; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_db (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    db_host character varying NOT NULL,
    db_name character varying NOT NULL,
    db_user character varying NOT NULL,
    db_password character varying NOT NULL,
    db_protocol character varying NOT NULL
);


--
-- Name: container_device_domain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_domain (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    is_ssl integer DEFAULT 0 NOT NULL
);


--
-- Name: container_device_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_env_name character varying NOT NULL,
    device_option_name character varying NOT NULL
);


--
-- Name: container_device_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- Name: container_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_env_name character varying NOT NULL,
    container_env_value character varying NOT NULL
);


--
-- Name: container_resource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_resource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: container_resource_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_resource_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_env_name character varying NOT NULL,
    resource_option_name character varying NOT NULL
);


--
-- Name: container_volume; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_volume (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    volume_id uuid DEFAULT gen_random_uuid() NOT NULL,
    inner_path character varying NOT NULL,
    is_dynamic integer
);


--
-- Name: db; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    dbms_id uuid NOT NULL,
    is_core boolean DEFAULT false
);


--
-- Name: db_backup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db_backup (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    type character varying,
    backup text,
    artifact_id uuid
);


--
-- Name: db_db_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db_db_user (
    db_id uuid NOT NULL,
    db_user_id uuid NOT NULL
);


--
-- Name: db_schema; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db_schema (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    type character varying,
    schema json
);


--
-- Name: db_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    dbms_id uuid NOT NULL,
    password character varying
);


--
-- Name: dbms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dbms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    host character varying,
    "user" character varying,
    password character varying,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone
);


--
-- Name: deploy_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deploy_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- Name: device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    device_type_id uuid DEFAULT gen_random_uuid() NOT NULL,
    node_id uuid DEFAULT gen_random_uuid() NOT NULL,
    is_virtual integer DEFAULT 0 NOT NULL,
    virtual_device_container_id uuid,
    driver_id uuid DEFAULT gen_random_uuid() NOT NULL,
    url character varying,
    life_status character varying DEFAULT 'running'::character varying NOT NULL,
    backup_volume_id uuid,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    remove_date timestamp without time zone
);


--
-- Name: device_backup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_backup (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_name character varying NOT NULL,
    container_id uuid,
    image_id uuid,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    remove_date timestamp without time zone
);


--
-- Name: device_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_option_name character varying NOT NULL,
    device_option_value character varying NOT NULL
);


--
-- Name: device_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- Name: docker_registry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.docker_registry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    host character varying,
    "user" character varying,
    password character varying,
    container_id uuid,
    is_default boolean DEFAULT false
);


--
-- Name: domain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domain (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    auth character varying,
    "user" character varying,
    password character varying
);


--
-- Name: driver; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: group_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    rest_api character varying,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    disable_date timestamp without time zone
);


--
-- Name: image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL,
    image character varying NOT NULL,
    inner_port integer NOT NULL,
    has_state integer DEFAULT 1 NOT NULL,
    tags character varying DEFAULT ''::character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    commit_id character varying,
    repository_id uuid,
    branch character varying,
    status public.image_status DEFAULT 'not_exist'::public.image_status NOT NULL,
    last_build_date timestamp without time zone
);


--
-- Name: image_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: image_device_aux_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_device_aux_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_option_name character varying NOT NULL,
    image_option_value character varying NOT NULL
);


--
-- Name: image_device_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_device_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_env_name character varying NOT NULL,
    device_option_name character varying NOT NULL
);


--
-- Name: image_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_env_name character varying NOT NULL,
    image_env_value character varying NOT NULL
);


--
-- Name: image_env_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_env_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    env_name character varying NOT NULL,
    env_default_value character varying NOT NULL
);


--
-- Name: image_resource_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_resource_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_type character varying NOT NULL,
    resource_kind character varying NOT NULL
);


--
-- Name: image_volume; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_volume (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    inner_path character varying NOT NULL,
    is_dynamic integer
);


--
-- Name: image_volume_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_volume_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    inner_path character varying NOT NULL
);


--
-- Name: instance_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instance_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- Name: log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    is_closed boolean DEFAULT false,
    close_date timestamp without time zone
);


--
-- Name: node; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.node (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    host character varying NOT NULL,
    cpu character varying,
    memory character varying,
    life_status character varying DEFAULT 'running'::character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    remove_date timestamp without time zone,
    "user" character varying,
    password character varying,
    last_update_date timestamp without time zone,
    docker_mirrors character varying[]
);


--
-- Name: remove_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.remove_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- Name: repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    url character varying NOT NULL,
    "user" character varying,
    password character varying,
    create_date timestamp with time zone,
    update_date timestamp without time zone,
    remove_date timestamp without time zone,
    name character varying,
    last_fetch_date timestamp without time zone
);


--
-- Name: resource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    resource_type character varying NOT NULL,
    resource_kind character varying NOT NULL
);


--
-- Name: resource_certificate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_certificate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    private_key_path character varying NOT NULL,
    public_key_path character varying NOT NULL
);


--
-- Name: resource_db; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_db (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    db_host character varying NOT NULL,
    db_name character varying NOT NULL,
    db_user character varying NOT NULL,
    db_password character varying NOT NULL,
    db_protocol character varying NOT NULL
);


--
-- Name: resource_device_aux_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_device_aux_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_option_name character varying NOT NULL,
    resource_option_value character varying NOT NULL
);


--
-- Name: resource_docker_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_docker_image (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image character varying NOT NULL,
    tag character varying NOT NULL,
    docker_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: resource_domain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_domain (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    is_ssl integer DEFAULT 0 NOT NULL
);


--
-- Name: resource_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    group_user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    rest_api character varying,
    user_status character varying DEFAULT 'enable'::character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    disable_date timestamp without time zone,
    os_user_id character varying
);


--
-- Name: volume; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volume (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    type character varying DEFAULT 'auto'::character varying NOT NULL,
    outer_path character varying,
    node_id uuid,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    remove_date timestamp without time zone
);


--
-- Name: web_server; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_server (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    container_id uuid
);


--
-- Name: app_device app_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_pkey PRIMARY KEY (id);


--
-- Name: app_instance_device app_instance_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_pkey PRIMARY KEY (id);


--
-- Name: app_instance app_instance_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_name_key UNIQUE (name);


--
-- Name: app_instance app_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_pkey PRIMARY KEY (id);


--
-- Name: app app_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_name_key UNIQUE (name);


--
-- Name: app app_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_pkey PRIMARY KEY (id);


--
-- Name: artifact artifact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifact
    ADD CONSTRAINT artifact_pkey PRIMARY KEY (id);


--
-- Name: container_device_aux_option container_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_pkey PRIMARY KEY (id);


--
-- Name: container_device_certificate container_device_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_pkey PRIMARY KEY (id);


--
-- Name: container_device_db container_device_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_pkey PRIMARY KEY (id);


--
-- Name: container_device_domain container_device_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_pkey PRIMARY KEY (id);


--
-- Name: container_device_env_option container_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_pkey PRIMARY KEY (id);


--
-- Name: container_device container_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_pkey PRIMARY KEY (id);


--
-- Name: container_device_repository container_device_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_pkey PRIMARY KEY (id);


--
-- Name: container_env_option container_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_pkey PRIMARY KEY (id);


--
-- Name: container container_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_name_key UNIQUE (name);


--
-- Name: container container_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_pkey PRIMARY KEY (id);


--
-- Name: container_resource_env_option container_resource_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_pkey PRIMARY KEY (id);


--
-- Name: container_resource container_resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_pkey PRIMARY KEY (id);


--
-- Name: container_volume container_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_pkey PRIMARY KEY (id);


--
-- Name: db_backup db_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_pkey PRIMARY KEY (id);


--
-- Name: db db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_pkey PRIMARY KEY (id);


--
-- Name: db_schema db_schema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_schema
    ADD CONSTRAINT db_schema_pkey PRIMARY KEY (id);


--
-- Name: db_user db_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_pkey PRIMARY KEY (id);


--
-- Name: dbms dbms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dbms
    ADD CONSTRAINT dbms_pkey PRIMARY KEY (id);


--
-- Name: deploy_strategy deploy_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_name_key UNIQUE (name);


--
-- Name: deploy_strategy deploy_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_pkey PRIMARY KEY (id);


--
-- Name: device_backup device_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_pkey PRIMARY KEY (id);


--
-- Name: device device_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_name_key UNIQUE (name);


--
-- Name: device_option device_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_pkey PRIMARY KEY (id);


--
-- Name: device device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- Name: device_type device_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_name_key UNIQUE (name);


--
-- Name: device_type device_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_pkey PRIMARY KEY (id);


--
-- Name: domain domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain
    ADD CONSTRAINT domain_pkey PRIMARY KEY (id);


--
-- Name: driver driver_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_name_key UNIQUE (name);


--
-- Name: driver driver_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_pkey PRIMARY KEY (id);


--
-- Name: group_user group_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_pkey PRIMARY KEY (id);


--
-- Name: image_device_aux_option image_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_pkey PRIMARY KEY (id);


--
-- Name: image_device_env_option image_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_pkey PRIMARY KEY (id);


--
-- Name: image_device image_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_pkey PRIMARY KEY (id);


--
-- Name: image_env_option image_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_pkey PRIMARY KEY (id);


--
-- Name: image_env_requirement image_env_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_pkey PRIMARY KEY (id);


--
-- Name: image image_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_name_key UNIQUE (name);


--
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- Name: image_resource_requirement image_resource_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_pkey PRIMARY KEY (id);


--
-- Name: image_volume image_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_pkey PRIMARY KEY (id);


--
-- Name: image_volume_requirement image_volume_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_pkey PRIMARY KEY (id);


--
-- Name: instance_type instance_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_name_key UNIQUE (name);


--
-- Name: instance_type instance_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_pkey PRIMARY KEY (id);


--
-- Name: log log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log
    ADD CONSTRAINT log_pkey PRIMARY KEY (id);


--
-- Name: node node_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_name_key UNIQUE (name);


--
-- Name: node node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_pkey PRIMARY KEY (id);


--
-- Name: remove_strategy remove_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_name_key UNIQUE (name);


--
-- Name: remove_strategy remove_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_pkey PRIMARY KEY (id);


--
-- Name: repository repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repository
    ADD CONSTRAINT repository_pkey PRIMARY KEY (id);


--
-- Name: resource_certificate resource_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_pkey PRIMARY KEY (id);


--
-- Name: resource_db resource_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_pkey PRIMARY KEY (id);


--
-- Name: resource_device_aux_option resource_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_pkey PRIMARY KEY (id);


--
-- Name: resource_docker_image resource_docker_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_pkey PRIMARY KEY (id);


--
-- Name: resource_domain resource_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_pkey PRIMARY KEY (id);


--
-- Name: resource resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_pkey PRIMARY KEY (id);


--
-- Name: resource_repository resource_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: volume volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume
    ADD CONSTRAINT volume_pkey PRIMARY KEY (id);


--
-- Name: app_device app_device_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- Name: app_device app_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: app_instance app_instance_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- Name: app_instance app_instance_deploy_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_deploy_strategy_id_fkey FOREIGN KEY (deploy_strategy_id) REFERENCES public.deploy_strategy(id);


--
-- Name: app_instance_device app_instance_device_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- Name: app_instance_device app_instance_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: app_instance app_instance_instance_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_instance_type_id_fkey FOREIGN KEY (instance_type_id) REFERENCES public.instance_type(id);


--
-- Name: app_instance app_instance_remove_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_remove_strategy_id_fkey FOREIGN KEY (remove_strategy_id) REFERENCES public.remove_strategy(id);


--
-- Name: app_instance app_instance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: app app_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public."user"(id);


--
-- Name: container container_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- Name: container_device_aux_option container_device_aux_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_device_aux_option container_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: container_device_certificate container_device_certificate_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_device_certificate container_device_certificate_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: container_device container_device_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_device_db container_device_db_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_device_db container_device_db_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: container_device container_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: container_device_domain container_device_domain_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_device_domain container_device_domain_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: container_device_env_option container_device_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_device_env_option container_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: container_device_repository container_device_repository_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_device_repository container_device_repository_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: container container_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domain(id) NOT VALID;


--
-- Name: container_env_option container_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container container_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: container container_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- Name: container_resource container_resource_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_resource_env_option container_resource_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_resource_env_option container_resource_env_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- Name: container_resource container_resource_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- Name: container_volume container_volume_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: container_volume container_volume_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_volume_id_fkey FOREIGN KEY (volume_id) REFERENCES public.volume(id);


--
-- Name: db_backup db_backup_artifact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.artifact(id) NOT VALID;


--
-- Name: db_db_user db_db_user_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_id_fkey FOREIGN KEY (db_id) REFERENCES public.db(id);


--
-- Name: db_db_user db_db_user_db_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_user_id_fkey FOREIGN KEY (db_user_id) REFERENCES public.db_user(id);


--
-- Name: db db_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id) NOT VALID;


--
-- Name: db_user db_user_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id) NOT VALID;


--
-- Name: device_backup device_backup_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- Name: device_backup device_backup_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: device_backup device_backup_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: device device_backup_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_backup_volume_id_fkey FOREIGN KEY (backup_volume_id) REFERENCES public.volume(id);


--
-- Name: device device_device_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_device_type_id_fkey FOREIGN KEY (device_type_id) REFERENCES public.device_type(id);


--
-- Name: device device_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.driver(id);


--
-- Name: device device_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- Name: device_option device_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: docker_registry docker_registry_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docker_registry
    ADD CONSTRAINT docker_registry_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id) NOT VALID;


--
-- Name: driver driver_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- Name: image image_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- Name: image_device_aux_option image_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: image_device_aux_option image_device_aux_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: image_device image_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: image_device_env_option image_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: image_device_env_option image_device_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: image_device image_device_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: image_env_option image_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: image_env_requirement image_env_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: image image_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repository(id) NOT VALID;


--
-- Name: image_resource_requirement image_resource_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: image_volume image_volume_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: image_volume_requirement image_volume_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- Name: resource_certificate resource_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- Name: resource_db resource_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- Name: resource_device_aux_option resource_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: resource_device_aux_option resource_device_aux_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- Name: resource resource_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- Name: resource_docker_image resource_docker_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- Name: resource_domain resource_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- Name: resource_repository resource_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- Name: user user_group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- Name: web_server web_server_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_server
    ADD CONSTRAINT web_server_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id) NOT VALID;


--
-- PostgreSQL database dump complete
--

