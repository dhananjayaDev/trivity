from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

from app.database import db_manager
from app.models import Assessment, CarbonData, User
from app.services.ai_service import ai_service
from app.services.sri_service import sri_service

class DataPersistenceService:
    """Service for managing user data persistence and progress tracking"""
    
    def __init__(self):
        self.users_collection = db_manager.get_users_collection()
        self.assessments_collection = db_manager.get_assessments_collection()
        self.carbon_collection = db_manager.get_carbon_data_collection()
        self.sdg_collection = db_manager.get_sdg_recommendations_collection()
    
    def save_assessment_data(self, user_id: str, assessment_data: Dict) -> Dict:
        """
        Save user assessment data and calculate scores
        
        Args:
            user_id: User's ID
            assessment_data: Assessment answers and metadata
            
        Returns:
            Dict containing saved assessment info
        """
        try:
            # Create assessment object
            assessment = Assessment()
            assessment.user_id = user_id
            assessment.answers = assessment_data.get('answers', {})
            assessment.status = 'completed'
            
            # Calculate scores (basic calculation for now)
            scores = self._calculate_assessment_scores(assessment.answers)
            assessment.total_score = scores['total']
            assessment.category_scores = scores['categories']
            
            # Save to database
            result = self.assessments_collection.insert_one(assessment.to_dict())
            
            # Update user profile completion
            self.users_collection.update_one(
                {'_id': user_id},
                {'$set': {'profile_completed': True, 'last_assessment': datetime.utcnow()}}
            )
            
            return {
                'success': True,
                'assessment_id': str(result.inserted_id),
                'scores': scores
            }
            
        except Exception as e:
            logging.error(f"Error saving assessment data: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_user_assessment_data(self, user_id: str) -> Optional[Dict]:
        """Get user's latest assessment data"""
        try:
            assessment = self.assessments_collection.find_one(
                {'user_id': user_id},
                sort=[('created_at', -1)]
            )
            return assessment
        except Exception as e:
            logging.error(f"Error getting assessment data: {e}")
            return None
    
    def save_carbon_data(self, user_id: str, carbon_data: Dict) -> Dict:
        """
        Save user carbon footprint data
        
        Args:
            user_id: User's ID
            carbon_data: Carbon emissions data
            
        Returns:
            Dict containing saved carbon data info
        """
        try:
            # Create carbon data object
            carbon_record = CarbonData()
            carbon_record.user_id = user_id
            carbon_record.electricity_emissions = carbon_data.get('electricity', 0)
            carbon_record.transportation_emissions = carbon_data.get('transportation', 0)
            carbon_record.refrigerant_emissions = carbon_data.get('refrigerants', 0)
            carbon_record.mobile_emissions = carbon_data.get('mobile', 0)
            carbon_record.combustion_emissions = carbon_data.get('combustion', 0)
            carbon_record.calculate_total_emissions()
            
            # Save to database
            result = self.carbon_collection.insert_one(carbon_record.to_dict())
            
            return {
                'success': True,
                'carbon_id': str(result.inserted_id),
                'total_emissions': carbon_record.total_emissions
            }
            
        except Exception as e:
            logging.error(f"Error saving carbon data: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_user_carbon_data(self, user_id: str) -> Optional[Dict]:
        """Get user's latest carbon data"""
        try:
            carbon_data = self.carbon_collection.find_one(
                {'user_id': user_id},
                sort=[('created_at', -1)]
            )
            return carbon_data
        except Exception as e:
            logging.error(f"Error getting carbon data: {e}")
            return None
    
    def save_sdg_recommendations(self, user_id: str, recommendations: List[Dict]) -> Dict:
        """Save AI-generated SDG recommendations"""
        try:
            sdg_data = {
                'user_id': user_id,
                'recommendations': recommendations,
                'generated_at': datetime.utcnow()
            }
            
            result = self.sdg_collection.insert_one(sdg_data)
            
            return {
                'success': True,
                'sdg_id': str(result.inserted_id)
            }
            
        except Exception as e:
            logging.error(f"Error saving SDG recommendations: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_user_sdg_recommendations(self, user_id: str) -> Optional[Dict]:
        """Get user's latest SDG recommendations"""
        try:
            sdg_data = self.sdg_collection.find_one(
                {'user_id': user_id},
                sort=[('generated_at', -1)]
            )
            return sdg_data
        except Exception as e:
            logging.error(f"Error getting SDG recommendations: {e}")
            return None
    
    def get_user_progress(self, user_id: str) -> Dict:
        """Get comprehensive user progress data"""
        try:
            # Check assessment completion
            assessment_count = self.assessments_collection.count_documents({'user_id': user_id})
            latest_assessment = self.get_user_assessment_data(user_id)
            
            # Check carbon data completion
            carbon_count = self.carbon_collection.count_documents({'user_id': user_id})
            latest_carbon = self.get_user_carbon_data(user_id)
            
            # Check SDG recommendations
            sdg_count = self.sdg_collection.count_documents({'user_id': user_id})
            latest_sdg = self.get_user_sdg_recommendations(user_id)
            
            # Get user profile
            user = self.users_collection.find_one({'_id': user_id})
            
            progress = {
                'assessment_completed': assessment_count > 0,
                'carbon_data_submitted': carbon_count > 0,
                'sdg_recommendations_generated': sdg_count > 0,
                'profile_completed': user.get('profile_completed', False) if user else False,
                'completion_percentage': 0,
                'latest_assessment': latest_assessment,
                'latest_carbon': latest_carbon,
                'latest_sdg': latest_sdg
            }
            
            # Calculate completion percentage
            completed_tasks = sum([
                progress['assessment_completed'],
                progress['carbon_data_submitted'],
                progress['sdg_recommendations_generated'],
                progress['profile_completed']
            ])
            progress['completion_percentage'] = (completed_tasks / 4) * 100
            
            return progress
            
        except Exception as e:
            logging.error(f"Error getting user progress: {e}")
            return {'completion_percentage': 0}
    
    def update_dashboard_data(self, user_id: str) -> Dict:
        """Get all data needed for dashboard display"""
        try:
            progress = self.get_user_progress(user_id)
            
            dashboard_data = {
                'user_progress': progress,
                'sri_scores': {
                    'total': 0,
                    'categories': {
                        'general': 0,
                        'environment': 0,
                        'social': 0,
                        'governance': 0
                    }
                },
                'carbon_data': {
                    'total_emissions': 0,
                    'breakdown': {}
                },
                'sdg_recommendations': [],
                'ai_insights': {}
            }
            
            # Get SRI scores from SRI service
            sri_data = sri_service.get_user_sri_scores(user_id)
            dashboard_data['sri_scores'] = {
                'total': sri_data['total'],
                'categories': sri_data['categories']
            }
            dashboard_data['has_sri_assessment'] = sri_data['has_assessment']
            dashboard_data['trophy_level'] = sri_data['trophy_level']
            dashboard_data['last_sri_date'] = sri_data['last_assessment_date']
            
            # Add AI analysis if available
            if sri_data.get('ai_analysis'):
                dashboard_data['ai_analysis'] = sri_data['ai_analysis']
            
            # Get carbon data
            if progress['latest_carbon']:
                carbon = progress['latest_carbon']
                dashboard_data['carbon_data'] = {
                    'total_emissions': carbon.get('total_emissions', 0),
                    'breakdown': {
                        'electricity': carbon.get('electricity_emissions', 0),
                        'transportation': carbon.get('transportation_emissions', 0),
                        'refrigerants': carbon.get('refrigerant_emissions', 0),
                        'mobile': carbon.get('mobile_emissions', 0),
                        'combustion': carbon.get('combustion_emissions', 0)
                    }
                }
            
            # Get SDG recommendations
            if progress['latest_sdg']:
                dashboard_data['sdg_recommendations'] = progress['latest_sdg'].get('recommendations', [])
            
            return dashboard_data
            
        except Exception as e:
            logging.error(f"Error updating dashboard data: {e}")
            return {}
    
    def _calculate_assessment_scores(self, answers: Dict) -> Dict:
        """Calculate assessment scores from answers"""
        # This is a simplified scoring algorithm
        # In a real implementation, this would be more sophisticated
        
        total_score = 0
        category_scores = {
            'general': 0,
            'environment': 0,
            'social': 0,
            'governance': 0
        }
        
        # Count total questions answered
        total_questions = len(answers)
        if total_questions == 0:
            return {'total': 0, 'categories': category_scores}
        
        # Calculate scores based on answers
        for question_id, answer in answers.items():
            if isinstance(answer, (int, float)):
                score = min(max(answer, 0), 100)  # Clamp between 0-100
            elif isinstance(answer, str):
                # Convert string answers to scores
                score_map = {
                    'strongly_agree': 100,
                    'agree': 80,
                    'neutral': 60,
                    'disagree': 40,
                    'strongly_disagree': 20,
                    'yes': 100,
                    'no': 0,
                    'sometimes': 60,
                    'often': 80,
                    'always': 100,
                    'never': 0
                }
                score = score_map.get(answer.lower(), 50)
            else:
                score = 50  # Default score
            
            total_score += score
            
            # Categorize questions (simplified)
            if 'env' in question_id.lower() or 'environment' in question_id.lower():
                category_scores['environment'] += score
            elif 'social' in question_id.lower() or 'community' in question_id.lower():
                category_scores['social'] += score
            elif 'gov' in question_id.lower() or 'policy' in question_id.lower():
                category_scores['governance'] += score
            else:
                category_scores['general'] += score
        
        # Calculate averages
        total_score = total_score / total_questions
        
        # Calculate category averages (simplified)
        for category in category_scores:
            category_questions = max(1, total_questions // 4)  # Rough estimate
            category_scores[category] = category_scores[category] / category_questions
        
        return {
            'total': round(total_score, 1),
            'categories': {k: round(v, 1) for k, v in category_scores.items()}
        }
    
    def generate_ai_insights(self, user_id: str) -> Dict:
        """Generate AI insights based on user data"""
        try:
            progress = self.get_user_progress(user_id)
            
            # Prepare data for AI analysis
            user_data = {
                'profile': {
                    'company': 'Unknown',  # Will be filled from user profile
                    'name': 'User',
                    'email': 'user@example.com'
                }
            }
            
            if progress['latest_assessment']:
                user_data['assessment'] = {
                    'total_score': progress['latest_assessment'].get('total_score', 0),
                    'category_scores': progress['latest_assessment'].get('category_scores', {}),
                    'created_at': progress['latest_assessment'].get('created_at')
                }
            
            if progress['latest_carbon']:
                user_data['carbon'] = {
                    'total_emissions': progress['latest_carbon'].get('total_emissions', 0),
                    'electricity': progress['latest_carbon'].get('electricity_emissions', 0),
                    'transportation': progress['latest_carbon'].get('transportation_emissions', 0),
                    'created_at': progress['latest_carbon'].get('created_at')
                }
            
            # Generate AI insights
            insights = ai_service.generate_sustainability_insights(user_data)
            return insights
            
        except Exception as e:
            logging.error(f"Error generating AI insights: {e}")
            return ai_service._get_fallback_insights()

# Global data persistence service instance
data_service = DataPersistenceService()
