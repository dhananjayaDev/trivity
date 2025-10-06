from pymongo import MongoClient
from flask import current_app
import logging

class DatabaseManager:
    """MongoDB database manager for the sustainability platform"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self._connect()
    
    def _connect(self):
        """Establish connection to MongoDB Atlas"""
        try:
            from app.config import Config
            
            self.client = MongoClient(Config.MONGO_URI)
            self.db = self.client[Config.DATABASE_NAME]
            
            # Test connection
            self.client.admin.command('ping')
            logging.info("Successfully connected to MongoDB Atlas")
            
        except Exception as e:
            logging.error(f"Failed to connect to MongoDB: {e}")
            self.client = None
            self.db = None
            raise
    
    def get_collection(self, collection_name):
        """Get a specific collection from the database"""
        if self.db is None:
            self._connect()
        return self.db[collection_name]
    
    def get_users_collection(self):
        """Get users collection"""
        return self.get_collection('users')
    
    def get_assessments_collection(self):
        """Get assessments collection"""
        return self.get_collection('assessments')
    
    def get_carbon_data_collection(self):
        """Get carbon data collection"""
        return self.get_collection('carbon_data')
    
    def get_sdg_recommendations_collection(self):
        """Get SDG recommendations collection"""
        return self.get_collection('sdg_recommendations')
    
    def get_reports_collection(self):
        """Get reports collection"""
        return self.get_collection('reports')
    
    def get_sri_assessments_collection(self):
        """Get SRI assessments collection"""
        return self.get_collection('sri_assessments')
    
    def get_sri_questions_collection(self):
        """Get SRI questions collection"""
        return self.get_collection('sri_questions')
    
    def close_connection(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logging.info("MongoDB connection closed")

# Global database instance
db_manager = DatabaseManager()
