from flask_login import UserMixin
from datetime import datetime
from bson import ObjectId
import hashlib

class User(UserMixin):
    """User model for authentication and user management"""
    
    def __init__(self, user_data=None):
        if user_data:
            self._id = str(user_data.get('_id', ''))
            self.email = user_data.get('email', '')
            self.password_hash = user_data.get('password_hash', '')
            self.first_name = user_data.get('first_name', '')
            self.last_name = user_data.get('last_name', '')
            self.company = user_data.get('company', '')
            self.role = user_data.get('role', 'user')
            self.created_at = user_data.get('created_at', datetime.utcnow())
            self.last_login = user_data.get('last_login')
            self._is_active = user_data.get('is_active', True)
            self.profile_completed = user_data.get('profile_completed', False)
            self.sustainability_profile = user_data.get('sustainability_profile', {})
        else:
            self._id = None
            self.email = ''
            self.password_hash = ''
            self.first_name = ''
            self.last_name = ''
            self.company = ''
            self.role = 'user'
            self.created_at = datetime.utcnow()
            self.last_login = None
            self._is_active = True
            self.profile_completed = False
            self.sustainability_profile = {}
    
    @property
    def id(self):
        """Get user ID"""
        return self._id
    
    @id.setter
    def id(self, value):
        """Set user ID"""
        self._id = value
    
    @property
    def is_active(self):
        """Check if user is active"""
        return self._is_active
    
    @is_active.setter
    def is_active(self, value):
        """Set user active status"""
        self._is_active = value
    
    def get_id(self):
        """Required by Flask-Login"""
        return str(self._id) if self._id else None
    
    def to_dict(self):
        """Convert user object to dictionary for database storage"""
        return {
            'email': self.email,
            'password_hash': self.password_hash,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'company': self.company,
            'role': self.role,
            'created_at': self.created_at,
            'last_login': self.last_login,
            'is_active': self._is_active,
            'profile_completed': self.profile_completed,
            'sustainability_profile': self.sustainability_profile
        }
    
    def get_full_name(self):
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_avatar_url(self):
        """Generate avatar URL based on user's name"""
        if self.first_name and self.last_name:
            initials = f"{self.first_name[0]}{self.last_name[0]}".upper()
            return f"https://ui-avatars.com/api/?name={initials}&background=4caf50&color=fff&size=200"
        return "https://ui-avatars.com/api/?name=U&background=4caf50&color=fff&size=200"
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
    
    def is_admin(self):
        """Check if user is admin"""
        return self.role == 'admin'
    
    def can_access_reports(self):
        """Check if user can access reports"""
        return self.role in ['admin', 'manager']

class SRIQuestion:
    """SRI Question model for questionnaire structure"""
    
    def __init__(self, question_data=None):
        if question_data:
            self.id = question_data.get('id', '')
            self.text = question_data.get('text', '')
            self.category = question_data.get('category', 'general')
            self.weight = question_data.get('weight', 1.0)
            self.options = question_data.get('options', [])
            self.required = question_data.get('required', True)
        else:
            self.id = ''
            self.text = ''
            self.category = 'general'
            self.weight = 1.0
            self.options = []
            self.required = True

class SRIAssessment:
    """SRI Assessment model for sustainability readiness index"""
    
    def __init__(self, assessment_data=None):
        if assessment_data:
            self.id = str(assessment_data.get('_id', ''))
            self.user_id = assessment_data.get('user_id', '')
            self.total_score = assessment_data.get('total_score', 0.0)
            self.category_scores = assessment_data.get('category_scores', {
                'general': 0.0,
                'environment': 0.0,
                'social': 0.0,
                'governance': 0.0
            })
            self.answers = assessment_data.get('answers', {})
            self.industry = assessment_data.get('industry', '')
            self.company_size = assessment_data.get('company_size', '')
            self.location = assessment_data.get('location', '')
            self.created_at = assessment_data.get('created_at', datetime.utcnow())
            self.updated_at = assessment_data.get('updated_at', datetime.utcnow())
            self.status = assessment_data.get('status', 'completed')
            self.ai_analysis = assessment_data.get('ai_analysis', {})
        else:
            self.id = None
            self.user_id = ''
            self.total_score = 0.0
            self.category_scores = {
                'general': 0.0,
                'environment': 0.0,
                'social': 0.0,
                'governance': 0.0
            }
            self.answers = {}
            self.industry = ''
            self.company_size = ''
            self.location = ''
            self.created_at = datetime.utcnow()
            self.updated_at = datetime.utcnow()
            self.status = 'completed'
            self.ai_analysis = {}
    
    def to_dict(self):
        """Convert assessment object to dictionary for database storage"""
        return {
            'user_id': self.user_id,
            'total_score': self.total_score,
            'category_scores': self.category_scores,
            'answers': self.answers,
            'industry': self.industry,
            'company_size': self.company_size,
            'location': self.location,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'status': self.status,
            'ai_analysis': self.ai_analysis
        }
    
    def calculate_total_score(self):
        """Calculate total score from category scores"""
        scores = list(self.category_scores.values())
        self.total_score = sum(scores) / len(scores) if scores else 0.0
        return self.total_score

