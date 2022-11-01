from corerest import *
from corerqlite import *
from flask import request
import config
import uuid
import jwt

@flask_app.route("/users/add")
def add_user():
    id = str(uuid.uuid4())
    db_cursor.execute("INSERT INTO user (id, name, role) VALUES (?, ?, ?)", (id, request.args["name"], "user"))
    return {"result": "ok"}

@flask_app.route("/users/list")
def list_user():
    def filter_json(user):
        user = dict(user)
        user["token"] = str(jwt.encode({"id": user["id"]}, config.secret, algorithm="HS256"), "utf-8")
        return user
    users = db_cursor.execute("SELECT * FROM user").fetchall()
    return list(map(lambda item: filter_json(item), users))

root_user = db_cursor.execute("SELECT * FROM user WHERE role = 'admin' LIMIT 1").fetchone()
if (root_user == None):
    id = str(uuid.uuid4())
    name = "root"
    role = "admin"
    db_cursor.execute("INSERT INTO user VALUES (?, ?, ?)", (id, name, role))
    root_user = db_cursor.execute("SELECT * FROM user WHERE role = 'admin' LIMIT 1").fetchone()

print("root token: " + str(jwt.encode({"id": root_user["id"]}, config.secret, algorithm="HS256"), "utf-8"))