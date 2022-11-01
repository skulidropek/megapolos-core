from email.mime import image
from corerest import *
from coreetcd import *
from flask import request
import docker
import uuid
docker_client = docker.from_env()

@flask_app.route("/apps/install")
def install_app():
    app_id = str(uuid.uuid4())
    container_id = docker_client.containers.create(name=app_id+"_"+request.args["name"], detach=True, image=request.args["image"], 
        ports={request.args["inport"]: request.args["outport"]},).id
    etcd_client.write('/apps/' + app_id + "/status", "stopped")
    etcd_client.write('/apps/' + app_id + "/name", request.args["name"])
    etcd_client.write('/apps/' + app_id + "/image", request.args["image"])
    etcd_client.write('/apps/' + app_id + "/inport", request.args["inport"])
    etcd_client.write('/apps/' + app_id + "/outport", request.args["outport"])
    etcd_client.write('/apps/' + app_id + "/container_id", container_id)
    return {"result": "ok"}

@flask_app.route("/apps/start")
def start_app():
    app_id = request.args["id"]
    docker_client.containers.get(etcd_client.read(app_id + "/container_id").value).start()
    etcd_client.write(app_id + "/status", "running")
    return {"result": "ok"}

@flask_app.route("/apps/stop")
def stop_app():
    app_id = request.args["id"]
    docker_client.containers.get(etcd_client.read(app_id + "/container_id").value).stop()
    etcd_client.write(app_id + "/status", "stopped")
    return {"result": "ok"}

@flask_app.route("/apps/uninstall")
def uninstall_app():
    app_id = request.args["id"]
    container_id = etcd_client.read(app_id + "/container_id").value
    try:
        docker_client.containers.get(container_id).stop()
        docker_client.containers.get(container_id).remove()
    except:
        pass
    etcd_client.delete(request.args["id"], True)
    return {"result": "ok"}

@flask_app.route("/apps/list")
def list_app():
    def get_item(item):
        return {
            "id": item.key,
            "name": etcd_client.read(item.key + "/name").value,
            "status": etcd_client.get(item.key + "/status").value,
            "image": etcd_client.get(item.key + "/image").value,
            "inport": etcd_client.get(item.key + "/inport").value,
            "outport": etcd_client.get(item.key + "/outport").value,
            "container_id": etcd_client.get(item.key + "/container_id").value,
        }
    
    return list(map(get_item, filter(lambda item: item.key != '/apps', etcd_client.read('/apps').children)))