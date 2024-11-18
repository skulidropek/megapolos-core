--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1 (Debian 16.1-1.pgdg120+1)
-- Dumped by pg_dump version 16.0

-- Started on 2024-11-18 14:56:45

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 3933 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 896 (class 1247 OID 16390)
-- Name: image_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.image_status AS ENUM (
    'not_exist',
    'building',
    'built'
);


SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16397)
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
-- TOC entry 216 (class 1259 OID 16407)
-- Name: app_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 16413)
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
-- TOC entry 218 (class 1259 OID 16421)
-- Name: app_instance_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_instance_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_instance_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 261 (class 1259 OID 17233)
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
-- TOC entry 219 (class 1259 OID 16427)
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
-- TOC entry 220 (class 1259 OID 16436)
-- Name: container_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16442)
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
-- TOC entry 222 (class 1259 OID 16450)
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
-- TOC entry 223 (class 1259 OID 16458)
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
-- TOC entry 224 (class 1259 OID 16466)
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
-- TOC entry 225 (class 1259 OID 16475)
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
-- TOC entry 226 (class 1259 OID 16483)
-- Name: container_device_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_device_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16491)
-- Name: container_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_env_name character varying NOT NULL,
    container_env_value character varying NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 16498)
-- Name: container_resource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.container_resource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    container_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 16504)
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
-- TOC entry 230 (class 1259 OID 16512)
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
-- TOC entry 263 (class 1259 OID 17251)
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
-- TOC entry 264 (class 1259 OID 17266)
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
-- TOC entry 266 (class 1259 OID 17294)
-- Name: db_db_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.db_db_user (
    db_id uuid NOT NULL,
    db_user_id uuid NOT NULL
);


--
-- TOC entry 267 (class 1259 OID 17307)
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
-- TOC entry 265 (class 1259 OID 17280)
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
-- TOC entry 262 (class 1259 OID 17242)
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
-- TOC entry 231 (class 1259 OID 16520)
-- Name: deploy_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deploy_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 16526)
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
-- TOC entry 233 (class 1259 OID 16539)
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
-- TOC entry 234 (class 1259 OID 16548)
-- Name: device_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_option_name character varying NOT NULL,
    device_option_value character varying NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 16555)
-- Name: device_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 269 (class 1259 OID 17326)
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
-- TOC entry 236 (class 1259 OID 16561)
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
-- TOC entry 237 (class 1259 OID 16567)
-- Name: driver; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    app_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 16574)
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
-- TOC entry 239 (class 1259 OID 16582)
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
-- TOC entry 240 (class 1259 OID 16594)
-- Name: image_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_device (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 16600)
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
-- TOC entry 242 (class 1259 OID 16608)
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
-- TOC entry 243 (class 1259 OID 16616)
-- Name: image_env_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_env_option (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_env_name character varying NOT NULL,
    image_env_value character varying NOT NULL
);


--
-- TOC entry 244 (class 1259 OID 16623)
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
-- TOC entry 245 (class 1259 OID 16630)
-- Name: image_resource_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_resource_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_type character varying NOT NULL,
    resource_kind character varying NOT NULL
);


--
-- TOC entry 246 (class 1259 OID 16637)
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
-- TOC entry 247 (class 1259 OID 16644)
-- Name: image_volume_requirement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_volume_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    inner_path character varying NOT NULL
);


--
-- TOC entry 248 (class 1259 OID 16651)
-- Name: instance_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.instance_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 268 (class 1259 OID 17316)
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
-- TOC entry 249 (class 1259 OID 16657)
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
-- TOC entry 250 (class 1259 OID 16666)
-- Name: remove_strategy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.remove_strategy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 251 (class 1259 OID 16672)
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
-- TOC entry 252 (class 1259 OID 16678)
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
-- TOC entry 253 (class 1259 OID 16685)
-- Name: resource_certificate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_certificate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    private_key_path character varying NOT NULL,
    public_key_path character varying NOT NULL
);


