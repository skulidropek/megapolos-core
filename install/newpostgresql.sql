--
-- PostgreSQL database dump
--

\restrict 9dI7FNuvOagKIlCTYGNDD3NTJkJq5aq6aFMxZuygvCXcRhGgfK6s3efuSSrT5vz

-- Dumped from database version 16.1 (Debian 16.1-1.pgdg120+1)
-- Dumped by pg_dump version 18.0

-- Started on 2026-02-26 21:03:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4104 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 913 (class 1247 OID 434964)
-- Name: image_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.image_status AS ENUM (
    'not_exist',
    'building',
    'built'
);


SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 434971)
-- Name: app; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    owner_user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    status character varying DEFAULT 'stoppd'::character varying,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now(),
    description text DEFAULT ''::text NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 434982)
-- Name: app_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 288 (class 1259 OID 464764)
-- Name: app_export; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_export (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    manifest jsonb DEFAULT '{}'::jsonb NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone DEFAULT now()
);


--
-- TOC entry 217 (class 1259 OID 434988)
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
    remove_date timestamp without time zone,
    app_version_id uuid,
    description text DEFAULT ''::text NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 434997)
-- Name: app_instance_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_instance_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_instance_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 435003)
-- Name: app_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_version (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp(6) without time zone DEFAULT now(),
    update_date timestamp(6) without time zone DEFAULT now(),
    app_id uuid NOT NULL,
    build_number integer NOT NULL,
    version character varying,
    version_comment character varying,
    configuration_id uuid NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 435011)
-- Name: app_version_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_version_images (
    app_version_id uuid NOT NULL,
    image_id uuid NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 435014)
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
-- TOC entry 222 (class 1259 OID 435021)
-- Name: configuration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuration (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp(6) without time zone DEFAULT now(),
    update_date timestamp(6) without time zone DEFAULT now(),
    app_id uuid NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 435029)
-- Name: configuration_db_with_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuration_db_with_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp(6) without time zone DEFAULT now(),
    update_date timestamp(6) without time zone DEFAULT now(),
    service_id uuid NOT NULL,
    db_role character varying NOT NULL,
    db_user_role character varying NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 435037)
-- Name: configuration_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuration_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp(6) without time zone DEFAULT now(),
    update_date timestamp(6) without time zone DEFAULT now(),
    service_id uuid NOT NULL,
    name character varying NOT NULL,
    type text NOT NULL,
    default_value character varying NOT NULL,
    is_required boolean DEFAULT true NOT NULL,
    CONSTRAINT configuration_env_option_type_check CHECK ((type = ANY (ARRAY['int'::text, 'boolean'::text, 'string'::text, 'list'::text])))
);


--
-- TOC entry 225 (class 1259 OID 435047)
-- Name: configuration_env_option_value; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuration_env_option_value (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp(6) without time zone DEFAULT now(),
    update_date timestamp(6) without time zone DEFAULT now(),
    env_id uuid NOT NULL,
    value character varying NOT NULL,
    "order" integer NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 435055)
-- Name: configuration_port; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuration_port (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp(6) without time zone DEFAULT now(),
    update_date timestamp(6) without time zone DEFAULT now(),
    service_id uuid NOT NULL,
    role character varying NOT NULL,
    inner_port integer NOT NULL,
    outer_port integer,
    is_domain_required boolean DEFAULT false NOT NULL,
    is_login_and_password_required boolean DEFAULT false NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 435065)
-- Name: configuration_service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuration_service (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp(6) without time zone DEFAULT now(),
    update_date timestamp(6) without time zone DEFAULT now(),
    configuration_id uuid NOT NULL,
    role character varying NOT NULL,
    repository_id uuid,
    cpu_count integer,
    ram_size integer,
    disk_size integer
);


--
-- TOC entry 228 (class 1259 OID 435073)
-- Name: configuration_volume; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuration_volume (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp(6) without time zone DEFAULT now(),
    update_date timestamp(6) without time zone DEFAULT now(),
    service_id uuid NOT NULL,
    role character varying NOT NULL,
    inner_path character varying NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 435081)
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
    domain_id uuid,
    show_on_desktop boolean DEFAULT false NOT NULL,
    uptime timestamp without time zone,
    role character varying
);


