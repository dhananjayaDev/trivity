from flask import Flask
from flask_cors import CORS
from app.routes import api_bp, main_bp, auth_bp
from app.routes.auth import init_login_manager

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    app.config['JSON_SORT_KEYS'] = False
    
    # Enable CORS
    CORS(app)
    
    # Initialize login manager
    init_login_manager(app)
    
    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app
