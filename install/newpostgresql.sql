--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1 (Debian 16.1-1.pgdg120+1)
-- Dumped by pg_dump version 17.6

-- Started on 2025-11-18 10:20:33

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
-- TOC entry 4092 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 912 (class 1247 OID 423989)
-- Name: image_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.image_status AS ENUM (
    'not_exist',
    'building',
    'built'
);


SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 423995)
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
-- TOC entry 216 (class 1259 OID 424006)
-- Name: app_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 424012)
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
-- TOC entry 218 (class 1259 OID 424021)
-- Name: app_instance_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_instance_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_instance_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 424027)
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
-- TOC entry 220 (class 1259 OID 424035)
-- Name: app_version_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_version_images (
    app_version_id uuid NOT NULL,
    image_id uuid NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 424038)
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
-- TOC entry 222 (class 1259 OID 424045)
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
-- TOC entry 223 (class 1259 OID 424053)
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
-- TOC entry 224 (class 1259 OID 424061)
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
-- TOC entry 225 (class 1259 OID 424071)
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
-- TOC entry 226 (class 1259 OID 424079)
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
-- TOC entry 227 (class 1259 OID 424089)
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
-- TOC entry 228 (class 1259 OID 424097)
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
-- TOC entry 229 (class 1259 OID 424105)
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
-- TOC entry 230 (class 1259 OID 424115)
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
-- TOC entry 231 (class 1259 OID 424122)
-- Name: container_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 424128)
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
-- TOC entry 233 (class 1259 OID 424136)
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
-- TOC entry 234 (class 1259 OID 424144)
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
-- TOC entry 235 (class 1259 OID 424152)
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
-- TOC entry 236 (class 1259 OID 424161)
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
-- TOC entry 237 (class 1259 OID 424169)
-- Name: container_device_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 424177)
-- Name: container_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_env_name character varying NOT NULL,
    container_env_value character varying NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 424184)
-- Name: container_resource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_resource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 424190)
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
-- TOC entry 241 (class 1259 OID 424198)
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
-- TOC entry 242 (class 1259 OID 424204)
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
-- TOC entry 243 (class 1259 OID 424212)
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
-- TOC entry 244 (class 1259 OID 424220)
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
-- TOC entry 245 (class 1259 OID 424227)
-- Name: db_db_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db_db_user (
    db_id uuid NOT NULL,
    db_user_id uuid NOT NULL
);


--
-- TOC entry 246 (class 1259 OID 424230)
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
-- TOC entry 247 (class 1259 OID 424237)
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
-- TOC entry 248 (class 1259 OID 424244)
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
-- TOC entry 249 (class 1259 OID 424251)
-- Name: deploy_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deploy_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 250 (class 1259 OID 424257)
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
-- TOC entry 251 (class 1259 OID 424270)
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
-- TOC entry 252 (class 1259 OID 424279)
-- Name: device_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_option_name character varying NOT NULL,
    device_option_value character varying NOT NULL
);


--
-- TOC entry 253 (class 1259 OID 424286)
-- Name: device_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 254 (class 1259 OID 424292)
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
-- TOC entry 255 (class 1259 OID 424300)
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
-- TOC entry 256 (class 1259 OID 424307)
-- Name: driver; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 257 (class 1259 OID 424314)
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
-- TOC entry 258 (class 1259 OID 424322)
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
-- TOC entry 259 (class 1259 OID 424329)
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
-- TOC entry 260 (class 1259 OID 424342)
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
-- TOC entry 261 (class 1259 OID 424349)
-- Name: image_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 262 (class 1259 OID 424355)
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
-- TOC entry 263 (class 1259 OID 424363)
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
-- TOC entry 264 (class 1259 OID 424371)
-- Name: image_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_env_name character varying NOT NULL,
    image_env_value character varying NOT NULL
);