--
-- TOC entry 230 (class 1259 OID 435091)
-- Name: container_db; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_db (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    db_id uuid NOT NULL,
    db_user_id uuid NOT NULL,
    container_id uuid NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    role character varying NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 435098)
-- Name: container_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 435104)
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
-- TOC entry 233 (class 1259 OID 435112)
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
-- TOC entry 234 (class 1259 OID 435120)
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
-- TOC entry 235 (class 1259 OID 435128)
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
-- TOC entry 236 (class 1259 OID 435137)
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
-- TOC entry 237 (class 1259 OID 435145)
-- Name: container_device_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 435153)
-- Name: container_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_env_name character varying NOT NULL,
    container_env_value character varying NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 435160)
-- Name: container_resource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_resource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 435166)
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
-- TOC entry 241 (class 1259 OID 435174)
-- Name: container_variable; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_variable (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid NOT NULL,
    name character varying NOT NULL,
    value character varying NOT NULL,
    type character varying NOT NULL
);


--
-- TOC entry 242 (class 1259 OID 435180)
-- Name: container_volume; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_volume (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    volume_id uuid DEFAULT gen_random_uuid() NOT NULL,
    inner_path character varying NOT NULL,
    is_dynamic integer,
    role character varying
);


--
-- TOC entry 243 (class 1259 OID 435188)
-- Name: db; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    dbms_id uuid NOT NULL,
    is_core boolean DEFAULT false,
    owner_id uuid
);


--
-- TOC entry 244 (class 1259 OID 435196)
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
-- TOC entry 245 (class 1259 OID 435203)
-- Name: db_db_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db_db_user (
    db_id uuid NOT NULL,
    db_user_id uuid NOT NULL
);


--
-- TOC entry 246 (class 1259 OID 435206)
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
-- TOC entry 247 (class 1259 OID 435213)
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
-- TOC entry 248 (class 1259 OID 435220)
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
-- TOC entry 249 (class 1259 OID 435227)
-- Name: deploy_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deploy_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 250 (class 1259 OID 435233)
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
-- TOC entry 251 (class 1259 OID 435246)
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
-- TOC entry 252 (class 1259 OID 435255)
-- Name: device_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_option_name character varying NOT NULL,
    device_option_value character varying NOT NULL
);


--
-- TOC entry 253 (class 1259 OID 435262)
-- Name: device_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 254 (class 1259 OID 435268)
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
-- TOC entry 255 (class 1259 OID 435276)
-- Name: domain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domain (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    auth character varying,
    "user" character varying,
    password character varying,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone
);


--
-- TOC entry 256 (class 1259 OID 435283)
-- Name: driver; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 257 (class 1259 OID 435290)
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
-- TOC entry 258 (class 1259 OID 435298)
-- Name: group_user_privilege; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_user_privilege (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_user_id uuid NOT NULL,
    object_name character varying NOT NULL,
    object_id character varying NOT NULL,
    action character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now() NOT NULL,
    update_date timestamp without time zone
);


--
-- TOC entry 259 (class 1259 OID 435305)
-- Name: image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    app_id uuid NOT NULL,
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
    last_build_date timestamp without time zone,
    build_number integer DEFAULT 0 NOT NULL,
    version character varying,
    version_comment character varying,
    role_in_app text DEFAULT ''::text NOT NULL,
    role character varying
);


--
-- TOC entry 260 (class 1259 OID 435318)
-- Name: image_db_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_db_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp with time zone DEFAULT now(),
    update_date timestamp without time zone,
    dbms_type character varying,
    db_backup_id uuid,
    name character varying
);


--
-- TOC entry 261 (class 1259 OID 435325)
-- Name: image_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 262 (class 1259 OID 435331)
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
-- TOC entry 263 (class 1259 OID 435339)
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
-- TOC entry 264 (class 1259 OID 435347)
-- Name: image_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_env_name character varying NOT NULL,
    image_env_value character varying NOT NULL
);


--
-- TOC entry 265 (class 1259 OID 435354)
-- Name: image_env_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_env_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    env_name character varying NOT NULL,
    env_default_value character varying NOT NULL,
    type character varying
);


