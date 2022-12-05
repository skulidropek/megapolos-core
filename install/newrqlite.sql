-- user group
-- rest_api [command_uri + crud]
CREATE TABLE IF NOT EXISTS
group_user (
    id text not null primary key,
    name text not null,
    rest_api text,
    create_date date default (DATETIME('now')),
    update_date date default (DATETIME('now')),
    disable_date date
)

-- users 
-- rest_api [command_uri + crud]
CREATE TABLE IF NOT EXISTS
user (
    id text not null primary key,
    name text not null,
    group_user_id text not null,
    rest_api text
    -- enable/disable
    os_user_id text
    user_status text not null default 'enable',
    create_date date default (DATETIME('now')), 
    update_date date default (DATETIME('now')),
    disable_date date
    FOREIGN KEY (group_user_id) REFERENCES group_user(id)
)

-- analogue docker compose manifest file
CREATE TABLE IF NOT EXISTS
app (
    id text not null primary key,
    name text not null unique,
    owner_user_id text not null,
    status text default 'stoppd',
    create_date date default (DATETIME('now')), 
    update_date date default (DATETIME('now')),
    FOREIGN KEY (owner_user_id) REFERENCES user(id)
)

-- images can be install
CREATE TABLE IF NOT EXISTS
image (
    id text not null primary key,
    name text not null unique,
    app_id text not null,
    repository not null,
    --true statefull/false stateless
    inner_port integer not null,
    has_state int not null default 1,
    -- git branch name or other
    tags text not null default '',
    create_date date default (DATETIME('now')), 
    update_date date default (DATETIME('now')),
    commit_id text not null, 
    FOREIGN KEY (app_id) REFERENCES app(id)
)

-- analogue docker compose runtime / analogue helm chart
CREATE TABLE IF NOT EXISTS
app_instance (
    id text not null primary key,
    -- image tag, git branch name 
    name text not null unique,
    user_id text not null,
    life_status text not null,
    app_instance_url text not null,
    app_id text not null, 
    instance_type_id text not null,  
    deploy_strategy_id text not null, 
    remove_strategy_id text not null, 
    create_date date default (DATETIME('now')), 
    update_date date default (DATETIME('now')), 
    remove_date date,
    FOREIGN KEY (instance_type_id) REFERENCES instance_type(id)
    FOREIGN KEY (deploy_strategy_id) REFERENCES deploy_strategy(id)
    FOREIGN KEY (remove_strategy_id) REFERENCES remove_strategy(id)
    FOREIGN KEY (app_id) REFERENCES app(id)
    FOREIGN KEY (user_id) REFERENCES user(id)
)

-- prod, test, demo
CREATE TABLE IF NOT EXISTS
instance_type (
    id text not null primary key,
    name text not null unique
)

INSERT INTO instance_type (name)
VALUES
	("prod"),
	("test"),
	("demo"),    
	("master"),
    ("feature");

-- rolling, recreate, bg: blue/green, canary, dark: A/B
CREATE TABLE IF NOT EXISTS
deploy_strategy (
    id text not null primary key,
    name text not null unique
)

INSERT INTO deploy_strategy (name)
VALUES
	("rolling"),
	("recreate"),
	("bg"),    
    ("canary"),
    ("dark"),
    ("restore");

-- full, achive
CREATE TABLE IF NOT EXISTS
remove_strategy (
    id text not null primary key,
    name text not null unique
)

INSERT INTO remove_strategy (name)
VALUES
	("full"),
	("achive");    

-- runtime image
CREATE TABLE IF NOT EXISTS
container (
    id text not null primary key,
    docker_runtime_id text not null,
    name text not null unique,
    image_id text not null,
    node_id text not null,
    outer_port integer,
    app_instance_id text not null,
    life_status text not null default 'stopped',
    create_date date default (DATETIME('now')), 
    update_date date default (DATETIME('now')), 
    remove_date date,
    FOREIGN KEY (app_instance_id) REFERENCES app_instance(id)
    FOREIGN KEY (node_id) REFERENCES node(id)
    FOREIGN KEY (image_id) REFERENCES image(id)
)

CREATE TABLE IF NOT EXISTS
node (
    id text not null primary key,
    name text not null unique,
    url text,
    cpu text,
    memory text,
    -- iswork, restart, remove
    life_status text not null default 'running',    
    create_date date default (DATETIME('now')), 
    update_date date default (DATETIME('now')), 
    remove_date date
)

CREATE TABLE IF NOT EXISTS
driver (
    id text not null primary key,
    name text not null unique,
    app_id text not null, 
    FOREIGN KEY (app_id) REFERENCES app(id)
)

-- gitlab, runner, other programm
CREATE TABLE IF NOT EXISTS
device (
    id text not null primary key,
    name text not null unique,
    device_type_id text not null,
    node_id text not null,
    driver_id text not null,
    url text,
    life_status text not null default 'running', 
    create_date date default (DATETIME('now')), 
    update_date date default (DATETIME('now')),
    remove_date date,
    FOREIGN KEY (device_type_id) REFERENCES device_type(id)
    FOREIGN KEY (node_id) REFERENCES node(id)
    FOREIGN KEY (driver_id) REFERENCES driver(id)
)

-- git, runner, proxy other type
CREATE TABLE IF NOT EXISTS
device_type (
    id text not null primary key,
    name text not null unique
)

INSERT INTO device_type (name)
VALUES
    ("volume"),
	("git"),
	("runner"),
	("images"),    
	("proxy"),
    ("sql_db"),
    ("mongo_db"),
    ("broker");

-- compile time: git, runner, images
CREATE TABLE IF NOT EXISTS
app_device (
    id text not null primary key,
    app_id text not null,     
    device_id text not null,
    FOREIGN KEY (device_id) REFERENCES device(id)
    FOREIGN KEY (app_id) REFERENCES app(id)
)

-- runtime: proxy, db, broker 
CREATE TABLE IF NOT EXISTS
app_instance_device (
    id text not null primary key,
    app_instance_id text not null,     
    device_id text not null,
    FOREIGN KEY (device_id) REFERENCES device(id)
    FOREIGN KEY (app_instance_id) REFERENCES app_instance(id)
)

CREATE TABLE IF NOT EXISTS
container_device (
    id text not null primary key,
    container_id text not null,     
    device_id text not null,
    FOREIGN KEY (device_id) REFERENCES device(id)
    FOREIGN KEY (container_id) REFERENCES container(id)
)

CREATE TABLE IF NOT EXISTS
container_device_env_option (
    id text not null primary key,
    container_id text not null,
    device_id text not null,
    container_env_name text not null,
    device_option_name text not null,
    FOREIGN KEY (device_id) REFERENCES device(id),
    FOREIGN KEY (container_id) REFERENCES container(id)
)

CREATE TABLE IF NOT EXISTS
container_device_option (
    id text not null primary key,
    container_id text not null,
    device_id text not null,
    device_option_name text not null,
    container_option_value text not null,
    FOREIGN KEY (device_id) REFERENCES device(id),
    FOREIGN KEY (container_id) REFERENCES container(id)
)

CREATE TABLE IF NOT EXISTS
volume (
    id text not null primary key,
    type text not null default 'auto', -- 'auto', 'path'
    path text,
    create_date date default (DATETIME('now')), 
    update_date date default (DATETIME('now')),
    remove_date date
)

CREATE TABLE IF NOT EXISTS
container_volume (
    id text not null primary key,
    container_id text not null,
    volume_id text not null,
    FOREIGN KEY (volume_id) REFERENCES volume(id),
    FOREIGN KEY (container_id) REFERENCES container(id)
)