--
-- TOC entry 265 (class 1259 OID 424378)
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
-- TOC entry 266 (class 1259 OID 424385)
-- Name: image_resource_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_resource_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_type character varying NOT NULL,
    resource_kind character varying NOT NULL
);


--
-- TOC entry 267 (class 1259 OID 424392)
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
-- TOC entry 268 (class 1259 OID 424399)
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
-- TOC entry 269 (class 1259 OID 424406)
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
-- TOC entry 270 (class 1259 OID 424413)
-- Name: instance_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instance_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 271 (class 1259 OID 424419)
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
-- TOC entry 272 (class 1259 OID 424427)
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
-- TOC entry 273 (class 1259 OID 424436)
-- Name: remove_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.remove_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 274 (class 1259 OID 424442)
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
-- TOC entry 275 (class 1259 OID 424449)
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
-- TOC entry 276 (class 1259 OID 424456)
-- Name: resource_certificate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_certificate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    private_key_path character varying NOT NULL,
    public_key_path character varying NOT NULL
);


--
-- TOC entry 277 (class 1259 OID 424462)
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
-- TOC entry 278 (class 1259 OID 424468)
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
-- TOC entry 279 (class 1259 OID 424476)
-- Name: resource_docker_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_docker_image (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image character varying NOT NULL,
    tag character varying NOT NULL,
    docker_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 280 (class 1259 OID 424483)
-- Name: resource_domain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_domain (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    is_ssl integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 281 (class 1259 OID 424490)
-- Name: resource_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- TOC entry 282 (class 1259 OID 424496)
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
-- TOC entry 283 (class 1259 OID 424503)
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
-- TOC entry 284 (class 1259 OID 424513)
-- Name: user_group_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_group_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    group_user_id uuid NOT NULL
);


--
-- TOC entry 285 (class 1259 OID 424517)
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
-- TOC entry 286 (class 1259 OID 424526)
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
-- TOC entry 287 (class 1259 OID 424533)
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
-- TOC entry 3694 (class 2606 OID 424541)
-- Name: app_device app_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3700 (class 2606 OID 424543)
-- Name: app_instance_device app_instance_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3696 (class 2606 OID 424545)
-- Name: app_instance app_instance_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_name_key UNIQUE (name);


--
-- TOC entry 3698 (class 2606 OID 424547)
-- Name: app_instance app_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_pkey PRIMARY KEY (id);


--
-- TOC entry 3690 (class 2606 OID 424549)
-- Name: app app_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_name_key UNIQUE (name);


--
-- TOC entry 3692 (class 2606 OID 424551)
-- Name: app app_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_pkey PRIMARY KEY (id);


--
-- TOC entry 3704 (class 2606 OID 424553)
-- Name: app_version_images app_version_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version_images
    ADD CONSTRAINT app_version_images_pkey PRIMARY KEY (app_version_id, image_id);


--
-- TOC entry 3702 (class 2606 OID 424555)
-- Name: app_version app_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version
    ADD CONSTRAINT app_version_pkey PRIMARY KEY (id);


--
-- TOC entry 3706 (class 2606 OID 424557)
-- Name: artifact artifact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifact
    ADD CONSTRAINT artifact_pkey PRIMARY KEY (id);


--
-- TOC entry 3710 (class 2606 OID 424559)
-- Name: configuration_db_with_user configuration_db_with_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_db_with_user
    ADD CONSTRAINT configuration_db_with_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3712 (class 2606 OID 424561)
-- Name: configuration_env_option configuration_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_env_option
    ADD CONSTRAINT configuration_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3714 (class 2606 OID 424563)
-- Name: configuration_env_option_value configuration_env_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_env_option_value
    ADD CONSTRAINT configuration_env_option_value_pkey PRIMARY KEY (id);


--
-- TOC entry 3708 (class 2606 OID 424565)
-- Name: configuration configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration
    ADD CONSTRAINT configuration_pkey PRIMARY KEY (id);


--
-- TOC entry 3716 (class 2606 OID 424567)
-- Name: configuration_port configuration_port_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_port
    ADD CONSTRAINT configuration_port_pkey PRIMARY KEY (id);


--
-- TOC entry 3718 (class 2606 OID 424569)
-- Name: configuration_service configuration_service_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_service
    ADD CONSTRAINT configuration_service_pkey PRIMARY KEY (id);


--
-- TOC entry 3720 (class 2606 OID 424571)
-- Name: configuration_volume configuration_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_volume
    ADD CONSTRAINT configuration_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3726 (class 2606 OID 424573)
-- Name: container_db container_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3730 (class 2606 OID 424575)
-- Name: container_device_aux_option container_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3732 (class 2606 OID 424577)
-- Name: container_device_certificate container_device_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_pkey PRIMARY KEY (id);


--
-- TOC entry 3734 (class 2606 OID 424579)
-- Name: container_device_db container_device_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3736 (class 2606 OID 424581)
-- Name: container_device_domain container_device_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 424583)
-- Name: container_device_env_option container_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3728 (class 2606 OID 424585)
-- Name: container_device container_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3740 (class 2606 OID 424587)
-- Name: container_device_repository container_device_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 424589)
-- Name: container_env_option container_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3722 (class 2606 OID 424591)
-- Name: container container_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_name_key UNIQUE (name);