--
-- TOC entry 266 (class 1259 OID 435361)
-- Name: image_resource_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_resource_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_type character varying NOT NULL,
    resource_kind character varying NOT NULL
);


--
-- TOC entry 267 (class 1259 OID 435368)
-- Name: image_variable_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_variable_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    name character varying NOT NULL,
    default_value character varying NOT NULL,
    type character varying
);


--
-- TOC entry 268 (class 1259 OID 435375)
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
-- TOC entry 269 (class 1259 OID 435382)
-- Name: image_volume_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_volume_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    inner_path character varying NOT NULL,
    create_date timestamp without time zone,
    update_date timestamp without time zone
);


--
-- TOC entry 270 (class 1259 OID 435389)
-- Name: instance_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instance_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 271 (class 1259 OID 435395)
-- Name: log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    is_closed boolean DEFAULT false,
    close_date timestamp without time zone,
    container_id uuid,
    container_name character varying,
    node_id uuid,
    node_name character varying,
    object_id uuid,
    object_name character varying,
    type character varying,
    object_type character varying,
    object_meta jsonb
);


--
-- TOC entry 272 (class 1259 OID 435403)
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
-- TOC entry 273 (class 1259 OID 435412)
-- Name: remove_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.remove_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 274 (class 1259 OID 435418)
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
    last_fetch_date timestamp without time zone,
    app_id uuid,
    microservice_name character varying,
    title character varying,
    repository_type character varying(20) DEFAULT ''::character varying NOT NULL
);


--
-- TOC entry 275 (class 1259 OID 435425)
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
-- TOC entry 276 (class 1259 OID 435432)
-- Name: resource_certificate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_certificate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    private_key_path character varying NOT NULL,
    public_key_path character varying NOT NULL
);


--
-- TOC entry 277 (class 1259 OID 435438)
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
-- TOC entry 278 (class 1259 OID 435444)
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
-- TOC entry 279 (class 1259 OID 435452)
-- Name: resource_docker_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_docker_image (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image character varying NOT NULL,
    tag character varying NOT NULL,
    docker_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 280 (class 1259 OID 435459)
-- Name: resource_domain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_domain (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    is_ssl integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 281 (class 1259 OID 435466)
-- Name: resource_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- TOC entry 282 (class 1259 OID 435472)
-- Name: test_case; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_case (
    name character varying,
    title character varying,
    description character varying,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone
);


--
-- TOC entry 283 (class 1259 OID 435479)
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
-- TOC entry 284 (class 1259 OID 435489)
-- Name: user_group_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_group_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    group_user_id uuid NOT NULL
);


--
-- TOC entry 285 (class 1259 OID 435493)
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
-- TOC entry 286 (class 1259 OID 435502)
-- Name: volume_backup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.volume_backup (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    artifact_id uuid
);


--
-- TOC entry 287 (class 1259 OID 435509)
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
-- TOC entry 3702 (class 2606 OID 435517)
-- Name: app_device app_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3856 (class 2606 OID 464776)
-- Name: app_export app_export_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_export
    ADD CONSTRAINT app_export_name_key UNIQUE (name);


--
-- TOC entry 3858 (class 2606 OID 464774)
-- Name: app_export app_export_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_export
    ADD CONSTRAINT app_export_pkey PRIMARY KEY (id);


--
-- TOC entry 3708 (class 2606 OID 435519)
-- Name: app_instance_device app_instance_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3704 (class 2606 OID 435521)
-- Name: app_instance app_instance_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_name_key UNIQUE (name);


--
-- TOC entry 3706 (class 2606 OID 435523)
-- Name: app_instance app_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_pkey PRIMARY KEY (id);


--
-- TOC entry 3698 (class 2606 OID 435525)
-- Name: app app_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_name_key UNIQUE (name);


--
-- TOC entry 3700 (class 2606 OID 435527)
-- Name: app app_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_pkey PRIMARY KEY (id);


--
-- TOC entry 3712 (class 2606 OID 435529)
-- Name: app_version_images app_version_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version_images
    ADD CONSTRAINT app_version_images_pkey PRIMARY KEY (app_version_id, image_id);


--
-- TOC entry 3710 (class 2606 OID 435531)
-- Name: app_version app_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version
    ADD CONSTRAINT app_version_pkey PRIMARY KEY (id);


--
-- TOC entry 3714 (class 2606 OID 435533)
-- Name: artifact artifact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifact
    ADD CONSTRAINT artifact_pkey PRIMARY KEY (id);


--
-- TOC entry 3718 (class 2606 OID 435535)
-- Name: configuration_db_with_user configuration_db_with_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_db_with_user
    ADD CONSTRAINT configuration_db_with_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3720 (class 2606 OID 435537)
-- Name: configuration_env_option configuration_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_env_option
    ADD CONSTRAINT configuration_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3722 (class 2606 OID 435539)
-- Name: configuration_env_option_value configuration_env_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_env_option_value
    ADD CONSTRAINT configuration_env_option_value_pkey PRIMARY KEY (id);


--
-- TOC entry 3716 (class 2606 OID 435541)
-- Name: configuration configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration
    ADD CONSTRAINT configuration_pkey PRIMARY KEY (id);


--
-- TOC entry 3724 (class 2606 OID 435543)
-- Name: configuration_port configuration_port_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_port
    ADD CONSTRAINT configuration_port_pkey PRIMARY KEY (id);


--
-- TOC entry 3726 (class 2606 OID 435545)
-- Name: configuration_service configuration_service_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_service
    ADD CONSTRAINT configuration_service_pkey PRIMARY KEY (id);


--
-- TOC entry 3728 (class 2606 OID 435547)
-- Name: configuration_volume configuration_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_volume
    ADD CONSTRAINT configuration_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3734 (class 2606 OID 435549)
-- Name: container_db container_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 435551)
-- Name: container_device_aux_option container_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3740 (class 2606 OID 435553)
-- Name: container_device_certificate container_device_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_pkey PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 435555)
-- Name: container_device_db container_device_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 435557)
-- Name: container_device_domain container_device_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 435559)
-- Name: container_device_env_option container_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3736 (class 2606 OID 435561)
-- Name: container_device container_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 435563)
-- Name: container_device_repository container_device_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 435565)
-- Name: container_env_option container_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3730 (class 2606 OID 435567)
-- Name: container container_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_name_key UNIQUE (name);