--
-- TOC entry 254 (class 1259 OID 16691)
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
-- TOC entry 255 (class 1259 OID 16697)
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
-- TOC entry 256 (class 1259 OID 16705)
-- Name: resource_docker_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_docker_image (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image character varying NOT NULL,
    tag character varying NOT NULL,
    docker_id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 257 (class 1259 OID 16712)
-- Name: resource_domain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_domain (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain character varying NOT NULL,
    is_ssl integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 258 (class 1259 OID 16719)
-- Name: resource_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_repository (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    repository character varying NOT NULL
);


--
-- TOC entry 259 (class 1259 OID 16725)
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
-- TOC entry 260 (class 1259 OID 16735)
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
-- TOC entry 271 (class 1259 OID 17358)
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
-- TOC entry 270 (class 1259 OID 17339)
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
-- TOC entry 3584 (class 2606 OID 16745)
-- Name: app_device app_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3590 (class 2606 OID 16747)
-- Name: app_instance_device app_instance_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3586 (class 2606 OID 16749)
-- Name: app_instance app_instance_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_name_key UNIQUE (name);


--
-- TOC entry 3588 (class 2606 OID 16751)
-- Name: app_instance app_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_pkey PRIMARY KEY (id);


--
-- TOC entry 3580 (class 2606 OID 16753)
-- Name: app app_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_name_key UNIQUE (name);


--
-- TOC entry 3582 (class 2606 OID 16755)
-- Name: app app_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_pkey PRIMARY KEY (id);


--
-- TOC entry 3694 (class 2606 OID 17241)
-- Name: artifact artifact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifact
    ADD CONSTRAINT artifact_pkey PRIMARY KEY (id);


--
-- TOC entry 3598 (class 2606 OID 16757)
-- Name: container_device_aux_option container_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3600 (class 2606 OID 16759)
-- Name: container_device_certificate container_device_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_pkey PRIMARY KEY (id);


--
-- TOC entry 3602 (class 2606 OID 16761)
-- Name: container_device_db container_device_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3604 (class 2606 OID 16763)
-- Name: container_device_domain container_device_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3606 (class 2606 OID 16765)
-- Name: container_device_env_option container_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3596 (class 2606 OID 16767)
-- Name: container_device container_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3608 (class 2606 OID 16769)
-- Name: container_device_repository container_device_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3610 (class 2606 OID 16771)
-- Name: container_env_option container_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3592 (class 2606 OID 16773)
-- Name: container container_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_name_key UNIQUE (name);


--
-- TOC entry 3594 (class 2606 OID 16775)
-- Name: container container_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_pkey PRIMARY KEY (id);


--
-- TOC entry 3614 (class 2606 OID 16777)
-- Name: container_resource_env_option container_resource_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3612 (class 2606 OID 16779)
-- Name: container_resource container_resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_pkey PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 16781)
-- Name: container_volume container_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3700 (class 2606 OID 17274)
-- Name: db_backup db_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3704 (class 2606 OID 17352)
-- Name: db_db_user db_db_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_pkey PRIMARY KEY (db_id, db_user_id);


--
-- TOC entry 3698 (class 2606 OID 17260)
-- Name: db db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_pkey PRIMARY KEY (id);


--
-- TOC entry 3706 (class 2606 OID 17315)
-- Name: db_schema db_schema_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_schema
    ADD CONSTRAINT db_schema_pkey PRIMARY KEY (id);


--
-- TOC entry 3702 (class 2606 OID 17288)
-- Name: db_user db_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3696 (class 2606 OID 17250)
-- Name: dbms dbms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dbms
    ADD CONSTRAINT dbms_pkey PRIMARY KEY (id);


--
-- TOC entry 3618 (class 2606 OID 16783)
-- Name: deploy_strategy deploy_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_name_key UNIQUE (name);


--
-- TOC entry 3620 (class 2606 OID 16785)
-- Name: deploy_strategy deploy_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deploy_strategy
    ADD CONSTRAINT deploy_strategy_pkey PRIMARY KEY (id);


--
-- TOC entry 3626 (class 2606 OID 16787)
-- Name: device_backup device_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3622 (class 2606 OID 16789)
-- Name: device device_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_name_key UNIQUE (name);


--
-- TOC entry 3628 (class 2606 OID 16791)
-- Name: device_option device_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3624 (class 2606 OID 16793)
-- Name: device device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);


--
-- TOC entry 3630 (class 2606 OID 16795)
-- Name: device_type device_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_name_key UNIQUE (name);


--
-- TOC entry 3632 (class 2606 OID 16797)
-- Name: device_type device_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_type
    ADD CONSTRAINT device_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3634 (class 2606 OID 16799)
-- Name: domain domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain
    ADD CONSTRAINT domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3636 (class 2606 OID 16801)
-- Name: driver driver_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_name_key UNIQUE (name);


--
-- TOC entry 3638 (class 2606 OID 16803)
-- Name: driver driver_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_pkey PRIMARY KEY (id);