--
-- TOC entry 3724 (class 2606 OID 424593)
-- Name: container container_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_pkey PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 424595)
-- Name: container_resource_env_option container_resource_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 424597)
-- Name: container_resource container_resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_pkey PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 424599)
-- Name: container_variable container_variable_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_variable
    ADD CONSTRAINT container_variable_pkey PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 424601)
-- Name: container_volume container_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3754 (class 2606 OID 424603)
-- Name: db_backup db_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 424605)
-- Name: db_db_user db_db_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_pkey PRIMARY KEY (db_id, db_user_id);


--
-- TOC entry 3752 (class 2606 OID 424607)
-- Name: db db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_pkey PRIMARY KEY (id);


--
-- TOC entry 3758 (class 2606 OID 424609)
-- Name: db_schema db_schema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_schema
    ADD CONSTRAINT db_schema_pkey PRIMARY KEY (id);


--
-- TOC entry 3760 (class 2606 OID 424611)
-- Name: db_user db_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3762 (class 2606 OID 424613)
-- Name: dbms dbms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dbms
    ADD CONSTRAINT dbms_pkey PRIMARY KEY (id);


--
-- TOC entry 3764 (class 2606 OID 424615)
-- Name: deploy_strategy deploy_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_name_key UNIQUE (name);


--
-- TOC entry 3766 (class 2606 OID 424617)
-- Name: deploy_strategy deploy_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_pkey PRIMARY KEY (id);


--
-- TOC entry 3772 (class 2606 OID 424619)
-- Name: device_backup device_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3768 (class 2606 OID 424621)
-- Name: device device_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_name_key UNIQUE (name);


--
-- TOC entry 3774 (class 2606 OID 424623)
-- Name: device_option device_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3770 (class 2606 OID 424625)
-- Name: device device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- TOC entry 3776 (class 2606 OID 424627)
-- Name: device_type device_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_name_key UNIQUE (name);


--
-- TOC entry 3778 (class 2606 OID 424629)
-- Name: device_type device_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3780 (class 2606 OID 424631)
-- Name: domain domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain
    ADD CONSTRAINT domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3782 (class 2606 OID 424633)
-- Name: driver driver_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_name_key UNIQUE (name);


--
-- TOC entry 3784 (class 2606 OID 424635)
-- Name: driver driver_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_pkey PRIMARY KEY (id);


--
-- TOC entry 3786 (class 2606 OID 424637)
-- Name: group_user group_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3790 (class 2606 OID 424639)
-- Name: image_db_requirement image_db_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_db_requirement
    ADD CONSTRAINT image_db_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3794 (class 2606 OID 424641)