--
-- TOC entry 3732 (class 2606 OID 435569)
-- Name: container container_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_pkey PRIMARY KEY (id);


--
-- TOC entry 3754 (class 2606 OID 435571)
-- Name: container_resource_env_option container_resource_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3752 (class 2606 OID 435573)
-- Name: container_resource container_resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_pkey PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 435575)
-- Name: container_variable container_variable_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_variable
    ADD CONSTRAINT container_variable_pkey PRIMARY KEY (id);


--
-- TOC entry 3758 (class 2606 OID 435577)
-- Name: container_volume container_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3762 (class 2606 OID 435579)
-- Name: db_backup db_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3764 (class 2606 OID 435581)
-- Name: db_db_user db_db_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_pkey PRIMARY KEY (db_id, db_user_id);


--
-- TOC entry 3760 (class 2606 OID 435583)
-- Name: db db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_pkey PRIMARY KEY (id);


--
-- TOC entry 3766 (class 2606 OID 435585)
-- Name: db_schema db_schema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_schema
    ADD CONSTRAINT db_schema_pkey PRIMARY KEY (id);


--
-- TOC entry 3768 (class 2606 OID 435587)
-- Name: db_user db_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3770 (class 2606 OID 435589)
-- Name: dbms dbms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dbms
    ADD CONSTRAINT dbms_pkey PRIMARY KEY (id);


--
-- TOC entry 3772 (class 2606 OID 435591)
-- Name: deploy_strategy deploy_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_name_key UNIQUE (name);


--
-- TOC entry 3774 (class 2606 OID 435593)
-- Name: deploy_strategy deploy_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_pkey PRIMARY KEY (id);


--
-- TOC entry 3780 (class 2606 OID 435595)
-- Name: device_backup device_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3776 (class 2606 OID 435597)
-- Name: device device_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_name_key UNIQUE (name);


