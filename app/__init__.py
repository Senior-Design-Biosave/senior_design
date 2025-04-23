from flask import Flask
from flask_cors import CORS
from app.routes import routes

def create_app():
    app = Flask(__name__)
    CORS(app)
    from app.routes import routes
    print("📦 Registering routes...")
    app.register_blueprint(routes)
    return app