-- Name: image_device_aux_option image_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3796 (class 2606 OID 424643)
-- Name: image_device_env_option image_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3792 (class 2606 OID 424645)
-- Name: image_device image_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3798 (class 2606 OID 424647)
-- Name: image_env_option image_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3800 (class 2606 OID 424649)
-- Name: image_env_requirement image_env_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3788 (class 2606 OID 424651)
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- TOC entry 3802 (class 2606 OID 424653)
-- Name: image_resource_requirement image_resource_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3804 (class 2606 OID 424655)
-- Name: image_variable_requirement image_variable_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_variable_requirement
    ADD CONSTRAINT image_variable_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3806 (class 2606 OID 424657)
-- Name: image_volume image_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3808 (class 2606 OID 424659)
-- Name: image_volume_requirement image_volume_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3810 (class 2606 OID 424661)
-- Name: instance_type instance_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_name_key UNIQUE (name);


--
-- TOC entry 3812 (class 2606 OID 424663)
-- Name: instance_type instance_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3814 (class 2606 OID 424665)
-- Name: log log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log
    ADD CONSTRAINT log_pkey PRIMARY KEY (id);


--
-- TOC entry 3816 (class 2606 OID 424667)
-- Name: node node_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_name_key UNIQUE (name);


--
-- TOC entry 3818 (class 2606 OID 424669)
-- Name: node node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_pkey PRIMARY KEY (id);


--
-- TOC entry 3820 (class 2606 OID 424671)
-- Name: remove_strategy remove_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_name_key UNIQUE (name);


--
-- TOC entry 3822 (class 2606 OID 424673)
-- Name: remove_strategy remove_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_pkey PRIMARY KEY (id);


--
-- TOC entry 3824 (class 2606 OID 424675)
-- Name: repository repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repository
    ADD CONSTRAINT repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3828 (class 2606 OID 424677)
-- Name: resource_certificate resource_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_pkey PRIMARY KEY (id);


--
-- TOC entry 3830 (class 2606 OID 424679)
-- Name: resource_db resource_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3832 (class 2606 OID 424681)
-- Name: resource_device_aux_option resource_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3834 (class 2606 OID 424683)
-- Name: resource_docker_image resource_docker_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_pkey PRIMARY KEY (id);


--
-- TOC entry 3836 (class 2606 OID 424685)
-- Name: resource_domain resource_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3826 (class 2606 OID 424687)
-- Name: resource resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_pkey PRIMARY KEY (id);


--
-- TOC entry 3838 (class 2606 OID 424689)
-- Name: resource_repository resource_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3840 (class 2606 OID 424691)
-- Name: test_case test_case_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_case
    ADD CONSTRAINT test_case_pkey PRIMARY KEY (id);


--
-- TOC entry 3842 (class 2606 OID 424693)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 3846 (class 2606 OID 424695)
-- Name: volume_backup volume_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume_backup
    ADD CONSTRAINT volume_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3844 (class 2606 OID 424697)
-- Name: volume volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume
    ADD CONSTRAINT volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3848 (class 2606 OID 424698)
-- Name: app_device app_device_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3849 (class 2606 OID 424703)
-- Name: app_device app_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3850 (class 2606 OID 424708)
-- Name: app_instance app_instance_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3851 (class 2606 OID 424713)
-- Name: app_instance app_instance_deploy_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_deploy_strategy_id_fkey FOREIGN KEY (deploy_strategy_id) REFERENCES public.deploy_strategy(id);


--
-- TOC entry 3855 (class 2606 OID 424718)
-- Name: app_instance_device app_instance_device_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- TOC entry 3856 (class 2606 OID 424723)
-- Name: app_instance_device app_instance_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3852 (class 2606 OID 424728)
-- Name: app_instance app_instance_instance_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_instance_type_id_fkey FOREIGN KEY (instance_type_id) REFERENCES public.instance_type(id);