--
-- TOC entry 3782 (class 2606 OID 435599)
-- Name: device_option device_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3778 (class 2606 OID 435601)
-- Name: device device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- TOC entry 3784 (class 2606 OID 435603)
-- Name: device_type device_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_name_key UNIQUE (name);


--
-- TOC entry 3786 (class 2606 OID 435605)
-- Name: device_type device_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3788 (class 2606 OID 435607)
-- Name: domain domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain
    ADD CONSTRAINT domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3790 (class 2606 OID 435609)
-- Name: driver driver_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_name_key UNIQUE (name);


--
-- TOC entry 3792 (class 2606 OID 435611)
-- Name: driver driver_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_pkey PRIMARY KEY (id);


--
-- TOC entry 3794 (class 2606 OID 435613)
-- Name: group_user group_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3798 (class 2606 OID 435615)
-- Name: image_db_requirement image_db_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_db_requirement
    ADD CONSTRAINT image_db_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3802 (class 2606 OID 435617)
-- Name: image_device_aux_option image_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3804 (class 2606 OID 435619)
-- Name: image_device_env_option image_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3800 (class 2606 OID 435621)
-- Name: image_device image_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3806 (class 2606 OID 435623)
-- Name: image_env_option image_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3808 (class 2606 OID 435625)
-- Name: image_env_requirement image_env_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3796 (class 2606 OID 435627)
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- TOC entry 3810 (class 2606 OID 435629)
-- Name: image_resource_requirement image_resource_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3812 (class 2606 OID 435631)
-- Name: image_variable_requirement image_variable_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_variable_requirement
    ADD CONSTRAINT image_variable_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3814 (class 2606 OID 435633)
-- Name: image_volume image_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3816 (class 2606 OID 435635)
-- Name: image_volume_requirement image_volume_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3818 (class 2606 OID 435637)
-- Name: instance_type instance_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_name_key UNIQUE (name);


--
-- TOC entry 3820 (class 2606 OID 435639)
-- Name: instance_type instance_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3822 (class 2606 OID 435641)
-- Name: log log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log
    ADD CONSTRAINT log_pkey PRIMARY KEY (id);


--
-- TOC entry 3824 (class 2606 OID 435643)
-- Name: node node_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_name_key UNIQUE (name);


--
-- TOC entry 3826 (class 2606 OID 435645)
-- Name: node node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_pkey PRIMARY KEY (id);


--
-- TOC entry 3828 (class 2606 OID 435647)
-- Name: remove_strategy remove_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_name_key UNIQUE (name);


--
-- TOC entry 3830 (class 2606 OID 435649)
-- Name: remove_strategy remove_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_pkey PRIMARY KEY (id);


--
-- TOC entry 3832 (class 2606 OID 435651)
-- Name: repository repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repository
    ADD CONSTRAINT repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3836 (class 2606 OID 435653)
-- Name: resource_certificate resource_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_pkey PRIMARY KEY (id);


--
-- TOC entry 3838 (class 2606 OID 435655)
-- Name: resource_db resource_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3840 (class 2606 OID 435657)
-- Name: resource_device_aux_option resource_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3842 (class 2606 OID 435659)
-- Name: resource_docker_image resource_docker_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_pkey PRIMARY KEY (id);


--
-- TOC entry 3844 (class 2606 OID 435661)
-- Name: resource_domain resource_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3834 (class 2606 OID 435663)
-- Name: resource resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_pkey PRIMARY KEY (id);


--
-- TOC entry 3846 (class 2606 OID 435665)
-- Name: resource_repository resource_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3848 (class 2606 OID 435667)
-- Name: test_case test_case_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_case
    ADD CONSTRAINT test_case_pkey PRIMARY KEY (id);


--
-- TOC entry 3850 (class 2606 OID 435669)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 3854 (class 2606 OID 435671)
-- Name: volume_backup volume_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume_backup
    ADD CONSTRAINT volume_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3852 (class 2606 OID 435673)
-- Name: volume volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume
    ADD CONSTRAINT volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3860 (class 2606 OID 435674)
