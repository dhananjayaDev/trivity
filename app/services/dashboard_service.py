import random
from datetime import datetime, timedelta
from typing import Dict, List, Any

class DashboardService:
    """Service class for dashboard data operations"""
    
    @staticmethod
    def get_dashboard_data() -> Dict[str, Any]:
        """Generate sample dashboard data"""
        return {
            'users': {
                'count': '14k',
                'change': '+25%',
                'trend': 'up'
            },
            'conversions': {
                'count': '325',
                'change': '-25%',
                'trend': 'down'
            },
            'event_count': {
                'count': '200k',
                'change': '+5%',
                'trend': 'up'
            },
            'sessions': {
                'count': '13,277',
                'change': '+35%',
                'trend': 'up',
                'data': DashboardService._generate_sessions_data()
            },
            'page_views_downloads': {
                'count': '1.3M',
                'change': '-8%',
                'trend': 'down',
                'data': DashboardService._generate_page_views_data()
            }
        }
    
    @staticmethod
    def _generate_sessions_data() -> List[Dict[str, Any]]:
        """Generate sessions data for the last 30 days"""
        sessions_data = []
        base_date = datetime.now() - timedelta(days=30)
        
        for i in range(30):
            date = base_date + timedelta(days=i)
            sessions_data.append({
                'date': date.strftime('%b %d'),
                'sessions': random.randint(8000, 15000),
                'page_views': random.randint(12000, 20000),
                'downloads': random.randint(2000, 5000)
            })
        
        return sessions_data
    
    @staticmethod
    def _generate_page_views_data() -> List[Dict[str, Any]]:
        """Generate page views data for the last 6 months"""
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
        page_views_data = []
        
        for month in months:
            page_views_data.append({
                'month': month,
                'page_views': random.randint(8000, 12000),
                'downloads': random.randint(2000, 4000),
                'other': random.randint(1000, 3000)
            })
        
        return page_views_data
