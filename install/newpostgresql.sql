--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1 (Debian 16.1-1.pgdg120+1)
-- Dumped by pg_dump version 16.0

-- Started on 2025-03-14 08:56:11

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

--
-- TOC entry 5 (class 2615 OID 60424)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 903 (class 1247 OID 81925)
-- Name: image_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.image_status AS ENUM (
    'not_exist',
    'building',
    'built'
);


SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 60486)
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
-- TOC entry 230 (class 1259 OID 60697)
-- Name: app_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 60556)
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
-- TOC entry 231 (class 1259 OID 60715)
-- Name: app_instance_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_instance_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_instance_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 266 (class 1259 OID 106722)
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
-- TOC entry 226 (class 1259 OID 60598)
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
-- TOC entry 274 (class 1259 OID 221202)
-- Name: container_db; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_db (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    db_id uuid NOT NULL,
    db_user_id uuid NOT NULL,
    container_id uuid NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    update_date timestamp without time zone,
    name character varying NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 60733)
-- Name: container_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 250 (class 1259 OID 61037)
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
-- TOC entry 240 (class 1259 OID 60864)
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
-- TOC entry 242 (class 1259 OID 60897)
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
-- TOC entry 238 (class 1259 OID 60829)
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
-- TOC entry 247 (class 1259 OID 60977)
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
-- TOC entry 244 (class 1259 OID 60930)
-- Name: container_device_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- TOC entry 255 (class 1259 OID 61131)
-- Name: container_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_env_name character varying NOT NULL,
    container_env_value character varying NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 60751)
-- Name: container_resource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_resource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 248 (class 1259 OID 60997)
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
-- TOC entry 273 (class 1259 OID 213018)
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
-- TOC entry 253 (class 1259 OID 61097)
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
-- TOC entry 262 (class 1259 OID 106665)
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
-- TOC entry 265 (class 1259 OID 106713)
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
-- TOC entry 264 (class 1259 OID 106693)
-- Name: db_db_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db_db_user (
    db_id uuid NOT NULL,
    db_user_id uuid NOT NULL
);


--
-- TOC entry 268 (class 1259 OID 106745)
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
-- TOC entry 263 (class 1259 OID 106674)
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
-- TOC entry 261 (class 1259 OID 106656)
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
-- TOC entry 222 (class 1259 OID 60526)
-- Name: deploy_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deploy_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 60646)
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
-- TOC entry 258 (class 1259 OID 61173)
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
-- TOC entry 257 (class 1259 OID 61159)
-- Name: device_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_option_name character varying NOT NULL,
    device_option_value character varying NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 60436)
-- Name: device_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 269 (class 1259 OID 131091)
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
-- TOC entry 260 (class 1259 OID 81932)
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
-- TOC entry 227 (class 1259 OID 60630)
-- Name: driver; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 60459)
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


CREATE TABLE public.group_user_privilege (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_user_id uuid NOT NULL,
    object_name character varying NOT NULL,
    object_id character varying NOT NULL,
    action character varying NOT NULL
);

ALTER TABLE ONLY public.group_user_privilege
    ADD CONSTRAINT group_user_privilege_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 221 (class 1259 OID 60505)
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
-- TOC entry 275 (class 1259 OID 221226)
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
-- TOC entry 234 (class 1259 OID 60769)
-- Name: image_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 251 (class 1259 OID 61057)
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
-- TOC entry 249 (class 1259 OID 61017)
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
-- TOC entry 256 (class 1259 OID 61145)
-- Name: image_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_env_name character varying NOT NULL,
    image_env_value character varying NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 60815)
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
-- TOC entry 235 (class 1259 OID 60787)
-- Name: image_resource_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_resource_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_type character varying NOT NULL,
    resource_kind character varying NOT NULL
);


--
-- TOC entry 272 (class 1259 OID 213004)
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
-- TOC entry 254 (class 1259 OID 61117)
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
-- TOC entry 236 (class 1259 OID 60801)
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
-- TOC entry 223 (class 1259 OID 60536)
-- Name: instance_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instance_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 267 (class 1259 OID 106736)
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
    type character varying
);


--
-- TOC entry 217 (class 1259 OID 60446)
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
-- TOC entry 224 (class 1259 OID 60546)
-- Name: remove_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.remove_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 259 (class 1259 OID 73732)
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
    title character varying
);


