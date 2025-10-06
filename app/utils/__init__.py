import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional

class ErrorHandler:
    """Centralized error handling and logging for the platform"""
    
    @staticmethod
    def log_error(error: Exception, context: str = "", user_id: str = None):
        """Log errors with context and user information"""
        error_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context,
            'user_id': user_id
        }
        
        logging.error(f"Error in {context}: {error}", extra=error_data)
        
        # In production, you might want to send this to an error tracking service
        # like Sentry, Rollbar, or similar
    
    @staticmethod
    def handle_api_error(error: Exception, context: str = "", user_id: str = None) -> Dict[str, Any]:
        """Handle API errors and return user-friendly responses"""
        ErrorHandler.log_error(error, context, user_id)
        
        # Return user-friendly error message
        return {
            'success': False,
            'error': 'An unexpected error occurred. Please try again later.',
            'error_code': 'INTERNAL_ERROR'
        }
    
    @staticmethod
    def validate_required_fields(data: Dict, required_fields: list) -> Optional[str]:
        """Validate required fields in request data"""
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return f"Missing required fields: {', '.join(missing_fields)}"
        return None

class SecurityUtils:
    """Security utilities for the platform"""
    
    @staticmethod
    def sanitize_input(data: Any) -> Any:
        """Basic input sanitization"""
        if isinstance(data, str):
            # Remove potentially dangerous characters
            return data.strip().replace('<', '&lt;').replace('>', '&gt;')
        elif isinstance(data, dict):
            return {key: SecurityUtils.sanitize_input(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [SecurityUtils.sanitize_input(item) for item in data]
        return data
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Any]:
        """Validate password strength"""
        issues = []
        
        if len(password) < 8:
            issues.append("Password must be at least 8 characters long")
        
        if not any(c.isupper() for c in password):
            issues.append("Password must contain at least one uppercase letter")
        
        if not any(c.islower() for c in password):
            issues.append("Password must contain at least one lowercase letter")
        
        if not any(c.isdigit() for c in password):
            issues.append("Password must contain at least one number")
        
        return {
            'is_valid': len(issues) == 0,
            'issues': issues
        }

class PerformanceMonitor:
    """Performance monitoring utilities"""
    
    @staticmethod
    def log_performance(func_name: str, start_time: float, end_time: float, user_id: str = None):
        """Log performance metrics"""
        duration = end_time - start_time
        
        if duration > 1.0:  # Log slow operations (>1 second)
            logging.warning(f"Slow operation detected: {func_name} took {duration:.2f}s", extra={
                'function': func_name,
                'duration': duration,
                'user_id': user_id,
                'timestamp': datetime.utcnow().isoformat()
            })
    
    @staticmethod
    def monitor_api_call(func):
        """Decorator to monitor API call performance"""
        def wrapper(*args, **kwargs):
            start_time = datetime.utcnow().timestamp()
            try:
                result = func(*args, **kwargs)
                end_time = datetime.utcnow().timestamp()
                PerformanceMonitor.log_performance(func.__name__, start_time, end_time)
                return result
            except Exception as e:
                end_time = datetime.utcnow().timestamp()
                PerformanceMonitor.log_performance(func.__name__, start_time, end_time)
                raise e
        return wrapper

class EnvironmentConfig:
    """Environment configuration utilities"""
    
    @staticmethod
    def is_production() -> bool:
        """Check if running in production"""
        return os.environ.get('FLASK_ENV') == 'production'
    
    @staticmethod
    def is_development() -> bool:
        """Check if running in development"""
        return os.environ.get('FLASK_ENV') == 'development'
    
    @staticmethod
    def get_log_level() -> str:
        """Get appropriate log level based on environment"""
        return 'INFO' if EnvironmentConfig.is_production() else 'DEBUG'
    
    @staticmethod
    def get_cors_origins() -> list:
        """Get CORS origins based on environment"""
        if EnvironmentConfig.is_production():
            return ['https://yourdomain.com']  # Replace with actual domain
        else:
            return ['http://localhost:5000', 'http://127.0.0.1:5000']

# Global instances
error_handler = ErrorHandler()
security_utils = SecurityUtils()
performance_monitor = PerformanceMonitor()
env_config = EnvironmentConfig()
