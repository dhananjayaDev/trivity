from typing import Dict, Any

class UserService:
    """Service class for user-related operations"""
    
    @staticmethod
    def get_user_profile() -> Dict[str, Any]:
        """Get user profile information"""
        return {
            'name': 'Riley Carter',
            'email': 'riley@email.com',
            'avatar': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            'role': 'Administrator',
            'last_login': '2023-04-17T10:30:00Z'
        }