--
-- TOC entry 229 (class 1259 OID 60683)
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
-- TOC entry 241 (class 1259 OID 60884)
-- Name: resource_certificate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_certificate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    private_key_path character varying NOT NULL,
    public_key_path character varying NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 60917)
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
-- TOC entry 252 (class 1259 OID 61077)
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
-- TOC entry 246 (class 1259 OID 60963)
-- Name: resource_docker_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_docker_image (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image character varying NOT NULL,
    tag character varying NOT NULL,
    docker_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 60850)
-- Name: resource_domain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_domain (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    is_ssl integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 245 (class 1259 OID 60950)
-- Name: resource_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 60469)
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


create table public.user_group_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    group_user_id uuid NOT NULL,
);


ALTER TABLE ONLY public.user_group_link
    ADD CONSTRAINT user_group_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);

ALTER TABLE ONLY public.user_group_link 
    ADD CONSTRAINT user_group_link_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 215 (class 1259 OID 60425)
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
-- TOC entry 271 (class 1259 OID 157568)
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
-- TOC entry 270 (class 1259 OID 131098)
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
-- TOC entry 3656 (class 2606 OID 60704)
-- Name: app_device app_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3658 (class 2606 OID 60722)
-- Name: app_instance_device app_instance_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3638 (class 2606 OID 60572)
-- Name: app_instance app_instance_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_name_key UNIQUE (name);


--
-- TOC entry 3640 (class 2606 OID 60570)
-- Name: app_instance app_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_pkey PRIMARY KEY (id);


--
-- TOC entry 3618 (class 2606 OID 60499)
-- Name: app app_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_name_key UNIQUE (name);


--
-- TOC entry 3620 (class 2606 OID 60497)
-- Name: app app_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_pkey PRIMARY KEY (id);


--
-- TOC entry 3728 (class 2606 OID 106730)
-- Name: artifact artifact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifact
    ADD CONSTRAINT artifact_pkey PRIMARY KEY (id);


--
-- TOC entry 3740 (class 2606 OID 221208)
-- Name: container_db container_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3696 (class 2606 OID 61046)
-- Name: container_device_aux_option container_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3676 (class 2606 OID 60873)
-- Name: container_device_certificate container_device_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_pkey PRIMARY KEY (id);


--
-- TOC entry 3680 (class 2606 OID 60906)
-- Name: container_device_db container_device_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3672 (class 2606 OID 60839)
-- Name: container_device_domain container_device_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3690 (class 2606 OID 60986)
-- Name: container_device_env_option container_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3660 (class 2606 OID 60740)
-- Name: container_device container_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3684 (class 2606 OID 60939)
-- Name: container_device_repository container_device_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3706 (class 2606 OID 61139)
-- Name: container_env_option container_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3642 (class 2606 OID 60614)
-- Name: container container_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_name_key UNIQUE (name);


--
-- TOC entry 3644 (class 2606 OID 60612)
-- Name: container container_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_pkey PRIMARY KEY (id);


--
-- TOC entry 3692 (class 2606 OID 61006)
-- Name: container_resource_env_option container_resource_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3662 (class 2606 OID 60758)
-- Name: container_resource container_resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 213026)
-- Name: container_variable container_variable_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_variable
    ADD CONSTRAINT container_variable_pkey PRIMARY KEY (id);


--
-- TOC entry 3702 (class 2606 OID 61106)
-- Name: container_volume container_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3726 (class 2606 OID 106721)
-- Name: db_backup db_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3724 (class 2606 OID 141019)
-- Name: db_db_user db_db_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_pkey PRIMARY KEY (db_id, db_user_id);


--
-- TOC entry 3720 (class 2606 OID 106673)
-- Name: db db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_pkey PRIMARY KEY (id);


--
-- TOC entry 3732 (class 2606 OID 106753)
-- Name: db_schema db_schema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_schema
    ADD CONSTRAINT db_schema_pkey PRIMARY KEY (id);


--
-- TOC entry 3722 (class 2606 OID 106682)
-- Name: db_user db_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3718 (class 2606 OID 106664)
-- Name: dbms dbms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dbms
    ADD CONSTRAINT dbms_pkey PRIMARY KEY (id);


--
-- TOC entry 3626 (class 2606 OID 60535)
-- Name: deploy_strategy deploy_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_name_key UNIQUE (name);


--
-- TOC entry 3628 (class 2606 OID 60533)
-- Name: deploy_strategy deploy_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_pkey PRIMARY KEY (id);


