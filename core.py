from corerest import *
from corerqlite import *
from flask import request
import modules.users
import modules.apps
import config
import jwt

port = 5100

@flask_app.before_request
def auth():
    try:
        print("before_auth")
        token = dict(request.args)["token"]
        auth_data = jwt.decode(token, config.secret, algorithms=["HS256"])
        user = db_cursor.execute("SELECT * FROM user WHERE id = ?", (auth_data["id"],)).fetchone()
        print("after_auth")
        request.user = user
        if (user == None):
            return {"result": "error", "error": "auth"}
        return
    except:
        return {"result": "error", "error": "auth"}
    return {"result": "error", "error": "auth"}

@flask_app.after_request
def after_request(response):
    print("after_request")
    return response

if __name__ == '__main__':
    flask_app.run(host="0.0.0.0", port=port, threaded=False)