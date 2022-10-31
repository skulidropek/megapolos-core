from email.mime import image
from corerest import *
from coreetcd import *
from flask import request
import docker
docker_client = docker.from_env()

@flask_app.route("/apps/start")
def start_app():
    docker_client.containers.run(name=request.args["name"], detach=True, image=request.args["image"], 
        ports={request.args["inport"]: request.args["outport"]},)
    etcd_client.write('/apps/' + request.args["name"] + "/status", "running")
    return {"result": "ok"}

@flask_app.route("/apps/stop")
def stop_app():
    docker_client.containers.get(request.args["name"]).stop()
    docker_client.containers.get(request.args["name"]).remove()
    etcd_client.delete('/apps/' + request.args["name"], True)
    return {"result": "ok"}

@flask_app.route("/apps/list")
def list_app():
    def get_item(item):
        return {
            "name": item.key,
            "status": etcd_client.get(item.key + "/status").value,
        }
    
    return list(map(get_item, filter(lambda item: item.key != '/apps', etcd_client.read('/apps').children)))