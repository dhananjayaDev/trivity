from flask import Blueprint, jsonify
from app.services.dashboard_service import DashboardService
from app.services.user_service import UserService

api_bp = Blueprint('api', __name__)

@api_bp.route('/dashboard-data')
def get_dashboard_data():
    """Get dashboard metrics and chart data"""
    try:
        data = DashboardService.get_dashboard_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/user-profile')
def get_user_profile():
    """Get user profile information"""
    try:
        profile = UserService.get_user_profile()
        return jsonify(profile)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