--
-- TOC entry 3712 (class 2606 OID 61183)
-- Name: device_backup device_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3650 (class 2606 OID 60662)
-- Name: device device_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_name_key UNIQUE (name);


--
-- TOC entry 3710 (class 2606 OID 61167)
-- Name: device_option device_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3652 (class 2606 OID 60660)
-- Name: device device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- TOC entry 3606 (class 2606 OID 60445)
-- Name: device_type device_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_name_key UNIQUE (name);


--
-- TOC entry 3608 (class 2606 OID 60443)
-- Name: device_type device_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3716 (class 2606 OID 81939)
-- Name: domain domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain
    ADD CONSTRAINT domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3646 (class 2606 OID 60640)
-- Name: driver driver_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_name_key UNIQUE (name);


--
-- TOC entry 3648 (class 2606 OID 60638)
-- Name: driver driver_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_pkey PRIMARY KEY (id);


--
-- TOC entry 3614 (class 2606 OID 60468)
-- Name: group_user group_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 221234)
-- Name: image_db_requirement image_db_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_db_requirement
    ADD CONSTRAINT image_db_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3698 (class 2606 OID 61066)
-- Name: image_device_aux_option image_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3694 (class 2606 OID 61026)
-- Name: image_device_env_option image_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3664 (class 2606 OID 60776)
-- Name: image_device image_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3708 (class 2606 OID 61153)
-- Name: image_env_option image_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3670 (class 2606 OID 60823)
-- Name: image_env_requirement image_env_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3622 (class 2606 OID 60520)
-- Name: image image_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_name_key UNIQUE (name);


--
-- TOC entry 3624 (class 2606 OID 60518)
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- TOC entry 3666 (class 2606 OID 60795)
-- Name: image_resource_requirement image_resource_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3736 (class 2606 OID 213012)
-- Name: image_variable_requirement image_variable_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_variable_requirement
    ADD CONSTRAINT image_variable_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3704 (class 2606 OID 61125)
-- Name: image_volume image_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3668 (class 2606 OID 60809)
-- Name: image_volume_requirement image_volume_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3630 (class 2606 OID 60545)
-- Name: instance_type instance_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_name_key UNIQUE (name);


--
-- TOC entry 3632 (class 2606 OID 60543)
-- Name: instance_type instance_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3730 (class 2606 OID 106744)
-- Name: log log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log
    ADD CONSTRAINT log_pkey PRIMARY KEY (id);


--
-- TOC entry 3610 (class 2606 OID 60458)
-- Name: node node_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_name_key UNIQUE (name);


--
-- TOC entry 3612 (class 2606 OID 60456)
-- Name: node node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_pkey PRIMARY KEY (id);


--
-- TOC entry 3634 (class 2606 OID 60555)
-- Name: remove_strategy remove_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_name_key UNIQUE (name);


--
-- TOC entry 3636 (class 2606 OID 60553)
-- Name: remove_strategy remove_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_pkey PRIMARY KEY (id);


--
-- TOC entry 3714 (class 2606 OID 73738)
-- Name: repository repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repository
    ADD CONSTRAINT repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3678 (class 2606 OID 60891)
-- Name: resource_certificate resource_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_pkey PRIMARY KEY (id);


--
-- TOC entry 3682 (class 2606 OID 60924)
-- Name: resource_db resource_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3700 (class 2606 OID 61086)
-- Name: resource_device_aux_option resource_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3688 (class 2606 OID 60971)
-- Name: resource_docker_image resource_docker_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_pkey PRIMARY KEY (id);


--
-- TOC entry 3674 (class 2606 OID 60858)
-- Name: resource_domain resource_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3654 (class 2606 OID 60691)
-- Name: resource resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_pkey PRIMARY KEY (id);


--
-- TOC entry 3686 (class 2606 OID 60957)
-- Name: resource_repository resource_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 60480)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 3734 (class 2606 OID 157576)
-- Name: volume_backup volume_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume_backup
    ADD CONSTRAINT volume_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3604 (class 2606 OID 60435)
-- Name: volume volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume
    ADD CONSTRAINT volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3762 (class 2606 OID 60705)
