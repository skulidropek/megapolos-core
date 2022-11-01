from flask import request
from corerest import *
from corerqlite import *
import docker
import uuid
docker_client = docker.from_env()

@flask_app.route("/apps/install")
def install_app():
    app_id = str(uuid.uuid4())
    container_id = docker_client.containers.create(name=app_id+"_"+request.args["name"], detach=True, image=request.args["image"], 
        ports={request.args["inport"]: request.args["outport"]},).id
    db_cursor.execute("""
        INSERT INTO app (id, owner_user_id, name, container_id, image, inner_port, outer_port, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (app_id, request.user["id"], request.args["name"], container_id, 
        request.args["image"], request.args["inport"], request.args["outport"], 
        "stopped"
    ))
    return {"result": "ok"}

@flask_app.route("/apps/start")
def start_app():
    app_id = request.args["id"]
    app = db_cursor.execute("SELECT * FROM app WHERE id = ?", (app_id,)).fetchone()
    docker_client.containers.get(app["container_id"]).start()
    db_cursor.execute("UPDATE app SET status = ? WHERE id = ?", ("running", app_id))
    return {"result": "ok"}

@flask_app.route("/apps/stop")
def stop_app():
    app_id = request.args["id"]
    app = db_cursor.execute("SELECT * FROM app WHERE id = ?", (app_id,)).fetchone()
    docker_client.containers.get(app["container_id"]).stop()
    db_cursor.execute("UPDATE app SET status = ? WHERE id = ?", ("stopped", app_id))
    return {"result": "ok"}

@flask_app.route("/apps/uninstall")
def uninstall_app():
    app_id = request.args["id"]
    print(app_id)
    app = db_cursor.execute("SELECT * FROM app WHERE id = ?", (app_id,)).fetchone()
    container_id = app["container_id"]
    try:
        docker_client.containers.get(container_id).stop()
        docker_client.containers.get(container_id).remove()
    except:
        pass
    db_cursor.execute("DELETE FROM app WHERE id = ?", (app_id,))
    return {"result": "ok"}

@flask_app.route("/apps/list")
def list_app():
    apps = db_cursor.execute("SELECT * FROM app").fetchall()
    
    return list(map(lambda item: dict(item), apps))