-- Name: app_device app_device_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3861 (class 2606 OID 435679)
-- Name: app_device app_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3862 (class 2606 OID 435684)
-- Name: app_instance app_instance_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3863 (class 2606 OID 435689)
-- Name: app_instance app_instance_deploy_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_deploy_strategy_id_fkey FOREIGN KEY (deploy_strategy_id) REFERENCES public.deploy_strategy(id);


--
-- TOC entry 3867 (class 2606 OID 435694)
-- Name: app_instance_device app_instance_device_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- TOC entry 3868 (class 2606 OID 435699)
-- Name: app_instance_device app_instance_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3864 (class 2606 OID 435704)
-- Name: app_instance app_instance_instance_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_instance_type_id_fkey FOREIGN KEY (instance_type_id) REFERENCES public.instance_type(id);


--
-- TOC entry 3865 (class 2606 OID 435709)
-- Name: app_instance app_instance_remove_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_remove_strategy_id_fkey FOREIGN KEY (remove_strategy_id) REFERENCES public.remove_strategy(id);


--
-- TOC entry 3866 (class 2606 OID 435714)
-- Name: app_instance app_instance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3859 (class 2606 OID 435719)
-- Name: app app_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public."user"(id);


--
-- TOC entry 3869 (class 2606 OID 435724)
-- Name: app_version app_version_app_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version
    ADD CONSTRAINT app_version_app_id_foreign FOREIGN KEY (app_id) REFERENCES public.app(id) ON UPDATE CASCADE;


--
-- TOC entry 3870 (class 2606 OID 435729)
-- Name: app_version app_version_configuration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version
    ADD CONSTRAINT app_version_configuration_id_fkey FOREIGN KEY (configuration_id) REFERENCES public.configuration(id) NOT VALID;


