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
        token = dict(request.args)["token"]
        auth_data = jwt.decode(token, config.secret, algorithms=["HS256"])
        user = db_cursor.execute("SELECT * FROM user WHERE id = ?", (auth_data["id"],)).fetchone()
        request.user = user
        if (user == None):
            return {"result": "error", "error": "auth"}
        return
    except:
        return {"result": "error", "error": "auth"}
    return {"result": "error", "error": "auth"}

if __name__ == '__main__':
    flask_app.run(host="0.0.0.0", port=port)