--
-- TOC entry 3640 (class 2606 OID 16805)
-- Name: group_user group_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3648 (class 2606 OID 16807)
-- Name: image_device_aux_option image_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3650 (class 2606 OID 16809)
-- Name: image_device_env_option image_device_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3646 (class 2606 OID 16811)
-- Name: image_device image_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3652 (class 2606 OID 16813)
-- Name: image_env_option image_env_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3654 (class 2606 OID 16815)
-- Name: image_env_requirement image_env_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3642 (class 2606 OID 16817)
-- Name: image image_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_name_key UNIQUE (name);


--
-- TOC entry 3644 (class 2606 OID 16819)
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- TOC entry 3656 (class 2606 OID 16821)
-- Name: image_resource_requirement image_resource_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3658 (class 2606 OID 16823)
-- Name: image_volume image_volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3660 (class 2606 OID 16825)
-- Name: image_volume_requirement image_volume_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_pkey PRIMARY KEY (id);


--
-- TOC entry 3662 (class 2606 OID 16827)
-- Name: instance_type instance_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_name_key UNIQUE (name);


--
-- TOC entry 3664 (class 2606 OID 16829)
-- Name: instance_type instance_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.instance_type
    ADD CONSTRAINT instance_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3708 (class 2606 OID 17325)
-- Name: log log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.log
    ADD CONSTRAINT log_pkey PRIMARY KEY (id);


--
-- TOC entry 3666 (class 2606 OID 16831)
-- Name: node node_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_name_key UNIQUE (name);


--
-- TOC entry 3668 (class 2606 OID 16833)
-- Name: node node_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.node
    ADD CONSTRAINT node_pkey PRIMARY KEY (id);


--
-- TOC entry 3670 (class 2606 OID 16835)
-- Name: remove_strategy remove_strategy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_name_key UNIQUE (name);


--
-- TOC entry 3672 (class 2606 OID 16837)
-- Name: remove_strategy remove_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remove_strategy
    ADD CONSTRAINT remove_strategy_pkey PRIMARY KEY (id);


--
-- TOC entry 3674 (class 2606 OID 16839)
-- Name: repository repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repository
    ADD CONSTRAINT repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3678 (class 2606 OID 16841)
-- Name: resource_certificate resource_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_pkey PRIMARY KEY (id);


--
-- TOC entry 3680 (class 2606 OID 16843)
-- Name: resource_db resource_db_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_pkey PRIMARY KEY (id);


--
-- TOC entry 3682 (class 2606 OID 16845)
-- Name: resource_device_aux_option resource_device_aux_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3684 (class 2606 OID 16847)
-- Name: resource_docker_image resource_docker_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_pkey PRIMARY KEY (id);


--
-- TOC entry 3686 (class 2606 OID 16849)
-- Name: resource_domain resource_domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_pkey PRIMARY KEY (id);


--
-- TOC entry 3676 (class 2606 OID 16851)
-- Name: resource resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_pkey PRIMARY KEY (id);


--
-- TOC entry 3688 (class 2606 OID 16853)
-- Name: resource_repository resource_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_pkey PRIMARY KEY (id);


--
-- TOC entry 3690 (class 2606 OID 16855)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 3710 (class 2606 OID 17366)
-- Name: volume_backup volume_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume_backup
    ADD CONSTRAINT volume_backup_pkey PRIMARY KEY (id);


--
-- TOC entry 3692 (class 2606 OID 16857)
-- Name: volume volume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume
    ADD CONSTRAINT volume_pkey PRIMARY KEY (id);


--
-- TOC entry 3712 (class 2606 OID 16858)
-- Name: app_device app_device_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3713 (class 2606 OID 16863)
-- Name: app_device app_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_device
    ADD CONSTRAINT app_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3714 (class 2606 OID 16868)
-- Name: app_instance app_instance_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3715 (class 2606 OID 16873)
-- Name: app_instance app_instance_deploy_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_deploy_strategy_id_fkey FOREIGN KEY (deploy_strategy_id) REFERENCES public.deploy_strategy(id);


--
-- TOC entry 3719 (class 2606 OID 16878)
-- Name: app_instance_device app_instance_device_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- TOC entry 3720 (class 2606 OID 16883)
-- Name: app_instance_device app_instance_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance_device
    ADD CONSTRAINT app_instance_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3716 (class 2606 OID 16888)
-- Name: app_instance app_instance_instance_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_instance_type_id_fkey FOREIGN KEY (instance_type_id) REFERENCES public.instance_type(id);


--
-- TOC entry 3717 (class 2606 OID 16893)
-- Name: app_instance app_instance_remove_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_remove_strategy_id_fkey FOREIGN KEY (remove_strategy_id) REFERENCES public.remove_strategy(id);


--
-- TOC entry 3718 (class 2606 OID 16898)
-- Name: app_instance app_instance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_instance
    ADD CONSTRAINT app_instance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 3711 (class 2606 OID 16903)