--
-- TOC entry 3853 (class 2606 OID 424733)
-- Name: app_instance app_instance_remove_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_remove_strategy_id_fkey FOREIGN KEY (remove_strategy_id) REFERENCES public.remove_strategy(id);


--
-- TOC entry 3854 (class 2606 OID 424738)
-- Name: app_instance app_instance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3847 (class 2606 OID 424743)
-- Name: app app_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public."user"(id);


--
-- TOC entry 3857 (class 2606 OID 424748)
-- Name: app_version app_version_app_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version
    ADD CONSTRAINT app_version_app_id_foreign FOREIGN KEY (app_id) REFERENCES public.app(id) ON UPDATE CASCADE;


--
-- TOC entry 3858 (class 2606 OID 424753)
-- Name: app_version app_version_configuration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version
    ADD CONSTRAINT app_version_configuration_id_fkey FOREIGN KEY (configuration_id) REFERENCES public.configuration(id) NOT VALID;


--
-- TOC entry 3859 (class 2606 OID 424758)
-- Name: app_version_images app_version_images_app_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version_images
    ADD CONSTRAINT app_version_images_app_version_id_foreign FOREIGN KEY (app_version_id) REFERENCES public.app_version(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3860 (class 2606 OID 424763)
-- Name: app_version_images app_version_images_image_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version_images
    ADD CONSTRAINT app_version_images_image_id_foreign FOREIGN KEY (image_id) REFERENCES public.image(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3861 (class 2606 OID 424768)
-- Name: configuration configuration_app_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration
    ADD CONSTRAINT configuration_app_id_foreign FOREIGN KEY (app_id) REFERENCES public.app(id) ON UPDATE CASCADE;


--
-- TOC entry 3862 (class 2606 OID 424773)
-- Name: configuration_db_with_user configuration_db_with_user_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_db_with_user
    ADD CONSTRAINT configuration_db_with_user_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.configuration_service(id) ON UPDATE CASCADE;


--
-- TOC entry 3863 (class 2606 OID 424778)
-- Name: configuration_env_option configuration_env_option_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_env_option
    ADD CONSTRAINT configuration_env_option_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.configuration_service(id) ON UPDATE CASCADE;


--
-- TOC entry 3864 (class 2606 OID 424783)
-- Name: configuration_env_option_value configuration_env_option_value_env_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_env_option_value
    ADD CONSTRAINT configuration_env_option_value_env_id_foreign FOREIGN KEY (env_id) REFERENCES public.configuration_env_option(id) ON UPDATE CASCADE;


--
-- TOC entry 3865 (class 2606 OID 424788)
-- Name: configuration_port configuration_port_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_port
    ADD CONSTRAINT configuration_port_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.configuration_service(id) ON UPDATE CASCADE;


--
-- TOC entry 3866 (class 2606 OID 424793)
-- Name: configuration_service configuration_service_configuration_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_service
    ADD CONSTRAINT configuration_service_configuration_id_foreign FOREIGN KEY (configuration_id) REFERENCES public.configuration(id) ON UPDATE CASCADE;


--
-- TOC entry 3867 (class 2606 OID 425179)
-- Name: configuration_service configuration_service_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_service
    ADD CONSTRAINT configuration_service_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repository(id) NOT VALID;


--
-- TOC entry 3868 (class 2606 OID 424798)
-- Name: configuration_volume configuration_volume_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuration_volume
    ADD CONSTRAINT configuration_volume_service_id_foreign FOREIGN KEY (service_id) REFERENCES public.configuration_service(id) ON UPDATE CASCADE;


--
-- TOC entry 3869 (class 2606 OID 424803)
-- Name: container container_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- TOC entry 3873 (class 2606 OID 424808)
-- Name: container_db container_db_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3874 (class 2606 OID 424813)
-- Name: container_db container_db_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_db_id_fkey FOREIGN KEY (db_id) REFERENCES public.db(id);


--
-- TOC entry 3875 (class 2606 OID 424818)
-- Name: container_db container_db_db_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_db_user_id_fkey FOREIGN KEY (db_user_id) REFERENCES public.db_user(id);


--
-- TOC entry 3878 (class 2606 OID 424823)
-- Name: container_device_aux_option container_device_aux_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3879 (class 2606 OID 424828)
-- Name: container_device_aux_option container_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3880 (class 2606 OID 424833)
-- Name: container_device_certificate container_device_certificate_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3881 (class 2606 OID 424838)
-- Name: container_device_certificate container_device_certificate_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3876 (class 2606 OID 424843)
-- Name: container_device container_device_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3882 (class 2606 OID 424848)
-- Name: container_device_db container_device_db_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3883 (class 2606 OID 424853)
-- Name: container_device_db container_device_db_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3877 (class 2606 OID 424858)
-- Name: container_device container_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3884 (class 2606 OID 424863)
-- Name: container_device_domain container_device_domain_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3885 (class 2606 OID 424868)
-- Name: container_device_domain container_device_domain_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3886 (class 2606 OID 424873)
-- Name: container_device_env_option container_device_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3887 (class 2606 OID 424878)
-- Name: container_device_env_option container_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3888 (class 2606 OID 424883)
-- Name: container_device_repository container_device_repository_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3889 (class 2606 OID 424888)
-- Name: container_device_repository container_device_repository_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3870 (class 2606 OID 424893)
-- Name: container container_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domain(id) NOT VALID;


--
-- TOC entry 3890 (class 2606 OID 424898)
-- Name: container_env_option container_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3871 (class 2606 OID 424903)
-- Name: container container_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3872 (class 2606 OID 424908)
-- Name: container container_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- TOC entry 3891 (class 2606 OID 424913)
-- Name: container_resource container_resource_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3893 (class 2606 OID 424918)
-- Name: container_resource_env_option container_resource_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3894 (class 2606 OID 424923)
-- Name: container_resource_env_option container_resource_env_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3892 (class 2606 OID 424928)
-- Name: container_resource container_resource_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3895 (class 2606 OID 424933)
-- Name: container_variable container_variable_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_variable
    ADD CONSTRAINT container_variable_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3896 (class 2606 OID 424938)
-- Name: container_volume container_volume_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3897 (class 2606 OID 424943)
-- Name: container_volume container_volume_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_volume_id_fkey FOREIGN KEY (volume_id) REFERENCES public.volume(id);


--
-- TOC entry 3900 (class 2606 OID 424948)
-- Name: db_backup db_backup_artifact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.artifact(id) NOT VALID;


--
-- TOC entry 3901 (class 2606 OID 424953)
-- Name: db_db_user db_db_user_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_id_fkey FOREIGN KEY (db_id) REFERENCES public.db(id);


--
-- TOC entry 3902 (class 2606 OID 424958)
-- Name: db_db_user db_db_user_db_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_user_id_fkey FOREIGN KEY (db_user_id) REFERENCES public.db_user(id);


--
-- TOC entry 3898 (class 2606 OID 424963)
-- Name: db db_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id) NOT VALID;


--
-- TOC entry 3899 (class 2606 OID 424968)
-- Name: db db_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.db_user(id) NOT VALID;


--
-- TOC entry 3903 (class 2606 OID 424973)
-- Name: db_user db_user_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id) NOT VALID;