--
-- TOC entry 3871 (class 2606 OID 435734)
-- Name: app_version_images app_version_images_app_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version_images
    ADD CONSTRAINT app_version_images_app_version_id_foreign FOREIGN KEY (app_version_id) REFERENCES public.app_version(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3872 (class 2606 OID 435739)
-- Name: app_version_images app_version_images_image_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version_images
    ADD CONSTRAINT app_version_images_image_id_foreign FOREIGN KEY (image_id) REFERENCES public.image(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3873 (class 2606 OID 435744)
-- Name: configuration configuration_app_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration
    ADD CONSTRAINT configuration_app_id_foreign FOREIGN KEY (app_id) REFERENCES public.app(id) ON UPDATE CASCADE;


--
-- TOC entry 3874 (class 2606 OID 435749)
-- Name: configuration_db_with_user configuration_db_with_user_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_db_with_user
    ADD CONSTRAINT configuration_db_with_user_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.configuration_service(id) ON UPDATE CASCADE;


--
-- TOC entry 3875 (class 2606 OID 435754)
-- Name: configuration_env_option configuration_env_option_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_env_option
    ADD CONSTRAINT configuration_env_option_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.configuration_service(id) ON UPDATE CASCADE;


--
-- TOC entry 3876 (class 2606 OID 435759)
-- Name: configuration_env_option_value configuration_env_option_value_env_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_env_option_value
    ADD CONSTRAINT configuration_env_option_value_env_id_foreign FOREIGN KEY (env_id) REFERENCES public.configuration_env_option(id) ON UPDATE CASCADE;


--
-- TOC entry 3877 (class 2606 OID 435764)
-- Name: configuration_port configuration_port_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_port
    ADD CONSTRAINT configuration_port_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.configuration_service(id) ON UPDATE CASCADE;


--
-- TOC entry 3878 (class 2606 OID 435769)
-- Name: configuration_service configuration_service_configuration_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_service
    ADD CONSTRAINT configuration_service_configuration_id_foreign FOREIGN KEY (configuration_id) REFERENCES public.configuration(id) ON UPDATE CASCADE;


--
-- TOC entry 3879 (class 2606 OID 435774)
-- Name: configuration_service configuration_service_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_service
    ADD CONSTRAINT configuration_service_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repository(id) NOT VALID;


--
-- TOC entry 3880 (class 2606 OID 435779)
-- Name: configuration_volume configuration_volume_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_volume
    ADD CONSTRAINT configuration_volume_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.configuration_service(id) ON UPDATE CASCADE;


--
-- TOC entry 3881 (class 2606 OID 435784)
-- Name: container container_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- TOC entry 3885 (class 2606 OID 435789)
-- Name: container_db container_db_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3886 (class 2606 OID 435794)
-- Name: container_db container_db_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_db_id_fkey FOREIGN KEY (db_id) REFERENCES public.db(id);


--
-- TOC entry 3887 (class 2606 OID 435799)
-- Name: container_db container_db_db_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_db_user_id_fkey FOREIGN KEY (db_user_id) REFERENCES public.db_user(id);


--
-- TOC entry 3890 (class 2606 OID 435804)
-- Name: container_device_aux_option container_device_aux_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3891 (class 2606 OID 435809)
-- Name: container_device_aux_option container_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3892 (class 2606 OID 435814)
-- Name: container_device_certificate container_device_certificate_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3893 (class 2606 OID 435819)
-- Name: container_device_certificate container_device_certificate_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3888 (class 2606 OID 435824)
-- Name: container_device container_device_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3894 (class 2606 OID 435829)
-- Name: container_device_db container_device_db_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3895 (class 2606 OID 435834)
-- Name: container_device_db container_device_db_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3889 (class 2606 OID 435839)
-- Name: container_device container_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3896 (class 2606 OID 435844)
-- Name: container_device_domain container_device_domain_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3897 (class 2606 OID 435849)
-- Name: container_device_domain container_device_domain_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3898 (class 2606 OID 435854)
-- Name: container_device_env_option container_device_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3899 (class 2606 OID 435859)
-- Name: container_device_env_option container_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3900 (class 2606 OID 435864)
-- Name: container_device_repository container_device_repository_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3901 (class 2606 OID 435869)
-- Name: container_device_repository container_device_repository_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3882 (class 2606 OID 435874)
-- Name: container container_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domain(id) NOT VALID;


--
-- TOC entry 3902 (class 2606 OID 435879)
-- Name: container_env_option container_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3883 (class 2606 OID 435884)
-- Name: container container_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3884 (class 2606 OID 435889)
-- Name: container container_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- TOC entry 3903 (class 2606 OID 435894)
-- Name: container_resource container_resource_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3905 (class 2606 OID 435899)
-- Name: container_resource_env_option container_resource_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3906 (class 2606 OID 435904)
-- Name: container_resource_env_option container_resource_env_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3904 (class 2606 OID 435909)
-- Name: container_resource container_resource_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3907 (class 2606 OID 435914)
-- Name: container_variable container_variable_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_variable
    ADD CONSTRAINT container_variable_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3908 (class 2606 OID 435919)
-- Name: container_volume container_volume_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3909 (class 2606 OID 435924)
-- Name: container_volume container_volume_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_volume_id_fkey FOREIGN KEY (volume_id) REFERENCES public.volume(id);


--
-- TOC entry 3912 (class 2606 OID 435929)
-- Name: db_backup db_backup_artifact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.artifact(id) NOT VALID;


--
-- TOC entry 3913 (class 2606 OID 435934)
-- Name: db_db_user db_db_user_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_id_fkey FOREIGN KEY (db_id) REFERENCES public.db(id);


--
-- TOC entry 3914 (class 2606 OID 435939)
-- Name: db_db_user db_db_user_db_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_user_id_fkey FOREIGN KEY (db_user_id) REFERENCES public.db_user(id);


--
-- TOC entry 3910 (class 2606 OID 435944)
-- Name: db db_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id) NOT VALID;


--
-- TOC entry 3911 (class 2606 OID 435949)
-- Name: db db_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.db_user(id) NOT VALID;


--
-- TOC entry 3915 (class 2606 OID 435954)
-- Name: db_user db_user_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id) NOT VALID;


--
-- TOC entry 3920 (class 2606 OID 435959)
-- Name: device_backup device_backup_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3921 (class 2606 OID 435964)
-- Name: device_backup device_backup_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3922 (class 2606 OID 435969)
-- Name: device_backup device_backup_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3916 (class 2606 OID 435974)
-- Name: device device_backup_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_backup_volume_id_fkey FOREIGN KEY (backup_volume_id) REFERENCES public.volume(id);