-- Name: app app_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public."user"(id);


--
-- TOC entry 3721 (class 2606 OID 16908)
-- Name: container container_app_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_app_instance_id_fkey FOREIGN KEY (app_instance_id) REFERENCES public.app_instance(id);


--
-- TOC entry 3727 (class 2606 OID 16913)
-- Name: container_device_aux_option container_device_aux_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3728 (class 2606 OID 16918)
-- Name: container_device_aux_option container_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_aux_option
    ADD CONSTRAINT container_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3729 (class 2606 OID 16923)
-- Name: container_device_certificate container_device_certificate_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3730 (class 2606 OID 16928)
-- Name: container_device_certificate container_device_certificate_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_certificate
    ADD CONSTRAINT container_device_certificate_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3725 (class 2606 OID 16933)
-- Name: container_device container_device_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3731 (class 2606 OID 16938)
-- Name: container_device_db container_device_db_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3732 (class 2606 OID 16943)
-- Name: container_device_db container_device_db_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_db
    ADD CONSTRAINT container_device_db_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3726 (class 2606 OID 16948)
-- Name: container_device container_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device
    ADD CONSTRAINT container_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3733 (class 2606 OID 16953)
-- Name: container_device_domain container_device_domain_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3734 (class 2606 OID 16958)
-- Name: container_device_domain container_device_domain_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_domain
    ADD CONSTRAINT container_device_domain_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3735 (class 2606 OID 16963)
-- Name: container_device_env_option container_device_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3736 (class 2606 OID 16968)
-- Name: container_device_env_option container_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_env_option
    ADD CONSTRAINT container_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3737 (class 2606 OID 16973)
-- Name: container_device_repository container_device_repository_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3738 (class 2606 OID 16978)
-- Name: container_device_repository container_device_repository_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_device_repository
    ADD CONSTRAINT container_device_repository_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3722 (class 2606 OID 16983)
-- Name: container container_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domain(id) NOT VALID;


--
-- TOC entry 3739 (class 2606 OID 16988)
-- Name: container_env_option container_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_env_option
    ADD CONSTRAINT container_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3723 (class 2606 OID 16993)
-- Name: container container_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3724 (class 2606 OID 16998)
-- Name: container container_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container
    ADD CONSTRAINT container_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- TOC entry 3740 (class 2606 OID 17003)
-- Name: container_resource container_resource_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3742 (class 2606 OID 17008)
-- Name: container_resource_env_option container_resource_env_option_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3743 (class 2606 OID 17013)
-- Name: container_resource_env_option container_resource_env_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource_env_option
    ADD CONSTRAINT container_resource_env_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3741 (class 2606 OID 17018)
-- Name: container_resource container_resource_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_resource
    ADD CONSTRAINT container_resource_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3744 (class 2606 OID 17023)
-- Name: container_volume container_volume_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3745 (class 2606 OID 17028)
-- Name: container_volume container_volume_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.container_volume
    ADD CONSTRAINT container_volume_volume_id_fkey FOREIGN KEY (volume_id) REFERENCES public.volume(id);


--
-- TOC entry 3778 (class 2606 OID 17275)
-- Name: db_backup db_backup_artifact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_backup
    ADD CONSTRAINT db_backup_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.artifact(id);


--
-- TOC entry 3780 (class 2606 OID 17297)
-- Name: db_db_user db_db_user_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_id_fkey FOREIGN KEY (db_id) REFERENCES public.db(id);


--
-- TOC entry 3781 (class 2606 OID 17302)
-- Name: db_db_user db_db_user_db_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_db_user
    ADD CONSTRAINT db_db_user_db_user_id_fkey FOREIGN KEY (db_user_id) REFERENCES public.db_user(id);


--
-- TOC entry 3777 (class 2606 OID 17261)
-- Name: db db_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db
    ADD CONSTRAINT db_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id);


--
-- TOC entry 3779 (class 2606 OID 17289)
-- Name: db_user db_user_dbms_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.db_user
    ADD CONSTRAINT db_user_dbms_id_fkey FOREIGN KEY (dbms_id) REFERENCES public.dbms(id);


--
-- TOC entry 3750 (class 2606 OID 17033)
-- Name: device_backup device_backup_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3751 (class 2606 OID 17038)
-- Name: device_backup device_backup_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3752 (class 2606 OID 17043)
-- Name: device_backup device_backup_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_backup
    ADD CONSTRAINT device_backup_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3746 (class 2606 OID 17048)