--
-- TOC entry 3908 (class 2606 OID 424978)
-- Name: device_backup device_backup_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3909 (class 2606 OID 424983)
-- Name: device_backup device_backup_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3910 (class 2606 OID 424988)
-- Name: device_backup device_backup_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3904 (class 2606 OID 424993)
-- Name: device device_backup_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_backup_volume_id_fkey FOREIGN KEY (backup_volume_id) REFERENCES public.volume(id);


--
-- TOC entry 3905 (class 2606 OID 424998)
-- Name: device device_device_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_device_type_id_fkey FOREIGN KEY (device_type_id) REFERENCES public.device_type(id);


--
-- TOC entry 3906 (class 2606 OID 425003)
-- Name: device device_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.driver(id);


--
-- TOC entry 3907 (class 2606 OID 425008)
-- Name: device device_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- TOC entry 3911 (class 2606 OID 425013)
-- Name: device_option device_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3912 (class 2606 OID 425018)
-- Name: docker_registry docker_registry_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docker_registry
    ADD CONSTRAINT docker_registry_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id) NOT VALID;


--
-- TOC entry 3913 (class 2606 OID 425023)
-- Name: driver driver_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3914 (class 2606 OID 425028)
-- Name: group_user_privilege group_user_privilege_group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_user_privilege
    ADD CONSTRAINT group_user_privilege_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 3915 (class 2606 OID 425033)