--
-- TOC entry 3917 (class 2606 OID 435979)
-- Name: device device_device_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_device_type_id_fkey FOREIGN KEY (device_type_id) REFERENCES public.device_type(id);


--
-- TOC entry 3918 (class 2606 OID 435984)
-- Name: device device_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.driver(id);


--
-- TOC entry 3919 (class 2606 OID 435989)
-- Name: device device_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- TOC entry 3923 (class 2606 OID 435994)
-- Name: device_option device_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3924 (class 2606 OID 435999)
-- Name: docker_registry docker_registry_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docker_registry
    ADD CONSTRAINT docker_registry_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id) NOT VALID;


--
-- TOC entry 3925 (class 2606 OID 436004)
-- Name: driver driver_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3926 (class 2606 OID 436009)
-- Name: group_user_privilege group_user_privilege_group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_user_privilege
    ADD CONSTRAINT group_user_privilege_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 3927 (class 2606 OID 436014)
-- Name: image image_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3929 (class 2606 OID 436019)
-- Name: image_db_requirement image_db_requirement_db_backup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_db_requirement
    ADD CONSTRAINT image_db_requirement_db_backup_id_fkey FOREIGN KEY (db_backup_id) REFERENCES public.db_backup(id);


--
-- TOC entry 3932 (class 2606 OID 436024)
-- Name: image_device_aux_option image_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3933 (class 2606 OID 436029)
-- Name: image_device_aux_option image_device_aux_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3930 (class 2606 OID 436034)
-- Name: image_device image_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3934 (class 2606 OID 436039)
-- Name: image_device_env_option image_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3935 (class 2606 OID 436044)
-- Name: image_device_env_option image_device_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3931 (class 2606 OID 436049)
-- Name: image_device image_device_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3936 (class 2606 OID 436054)
-- Name: image_env_option image_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3937 (class 2606 OID 436059)
-- Name: image_env_requirement image_env_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3928 (class 2606 OID 436064)
-- Name: image image_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repository(id) NOT VALID;


--
-- TOC entry 3938 (class 2606 OID 436069)
-- Name: image_resource_requirement image_resource_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3939 (class 2606 OID 436074)
-- Name: image_variable_requirement image_variable_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_variable_requirement
    ADD CONSTRAINT image_variable_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3940 (class 2606 OID 436079)
-- Name: image_volume image_volume_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3941 (class 2606 OID 436084)
-- Name: image_volume_requirement image_volume_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3942 (class 2606 OID 436089)
-- Name: repository repository_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repository
    ADD CONSTRAINT repository_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id) NOT VALID;


--
-- TOC entry 3944 (class 2606 OID 436094)
-- Name: resource_certificate resource_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3945 (class 2606 OID 436099)
-- Name: resource_db resource_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3946 (class 2606 OID 436104)
-- Name: resource_device_aux_option resource_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3947 (class 2606 OID 436109)
-- Name: resource_device_aux_option resource_device_aux_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3943 (class 2606 OID 436114)
-- Name: resource resource_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3948 (class 2606 OID 436119)
-- Name: resource_docker_image resource_docker_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3949 (class 2606 OID 436124)
-- Name: resource_domain resource_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3950 (class 2606 OID 436129)
-- Name: resource_repository resource_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3952 (class 2606 OID 436134)
-- Name: user_group_link user_group_link_group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_group_link
    ADD CONSTRAINT user_group_link_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 3953 (class 2606 OID 436139)
-- Name: user_group_link user_group_link_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_group_link
    ADD CONSTRAINT user_group_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3951 (class 2606 OID 436144)
-- Name: user user_group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 3954 (class 2606 OID 436149)
-- Name: volume_backup volume_backup_artifact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume_backup
    ADD CONSTRAINT volume_backup_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.artifact(id);


--
-- TOC entry 3955 (class 2606 OID 436154)
-- Name: web_server web_server_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_server
    ADD CONSTRAINT web_server_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id) NOT VALID;


-- Completed on 2026-02-26 21:03:06

--
-- PostgreSQL database dump complete
--

\unrestrict 9dI7FNuvOagKIlCTYGNDD3NTJkJq5aq6aFMxZuygvCXcRhGgfK6s3efuSSrT5vz