class Assessment:
    """Legacy Assessment model - keeping for backward compatibility"""
    
    def __init__(self, assessment_data=None):
        if assessment_data:
            self.id = str(assessment_data.get('_id', ''))
            self.user_id = assessment_data.get('user_id', '')
            self.total_score = assessment_data.get('total_score', 0.0)
            self.category_scores = assessment_data.get('category_scores', {
                'general': 0.0,
                'environment': 0.0,
                'social': 0.0,
                'governance': 0.0
            })
            self.answers = assessment_data.get('answers', {})
            self.created_at = assessment_data.get('created_at', datetime.utcnow())
            self.updated_at = assessment_data.get('updated_at', datetime.utcnow())
            self.status = assessment_data.get('status', 'in_progress')
        else:
            self.id = None
            self.user_id = ''
            self.total_score = 0.0
            self.category_scores = {
                'general': 0.0,
                'environment': 0.0,
                'social': 0.0,
                'governance': 0.0
            }
            self.answers = {}
            self.created_at = datetime.utcnow()
            self.updated_at = datetime.utcnow()
            self.status = 'in_progress'
    
    def to_dict(self):
        """Convert assessment object to dictionary for database storage"""
        return {
            'user_id': self.user_id,
            'total_score': self.total_score,
            'category_scores': self.category_scores,
            'answers': self.answers,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'status': self.status
        }
    
    def calculate_total_score(self):
        """Calculate total score from category scores"""
        scores = list(self.category_scores.values())
        self.total_score = sum(scores) / len(scores) if scores else 0.0
        return self.total_score

class CarbonData:
    """Carbon emissions data model"""
    
    def __init__(self, carbon_data=None):
        if carbon_data:
            self.id = str(carbon_data.get('_id', ''))
            self.user_id = carbon_data.get('user_id', '')
            self.electricity_emissions = carbon_data.get('electricity_emissions', 0.0)
            self.transportation_emissions = carbon_data.get('transportation_emissions', 0.0)
            self.refrigerant_emissions = carbon_data.get('refrigerant_emissions', 0.0)
            self.mobile_emissions = carbon_data.get('mobile_emissions', 0.0)
            self.combustion_emissions = carbon_data.get('combustion_emissions', 0.0)
            self.total_emissions = carbon_data.get('total_emissions', 0.0)
            self.period = carbon_data.get('period', 'monthly')
            self.created_at = carbon_data.get('created_at', datetime.utcnow())
            self.updated_at = carbon_data.get('updated_at', datetime.utcnow())
        else:
            self.id = None
            self.user_id = ''
            self.electricity_emissions = 0.0
            self.transportation_emissions = 0.0
            self.refrigerant_emissions = 0.0
            self.mobile_emissions = 0.0
            self.combustion_emissions = 0.0
            self.total_emissions = 0.0
            self.period = 'monthly'
            self.created_at = datetime.utcnow()
            self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert carbon data object to dictionary for database storage"""
        return {
            'user_id': self.user_id,
            'electricity_emissions': self.electricity_emissions,
            'transportation_emissions': self.transportation_emissions,
            'refrigerant_emissions': self.refrigerant_emissions,
            'mobile_emissions': self.mobile_emissions,
            'combustion_emissions': self.combustion_emissions,
            'total_emissions': self.total_emissions,
            'period': self.period,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    def calculate_total_emissions(self):
        """Calculate total emissions from all sources"""
        self.total_emissions = (
            self.electricity_emissions +
            self.transportation_emissions +
            self.refrigerant_emissions +
            self.mobile_emissions +
            self.combustion_emissions
        )
        return self.total_emissions
