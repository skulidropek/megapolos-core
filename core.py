from corerest import *
from coreetcd import *
from flask import request
import modules.users
import modules.apps
import config
import jwt

@flask_app.route("/")
def hello_world():
    return etcd_client.get('/b').value

port = 5100

@flask_app.before_request
def auth():
    try:
        token = dict(request.args)["token"]
        auth_data = jwt.decode(token, config.secret, algorithms=["HS256"])
        try:
            etcd_client.get(auth_data["id"])
        except:
            return {"result": "error", "error": "auth"}
        return
    except:
        return {"result": "error", "error": "auth"}
    return {"result": "error", "error": "auth"}

if __name__ == '__main__':
    flask_app.run(host="0.0.0.0", port=port)