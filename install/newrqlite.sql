CREATE TABLE IF NOT EXISTS
user (
    id text not null primary key,
    name text not null,
    role text not null
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

-- image
CREATE TABLE IF NOT EXISTS
container (
    id text not null primary key,
    name text not null unique,
    image text not null
    app_id text not null,
    inner_port integer not null,
    outer_port integer not null,
    FOREIGN KEY (app_id) REFERENCES app(id)
)

CREATE TABLE IF NOT EXISTS
node (
    id text not null primary key,
    name text not null unique,
    url text not null,
    FOREIGN KEY (app_id) REFERENCES app(id)
)

-- gitlab, runner, other programm
CREATE TABLE IF NOT EXISTS
device (
    id text not null primary key,
    name text not null unique,
    device_type_id text not null,
    url text not null,
    FOREIGN KEY (device_type_id) REFERENCES device_type(id)
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
