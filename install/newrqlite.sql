-- user group
CREATE TABLE IF NOT EXISTS
group_user (
    id text not null primary key,
    name text not null,
)

-- users 
CREATE TABLE IF NOT EXISTS
user (
    id text not null primary key,
    name text not null,
    group_user_id text not null
    FOREIGN KEY (group_user_id) REFERENCES group_user(id)
)

-- docker compose
CREATE TABLE IF NOT EXISTS
app (
    id text not null primary key,
    name text not null unique,
    owner_user_id text not null,
    status text not null,
    FOREIGN KEY (owner_user_id) REFERENCES user(id)
)

-- runtime image
CREATE TABLE IF NOT EXISTS
container (
    id text not null primary key,
    name text not null unique,
    image_id text not null
    app_id text not null,
    node_id text not null,
    inner_port integer not null,
    outer_port integer not null,
    FOREIGN KEY (app_id) REFERENCES app(id)
    FOREIGN KEY (node_id) REFERENCES node(id)
    FOREIGN KEY (image_id) REFERENCES image(id)
)

-- images can be install
CREATE TABLE IF NOT EXISTS
image (
    id text not null primary key,
    name text not null unique,
)

CREATE TABLE IF NOT EXISTS
node (
    id text not null primary key,
    name text not null unique,
    url text not null,
    cpu text not null,
    memory text not null,
)

CREATE TABLE IF NOT EXISTS
volume (
    id text not null primary key,
    name text not null unique,
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
    url text not null,
    FOREIGN KEY (device_type_id) REFERENCES device_type(id)
    FOREIGN KEY (node_id) REFERENCES node(id)
    FOREIGN KEY (driver_id) REFERENCES driver(id)
)

-- git, runner, proxy other type
CREATE TABLE IF NOT EXISTS
device_type (
    id text not null primary key,
    name text not null unique,
)

INSERT INTO device_type (name)
VALUES
	("git"),
	("runner"),
	("images"),    
	("proxy"),
    ("sql_db"),
    ("mongo_db"),
    ("broker");


CREATE TABLE IF NOT EXISTS
app_device (
    id text not null primary key,
    app_id text not null,     
    device_id text not null,
    FOREIGN KEY (device_id) REFERENCES device(id)
    FOREIGN KEY (app_id) REFERENCES app(id)
)
