CREATE TABLE IF NOT EXISTS
user (
    id text not null primary key,
    name text not null,
    role text not null
)

CREATE TABLE IF NOT EXISTS
app (
    id text not null primary key,
    name text not null unique,
    owner_user_id text not null,
    container_id text not null,
    image text not null,
    inner_port integer not null,
    outer_port integer not null,
    status text not null,
    FOREIGN KEY (owner_user_id) REFERENCES user(id)
)