-- Name: device device_backup_volume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_backup_volume_id_fkey FOREIGN KEY (backup_volume_id) REFERENCES public.volume(id);


--
-- TOC entry 3747 (class 2606 OID 17053)
-- Name: device device_device_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_device_type_id_fkey FOREIGN KEY (device_type_id) REFERENCES public.device_type(id);


--
-- TOC entry 3748 (class 2606 OID 17058)
-- Name: device device_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.driver(id);


--
-- TOC entry 3749 (class 2606 OID 17063)
-- Name: device device_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_node_id_fkey FOREIGN KEY (node_id) REFERENCES public.node(id);


--
-- TOC entry 3753 (class 2606 OID 17068)
-- Name: device_option device_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_option
    ADD CONSTRAINT device_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3782 (class 2606 OID 17334)
-- Name: docker_registry docker_registry_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.docker_registry
    ADD CONSTRAINT docker_registry_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


--
-- TOC entry 3754 (class 2606 OID 17073)
-- Name: driver driver_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver
    ADD CONSTRAINT driver_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3755 (class 2606 OID 17078)
-- Name: image image_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id);


--
-- TOC entry 3759 (class 2606 OID 17083)
-- Name: image_device_aux_option image_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3760 (class 2606 OID 17088)
-- Name: image_device_aux_option image_device_aux_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_aux_option
    ADD CONSTRAINT image_device_aux_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3757 (class 2606 OID 17093)
-- Name: image_device image_device_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3761 (class 2606 OID 17098)
-- Name: image_device_env_option image_device_env_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3762 (class 2606 OID 17103)
-- Name: image_device_env_option image_device_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device_env_option
    ADD CONSTRAINT image_device_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3758 (class 2606 OID 17108)
-- Name: image_device image_device_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_device
    ADD CONSTRAINT image_device_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3763 (class 2606 OID 17113)
-- Name: image_env_option image_env_option_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_option
    ADD CONSTRAINT image_env_option_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3764 (class 2606 OID 17118)
-- Name: image_env_requirement image_env_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_env_requirement
    ADD CONSTRAINT image_env_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3756 (class 2606 OID 17123)
-- Name: image image_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repository(id) NOT VALID;


--
-- TOC entry 3765 (class 2606 OID 17128)
-- Name: image_resource_requirement image_resource_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_resource_requirement
    ADD CONSTRAINT image_resource_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3766 (class 2606 OID 17133)
-- Name: image_volume image_volume_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume
    ADD CONSTRAINT image_volume_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3767 (class 2606 OID 17138)
-- Name: image_volume_requirement image_volume_requirement_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_volume_requirement
    ADD CONSTRAINT image_volume_requirement_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id);


--
-- TOC entry 3769 (class 2606 OID 17143)
-- Name: resource_certificate resource_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_certificate
    ADD CONSTRAINT resource_certificate_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3770 (class 2606 OID 17148)
-- Name: resource_db resource_db_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_db
    ADD CONSTRAINT resource_db_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3771 (class 2606 OID 17153)
-- Name: resource_device_aux_option resource_device_aux_option_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3772 (class 2606 OID 17158)
-- Name: resource_device_aux_option resource_device_aux_option_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_device_aux_option
    ADD CONSTRAINT resource_device_aux_option_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resource(id);


--
-- TOC entry 3768 (class 2606 OID 17163)
-- Name: resource resource_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.device(id);


--
-- TOC entry 3773 (class 2606 OID 17168)
-- Name: resource_docker_image resource_docker_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_docker_image
    ADD CONSTRAINT resource_docker_image_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3774 (class 2606 OID 17173)
-- Name: resource_domain resource_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_domain
    ADD CONSTRAINT resource_domain_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3775 (class 2606 OID 17178)
-- Name: resource_repository resource_repository_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_repository
    ADD CONSTRAINT resource_repository_id_fkey FOREIGN KEY (id) REFERENCES public.resource(id);


--
-- TOC entry 3776 (class 2606 OID 17183)
-- Name: user user_group_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_group_user_id_fkey FOREIGN KEY (group_user_id) REFERENCES public.group_user(id);


--
-- TOC entry 3784 (class 2606 OID 17367)
-- Name: volume_backup volume_backup_artifact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.volume_backup
    ADD CONSTRAINT volume_backup_artifact_id_fkey FOREIGN KEY (artifact_id) REFERENCES public.artifact(id);


--
-- TOC entry 3783 (class 2606 OID 17346)
-- Name: web_server web_server_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_server
    ADD CONSTRAINT web_server_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.container(id);


-- Completed on 2024-11-18 14:56:45

--
-- PostgreSQL database dump complete
--

