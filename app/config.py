import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    
    # MongoDB Configuration
    MONGO_URI = os.environ.get('MONGO_URI') or "mongodb+srv://dansky328:Password123@testcase01.znph9ry.mongodb.net/?retryWrites=true&w=majority&appName=testCase01"
    
    # Gemini AI Configuration
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or "AIzaSyCNLAkh8xk2TcX63IQQRNXdZ0hGqAUFmnA"
    
    # Application Settings
    JSON_SORT_KEYS = False
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours
    
    # Database Settings
    DATABASE_NAME = 'sustainability_platform'
    
    # Collections
    USERS_COLLECTION = 'users'
    ASSESSMENTS_COLLECTION = 'assessments'
    CARBON_DATA_COLLECTION = 'carbon_data'
    SDG_RECOMMENDATIONS_COLLECTION = 'sdg_recommendations'
    REPORTS_COLLECTION = 'reports'
