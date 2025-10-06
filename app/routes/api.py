from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime
import logging

from app.database import db_manager
from app.models import Assessment, CarbonData
from app.services.ai_service import ai_service
from app.services.data_service import data_service
from app.services.report_service import report_service
from app.services.sri_service import sri_service

api_bp = Blueprint('api', __name__)

@api_bp.route('/assessment/analyze', methods=['POST'])
@login_required
def analyze_assessment():
    """Analyze sustainability assessment using AI"""
    try:
        data = request.get_json()
        assessment_answers = data.get('answers', {})
        
        if not assessment_answers:
            return jsonify({'error': 'No assessment answers provided'}), 400
        
        # Save assessment data using data service
        result = data_service.save_assessment_data(current_user.id, {
            'answers': assessment_answers,
            'industry': data.get('industry', 'Not specified'),
            'size': data.get('size', 'Not specified'),
            'location': data.get('location', 'Not specified')
        })
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        # Generate AI analysis
        user_profile = {
            'company': current_user.company or 'Unknown',
            'industry': data.get('industry', 'Not specified'),
            'size': data.get('size', 'Not specified'),
            'location': data.get('location', 'Not specified')
        }
        
        analysis = ai_service.analyze_sustainability_assessment(user_profile, assessment_answers)
        
        return jsonify({
            'success': True,
            'assessment_id': result['assessment_id'],
            'scores': result['scores'],
            'analysis': analysis
        })
        
    except Exception as e:
        logging.error(f"Error analyzing assessment: {e}")
        return jsonify({'error': 'Failed to analyze assessment'}), 500

@api_bp.route('/sdg/recommendations', methods=['GET'])
@login_required
def get_sdg_recommendations():
    """Get AI-powered SDG recommendations"""
    try:
        # Get user's latest assessment
        assessments_collection = db_manager.get_assessments_collection()
        latest_assessment = assessments_collection.find_one(
            {'user_id': current_user.id},
            sort=[('created_at', -1)]
        )
        
        if not latest_assessment:
            return jsonify({'error': 'No assessment found. Please complete assessment first.'}), 400
        
        # Get user profile
        user_profile = {
            'company': current_user.company or 'Unknown',
            'industry': 'Not specified',
            'size': 'Not specified'
        }
        
        assessment_scores = latest_assessment.get('category_scores', {})
        
        # Generate AI recommendations
        recommendations = ai_service.generate_sdg_recommendations(user_profile, assessment_scores)
        
        # Save recommendations to database
        sdg_collection = db_manager.get_sdg_recommendations_collection()
        sdg_data = {
            'user_id': current_user.id,
            'recommendations': recommendations,
            'generated_at': datetime.utcnow(),
            'assessment_id': str(latest_assessment['_id'])
        }
        sdg_collection.insert_one(sdg_data)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
        
    except Exception as e:
        logging.error(f"Error generating SDG recommendations: {e}")
        return jsonify({'error': 'Failed to generate SDG recommendations'}), 500

@api_bp.route('/carbon/analyze', methods=['POST'])
@login_required
def analyze_carbon_footprint():
    """Analyze carbon footprint using AI"""
    try:
        data = request.get_json()
        carbon_data = data.get('carbon_data', {})
        
        if not carbon_data:
            return jsonify({'error': 'No carbon data provided'}), 400
        
        # Save carbon data using data service
        result = data_service.save_carbon_data(current_user.id, carbon_data)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        # Generate AI analysis
        user_profile = {
            'company': current_user.company or 'Unknown',
            'industry': data.get('industry', 'Not specified'),
            'size': data.get('size', 'Not specified')
        }
        
        analysis = ai_service.analyze_carbon_footprint(carbon_data, user_profile)
        
        return jsonify({
            'success': True,
            'carbon_id': result['carbon_id'],
            'total_emissions': result['total_emissions'],
            'analysis': analysis
        })
        
    except Exception as e:
        logging.error(f"Error analyzing carbon footprint: {e}")
        return jsonify({'error': 'Failed to analyze carbon footprint'}), 500

@api_bp.route('/insights/dashboard', methods=['GET'])
@login_required
def get_dashboard_insights():
    """Get AI-powered dashboard insights"""
    try:
        # Get dashboard data using data service
        dashboard_data = data_service.update_dashboard_data(current_user.id)
        
        # Generate AI insights
        insights = data_service.generate_ai_insights(current_user.id)
        
        return jsonify({
            'success': True,
            'dashboard_data': dashboard_data,
            'insights': insights
        })
        
    except Exception as e:
        logging.error(f"Error generating dashboard insights: {e}")
        return jsonify({'error': 'Failed to generate insights'}), 500

@api_bp.route('/user/progress', methods=['GET'])
@login_required
def get_user_progress():
    """Get user's sustainability progress"""
    try:
        progress = data_service.get_user_progress(current_user.id)
        
        return jsonify({
            'success': True,
            'progress': progress
        })
        
    except Exception as e:
        logging.error(f"Error getting user progress: {e}")
        return jsonify({'error': 'Failed to get user progress'}), 500

@api_bp.route('/dashboard/data', methods=['GET'])
@login_required
def get_dashboard_data():
    """Get real dashboard data for the user"""
    try:
        dashboard_data = data_service.update_dashboard_data(current_user.id)
        
        return jsonify({
            'success': True,
            'data': dashboard_data
        })
        
    except Exception as e:
        logging.error(f"Error getting dashboard data: {e}")
        return jsonify({'error': 'Failed to get dashboard data'}), 500