-- Name: app_device app_device_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3763 (class 2606 OID 60710)
-- Name: app_device app_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3747 (class 2606 OID 60583)
-- Name: app_instance app_instance_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3748 (class 2606 OID 60573)
-- Name: app_instance app_instance_deploy_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_deploy_strategy_id_fkey FOREIGN KEY (deploy_strategy_id) REFERENCES public.deploy_strategy(id);


--
-- TOC entry 3764 (class 2606 OID 60723)
-- Name: app_instance_device app_instance_device_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- TOC entry 3765 (class 2606 OID 60728)
-- Name: app_instance_device app_instance_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3749 (class 2606 OID 60588)
-- Name: app_instance app_instance_instance_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_instance_type_id_fkey FOREIGN KEY (instance_type_id) REFERENCES public.instance_type(id);


--
-- TOC entry 3750 (class 2606 OID 60578)
-- Name: app_instance app_instance_remove_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_remove_strategy_id_fkey FOREIGN KEY (remove_strategy_id) REFERENCES public.remove_strategy(id);


--
-- TOC entry 3751 (class 2606 OID 60593)
-- Name: app_instance app_instance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3744 (class 2606 OID 60500)
-- Name: app app_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public."user"(id);


--
-- TOC entry 3752 (class 2606 OID 60625)
-- Name: container container_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- TOC entry 3820 (class 2606 OID 221219)
-- Name: container_db container_db_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3821 (class 2606 OID 221209)
-- Name: container_db container_db_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_db_id_fkey FOREIGN KEY (db_id) REFERENCES public.db(id);


--
-- TOC entry 3822 (class 2606 OID 221214)
-- Name: container_db container_db_db_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_db
    ADD CONSTRAINT container_db_db_user_id_fkey FOREIGN KEY (db_user_id) REFERENCES public.db_user(id);


--
-- TOC entry 3794 (class 2606 OID 61052)
-- Name: container_device_aux_option container_device_aux_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3795 (class 2606 OID 61047)
-- Name: container_device_aux_option container_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3778 (class 2606 OID 60874)
-- Name: container_device_certificate container_device_certificate_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3779 (class 2606 OID 60879)
-- Name: container_device_certificate container_device_certificate_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3766 (class 2606 OID 60746)
-- Name: container_device container_device_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3781 (class 2606 OID 60912)
-- Name: container_device_db container_device_db_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3782 (class 2606 OID 60907)
-- Name: container_device_db container_device_db_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3767 (class 2606 OID 60741)
-- Name: container_device container_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3775 (class 2606 OID 60845)
-- Name: container_device_domain container_device_domain_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3776 (class 2606 OID 60840)
-- Name: container_device_domain container_device_domain_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3788 (class 2606 OID 60992)
-- Name: container_device_env_option container_device_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3789 (class 2606 OID 60987)
-- Name: container_device_env_option container_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3784 (class 2606 OID 60945)
-- Name: container_device_repository container_device_repository_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3785 (class 2606 OID 60940)
-- Name: container_device_repository container_device_repository_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3753 (class 2606 OID 81940)
-- Name: container container_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domain(id) NOT VALID;


--
-- TOC entry 3803 (class 2606 OID 61140)
-- Name: container_env_option container_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3754 (class 2606 OID 60620)
-- Name: container container_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3755 (class 2606 OID 60615)
-- Name: container container_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- TOC entry 3768 (class 2606 OID 60759)
-- Name: container_resource container_resource_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3790 (class 2606 OID 61012)
-- Name: container_resource_env_option container_resource_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3791 (class 2606 OID 61007)
-- Name: container_resource_env_option container_resource_env_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3769 (class 2606 OID 60764)
-- Name: container_resource container_resource_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3819 (class 2606 OID 213027)
-- Name: container_variable container_variable_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_variable
    ADD CONSTRAINT container_variable_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3800 (class 2606 OID 61112)
-- Name: container_volume container_volume_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3801 (class 2606 OID 61107)
-- Name: container_volume container_volume_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_volume_id_fkey FOREIGN KEY (volume_id) REFERENCES public.volume(id);


--
-- TOC entry 3814 (class 2606 OID 106731)
-- Name: db_backup db_backup_artifact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.artifact(id) NOT VALID;


--
-- TOC entry 3812 (class 2606 OID 106696)
-- Name: db_db_user db_db_user_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_id_fkey FOREIGN KEY (db_id) REFERENCES public.db(id);


