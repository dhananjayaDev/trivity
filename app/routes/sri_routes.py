"""
SRI (Sustainability Readiness Index) Routes
Handles SRI questionnaire and scoring endpoints
"""

from flask import Blueprint, request, jsonify, render_template
from flask_login import login_required, current_user
import logging
from bson import ObjectId

from app.services.sri_service import sri_service

# Create SRI blueprint
sri_bp = Blueprint('sri', __name__, url_prefix='/api/sri')

@sri_bp.route('/questions', methods=['GET'])
@login_required
def get_questions():
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

@sri_bp.route('/submit', methods=['POST'])
@login_required
def submit_assessment():
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

@sri_bp.route('/scores', methods=['GET'])
@login_required
def get_scores():
    """Get user's SRI scores"""
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

@sri_bp.route('/latest', methods=['GET'])
@login_required
def get_latest_assessment():
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

@sri_bp.route('/history', methods=['GET'])
@login_required
def get_assessment_history():
    """Get user's SRI assessment history"""
    try:
        history = sri_service.get_assessment_history(current_user.get_id())
        
        # Convert ObjectIds to strings for JSON serialization
        for assessment in history:
            assessment['_id'] = str(assessment['_id'])
            assessment['user_id'] = str(assessment['user_id'])
        
        return jsonify({
            'success': True,
            'history': history
        })
    except Exception as e:
        logging.error(f"Error getting SRI assessment history: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sri_bp.route('/questionnaire', methods=['GET'])
@login_required
def questionnaire_page():
    """Render SRI questionnaire page"""
    return render_template('sri_questionnaire.html')

@sri_bp.route('/results', methods=['GET'])
@login_required
def results_page():
    """Render SRI results page"""
    return render_template('sri_results.html')