@api_bp.route('/reports/assessment', methods=['GET'])
@login_required
def generate_assessment_report():
    """Generate assessment report for the current user"""
    try:
        format_type = request.args.get('format', 'excel').lower()
        if format_type not in ['excel', 'csv']:
            return jsonify({'error': 'Invalid format. Use excel or csv'}), 400
        
        return report_service.generate_assessment_report(current_user.id, format_type)
        
    except Exception as e:
        logging.error(f"Error generating assessment report: {e}")
        return jsonify({'error': 'Failed to generate assessment report'}), 500

@api_bp.route('/reports/carbon', methods=['GET'])
@login_required
def generate_carbon_report():
    """Generate carbon footprint report for the current user"""
    try:
        format_type = request.args.get('format', 'excel').lower()
        if format_type not in ['excel', 'csv']:
            return jsonify({'error': 'Invalid format. Use excel or csv'}), 400
        
        return report_service.generate_carbon_report(current_user.id, format_type)
        
    except Exception as e:
        logging.error(f"Error generating carbon report: {e}")
        return jsonify({'error': 'Failed to generate carbon report'}), 500

@api_bp.route('/reports/sdg', methods=['GET'])
@login_required
def generate_sdg_report():
    """Generate SDG recommendations report for the current user"""
    try:
        format_type = request.args.get('format', 'excel').lower()
        if format_type not in ['excel', 'csv']:
            return jsonify({'error': 'Invalid format. Use excel or csv'}), 400
        
        return report_service.generate_sdg_report(current_user.id, format_type)
        
    except Exception as e:
        logging.error(f"Error generating SDG report: {e}")
        return jsonify({'error': 'Failed to generate SDG report'}), 500

@api_bp.route('/reports/comprehensive', methods=['GET'])
@login_required
def generate_comprehensive_report():
    """Generate comprehensive sustainability report for the current user"""
    try:
        format_type = request.args.get('format', 'excel').lower()
        if format_type not in ['excel', 'csv']:
            return jsonify({'error': 'Invalid format. Use excel or csv'}), 400
        
        return report_service.generate_comprehensive_report(current_user.id, format_type)
        
    except Exception as e:
        logging.error(f"Error generating comprehensive report: {e}")
        return jsonify({'error': 'Failed to generate comprehensive report'}), 500

@api_bp.route('/reports/admin', methods=['GET'])
@login_required
def generate_admin_report():
    """Generate admin report with all users' data (admin only)"""
    try:
        # Check if user is admin
        if not current_user.is_admin():
            return jsonify({'error': 'Admin access required'}), 403
        
        format_type = request.args.get('format', 'excel').lower()
        if format_type not in ['excel', 'csv']:
            return jsonify({'error': 'Invalid format. Use excel or csv'}), 400
        
        return report_service.generate_admin_report(format_type)
        
    except Exception as e:
        logging.error(f"Error generating admin report: {e}")
        return jsonify({'error': 'Failed to generate admin report'}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        db_manager.client.admin.command('ping')
        db_status = 'healthy'
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'
    
    # Check AI service
    try:
        ai_status = 'healthy' if ai_service.is_available else 'unhealthy'
    except Exception as e:
        ai_status = f'unhealthy: {str(e)}'
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'database': db_status,
            'ai_service': ai_status
        },
        'version': '1.0.0'
    })

@api_bp.route('/ai/status', methods=['GET'])
def get_ai_status():
    """Check AI service status"""
    return jsonify({
        'success': True,
        'ai_available': ai_service.is_available,
        'status': 'operational' if ai_service.is_available else 'fallback_mode'
    })

# SRI (Sustainability Readiness Index) endpoints
@api_bp.route('/sri/questions', methods=['GET'])
@login_required
def get_sri_questions():
    """Get SRI questions for the questionnaire"""
    try:
        category = request.args.get('category')
        questions = sri_service.get_questions(category)
        
        return jsonify({
            'success': True,
            'questions': questions
        })
    except Exception as e:
        logging.error(f"Error getting SRI questions: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/sri/submit', methods=['POST'])
@login_required
def submit_sri_assessment():
    """Submit SRI assessment and get scores"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        answers = data.get('answers', {})
        context = data.get('context', {})
        
        if not answers:
            return jsonify({
                'success': False,
                'error': 'No answers provided'
            }), 400
        
        # Submit assessment
        result = sri_service.submit_assessment(
            user_id=current_user.get_id(),
            answers=answers,
            context=context
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logging.error(f"Error submitting SRI assessment: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/sri/scores', methods=['GET'])
@login_required
def get_sri_scores():
    """Get user's SRI scores for dashboard"""
    try:
        scores = sri_service.get_user_sri_scores(current_user.get_id())
        
        return jsonify({
            'success': True,
            'scores': scores
        })
    except Exception as e:
        logging.error(f"Error getting SRI scores: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/sri/latest', methods=['GET'])
@login_required
def get_latest_sri_assessment():
    """Get user's latest SRI assessment"""
    try:
        assessment = sri_service.get_latest_assessment(current_user.get_id())
        
        if assessment:
            # Convert ObjectId to string for JSON serialization
            assessment['_id'] = str(assessment['_id'])
            assessment['user_id'] = str(assessment['user_id'])
            
            return jsonify({
                'success': True,
                'assessment': assessment
            })
        else:
            return jsonify({
                'success': True,
                'assessment': None
            })
    except Exception as e:
        logging.error(f"Error getting latest SRI assessment: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500