--
-- TOC entry 3813 (class 2606 OID 106701)
-- Name: db_db_user db_db_user_db_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_user_id_fkey FOREIGN KEY (db_user_id) REFERENCES public.db_user(id);


--
-- TOC entry 3810 (class 2606 OID 108247)
-- Name: db db_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id) NOT VALID;


--
-- TOC entry 3811 (class 2606 OID 106688)
-- Name: db_user db_user_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id) NOT VALID;


--
-- TOC entry 3806 (class 2606 OID 61194)
-- Name: device_backup device_backup_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3807 (class 2606 OID 61184)
-- Name: device_backup device_backup_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3808 (class 2606 OID 61189)
-- Name: device_backup device_backup_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3757 (class 2606 OID 60678)
-- Name: device device_backup_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_backup_volume_id_fkey FOREIGN KEY (backup_volume_id) REFERENCES public.volume(id);


--
-- TOC entry 3758 (class 2606 OID 60668)
-- Name: device device_device_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_device_type_id_fkey FOREIGN KEY (device_type_id) REFERENCES public.device_type(id);


--
-- TOC entry 3759 (class 2606 OID 60673)
-- Name: device device_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.driver(id);


--
-- TOC entry 3760 (class 2606 OID 60663)
-- Name: device device_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- TOC entry 3805 (class 2606 OID 61168)
-- Name: device_option device_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3815 (class 2606 OID 131106)
-- Name: docker_registry docker_registry_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docker_registry
    ADD CONSTRAINT docker_registry_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id) NOT VALID;


--
-- TOC entry 3756 (class 2606 OID 60641)
-- Name: driver driver_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3745 (class 2606 OID 60521)
-- Name: image image_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3823 (class 2606 OID 221235)
-- Name: image_db_requirement image_db_requirement_db_backup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_db_requirement
    ADD CONSTRAINT image_db_requirement_db_backup_id_fkey FOREIGN KEY (db_backup_id) REFERENCES public.db_backup(id);


--
-- TOC entry 3796 (class 2606 OID 61072)
-- Name: image_device_aux_option image_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3797 (class 2606 OID 61067)
-- Name: image_device_aux_option image_device_aux_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3770 (class 2606 OID 60777)
-- Name: image_device image_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3792 (class 2606 OID 61027)
-- Name: image_device_env_option image_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3793 (class 2606 OID 61032)
-- Name: image_device_env_option image_device_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3771 (class 2606 OID 60782)
-- Name: image_device image_device_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3804 (class 2606 OID 61154)
-- Name: image_env_option image_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3774 (class 2606 OID 60824)
-- Name: image_env_requirement image_env_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3746 (class 2606 OID 73739)
-- Name: image image_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repository(id) NOT VALID;


--
-- TOC entry 3772 (class 2606 OID 60796)
-- Name: image_resource_requirement image_resource_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3818 (class 2606 OID 213013)
-- Name: image_variable_requirement image_variable_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_variable_requirement
    ADD CONSTRAINT image_variable_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3802 (class 2606 OID 61126)
-- Name: image_volume image_volume_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3773 (class 2606 OID 60810)
-- Name: image_volume_requirement image_volume_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3809 (class 2606 OID 221197)
-- Name: repository repository_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repository
    ADD CONSTRAINT repository_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id) NOT VALID;


--
-- TOC entry 3780 (class 2606 OID 60892)
-- Name: resource_certificate resource_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3783 (class 2606 OID 60925)
-- Name: resource_db resource_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3798 (class 2606 OID 61092)
-- Name: resource_device_aux_option resource_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3799 (class 2606 OID 61087)
-- Name: resource_device_aux_option resource_device_aux_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3761 (class 2606 OID 60692)
-- Name: resource resource_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3787 (class 2606 OID 60972)
-- Name: resource_docker_image resource_docker_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3777 (class 2606 OID 60859)
-- Name: resource_domain resource_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3786 (class 2606 OID 60958)
-- Name: resource_repository resource_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3743 (class 2606 OID 60481)
-- Name: user user_group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 3817 (class 2606 OID 157577)
-- Name: volume_backup volume_backup_artifact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume_backup
    ADD CONSTRAINT volume_backup_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.artifact(id);


--
-- TOC entry 3816 (class 2606 OID 131111)
-- Name: web_server web_server_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_server
    ADD CONSTRAINT web_server_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id) NOT VALID;


-- Completed on 2025-03-14 08:56:12

--
-- PostgreSQL database dump complete
--

