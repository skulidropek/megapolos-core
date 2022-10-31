from corerest import *
from coreetcd import *
from flask import request
import config
import uuid
import jwt

@flask_app.route("/users/add")
def add_user():
    id = str(uuid.uuid4())
    etcd_client.write('/users/' + id + '/name', request.args["name"])
    etcd_client.write('/users/' + id + '/roles', "user")
    return {"result": "ok"}

@flask_app.route("/users/list")
def list_user():
    def filter_json(item):
        user = {}
        user["roles"] = etcd_client.get(item.key + "/roles").value.split(",")
        user["key"] = item.key
        user["token"] = str(jwt.encode({"id": item.key}, config.secret, algorithm="HS256"), "utf-8")
        return user
    return list(map(lambda item: filter_json(item), etcd_client.read('/users').children))

try:
    etcd_client.get('/root')
except:
    etcd_client.write('/users/root/name', "root")
    etcd_client.write('/users/root/roles', "root")

print("root token: " + str(jwt.encode({"id": "/users/root"}, config.secret, algorithm="HS256"), "utf-8"))