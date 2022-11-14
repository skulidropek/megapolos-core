from flask import request
from corerest import *
from corerqlite import *
import docker
import uuid
docker_client = docker.from_env()

def get_port():
    used_ports = db_cursor.execute("SELECT outer_port FROM app").fetchall()
    used_ports = list(map(lambda row: row[0], used_ports))
    for i in range(10000, 20000):
        if i not in used_ports:
            return i
    raise Exception('No available port')

@flask_app.route("/apps/install")
def install_app():
    app_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    outer_port = get_port()
    try:
        docker_client.images.get(request.args['image'])
    except:
        docker_client.images.pull(request.args['image'])
    container_id = docker_client.containers.create(
        name=app_id+"_"+request.args["name"], detach=True, image=request.args["image"], 
        ports={request.args["inport"]: outer_port}, extra_hosts={"host.docker.internal": "host-gateway"},
    ).id
    db_cursor.execute("""
        INSERT INTO user (id, name, role) VALUES (?, ?, ?)
    """, (user_id, "app_" + request.args["name"], "app"))
    db_cursor.execute("""
        INSERT INTO app (id, owner_user_id, name, container_id, image, inner_port, outer_port, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (app_id, user_id, request.args["name"], container_id, 
        request.args["image"], request.args["inport"], outer_port, 
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
    except:
        pass
    docker_client.containers.get(container_id).remove()
    db_cursor.execute("DELETE FROM app WHERE id = ?", (app_id,))
    db_cursor.execute("DELETE FROM user WHERE id = ?", (app["owner_user_id"],))
    return {"result": "ok"}

@flask_app.route("/apps/list")
def list_app():
    print("before_apps_list")
    apps = db_connection.cursor().execute("""
        SELECT app.*, user.name as user_name
        FROM app
        LEFT JOIN user ON app.owner_user_id = user.id
    """).fetchall()
    print("after_apps_list")
    
    return list(map(lambda item: dict(item), apps))