-- Name: image image_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3917 (class 2606 OID 425038)
-- Name: image_db_requirement image_db_requirement_db_backup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_db_requirement
    ADD CONSTRAINT image_db_requirement_db_backup_id_fkey FOREIGN KEY (db_backup_id) REFERENCES public.db_backup(id);


--
-- TOC entry 3920 (class 2606 OID 425043)
-- Name: image_device_aux_option image_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3921 (class 2606 OID 425048)
-- Name: image_device_aux_option image_device_aux_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3918 (class 2606 OID 425053)
-- Name: image_device image_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3922 (class 2606 OID 425058)
-- Name: image_device_env_option image_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3923 (class 2606 OID 425063)
-- Name: image_device_env_option image_device_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3919 (class 2606 OID 425068)
-- Name: image_device image_device_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3924 (class 2606 OID 425073)
-- Name: image_env_option image_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3925 (class 2606 OID 425078)
-- Name: image_env_requirement image_env_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3916 (class 2606 OID 425083)
-- Name: image image_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repository(id) NOT VALID;


--
-- TOC entry 3926 (class 2606 OID 425088)
-- Name: image_resource_requirement image_resource_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3927 (class 2606 OID 425093)
-- Name: image_variable_requirement image_variable_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_variable_requirement
    ADD CONSTRAINT image_variable_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3928 (class 2606 OID 425098)
-- Name: image_volume image_volume_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3929 (class 2606 OID 425103)
-- Name: image_volume_requirement image_volume_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3930 (class 2606 OID 425108)
-- Name: repository repository_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repository
    ADD CONSTRAINT repository_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id) NOT VALID;


--
-- TOC entry 3932 (class 2606 OID 425113)
-- Name: resource_certificate resource_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3933 (class 2606 OID 425118)
-- Name: resource_db resource_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3934 (class 2606 OID 425123)
-- Name: resource_device_aux_option resource_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3935 (class 2606 OID 425128)
-- Name: resource_device_aux_option resource_device_aux_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3931 (class 2606 OID 425133)
-- Name: resource resource_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3936 (class 2606 OID 425138)
-- Name: resource_docker_image resource_docker_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3937 (class 2606 OID 425143)
-- Name: resource_domain resource_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3938 (class 2606 OID 425148)
-- Name: resource_repository resource_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3940 (class 2606 OID 425153)
-- Name: user_group_link user_group_link_group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_group_link
    ADD CONSTRAINT user_group_link_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 3941 (class 2606 OID 425158)
-- Name: user_group_link user_group_link_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_group_link
    ADD CONSTRAINT user_group_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3939 (class 2606 OID 425163)
-- Name: user user_group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 3942 (class 2606 OID 425168)
-- Name: volume_backup volume_backup_artifact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume_backup
    ADD CONSTRAINT volume_backup_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.artifact(id);


--
-- TOC entry 3943 (class 2606 OID 425173)
-- Name: web_server web_server_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_server
    ADD CONSTRAINT web_server_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id) NOT VALID;


-- Completed on 2025-11-18 10:20:34

--
-- PostgreSQL database dump complete
--
