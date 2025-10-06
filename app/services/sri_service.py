"""
SRI (Sustainability Readiness Index) Service
Handles SRI questionnaire, scoring, and AI-powered analysis
"""

import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from bson import ObjectId

from app.database import db_manager
from app.models import SRIAssessment, SRIQuestion
from app.services.ai_service import ai_service

class SRIService:
    """Service for managing SRI assessments and scoring"""

    def __init__(self):
        self.sri_collection = db_manager.get_sri_assessments_collection()
        # No need for questions collection since we use hardcoded questions


    def _get_default_questions(self) -> List[Dict]:
        """Get default SRI questions"""
        return [
            # General Questions (4 questions)
            {
                "id": "general_1",
                "text": "Is Sustainability important in your company?",
                "category": "general",
                "weight": 1.5,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "general_2",
                "text": "Does your company have a team to look at Sustainability aspects?",
                "category": "general",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "general_3",
                "text": "Do you think Sustainability is crucial for every company?",
                "category": "general",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "general_4",
                "text": "Does your company have a clear understanding of what ESG means?",
                "category": "general",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            
            # Environment Questions (5 questions)
            {
                "id": "environment_1",
                "text": "Is your company aware of its carbon footprint?",
                "category": "environment",
                "weight": 1.5,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "environment_2",
                "text": "Are there steps planned to reduce carbon footprint?",
                "category": "environment",
                "weight": 1.5,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "environment_3",
                "text": "Is your company aware of its energy usage?",
                "category": "environment",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "environment_4",
                "text": "Is your company aware of its impact on air and water quality?",
                "category": "environment",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "environment_5",
                "text": "Are you aware of the natural resources used by your company?",
                "category": "environment",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            
            # Social Questions (8 questions)
            {
                "id": "social_1",
                "text": "Does your company have equal employment opportunities for both genders?",
                "category": "social",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "social_2",
                "text": "Are you satisfied with the company's culture?",
                "category": "social",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "social_3",
                "text": "Is your company aware of the importance of mental wellbeing?",
                "category": "social",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "social_4",
                "text": "Are you satisfied with the company's working environment?",
                "category": "social",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "social_5",
                "text": "Does your company provide equal career advancement opportunities?",
                "category": "social",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "social_6",
                "text": "Do you feel safe working in your company?",
                "category": "social",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "social_7",
                "text": "Are the company policies fair to employees?",
                "category": "social",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "social_8",
                "text": "Do company policies keep up with the times?",
                "category": "social",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            
            # Governance Questions (10 questions)
            {
                "id": "governance_1",
                "text": "Can you trust management to handle difficult situations fairly?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "governance_2",
                "text": "Does your company have a balanced board composition?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "governance_3",
                "text": "Is management aware of the importance of corporate culture?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "governance_4",
                "text": "Is management aware of any unethical behavior?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "governance_5",
                "text": "Does your company have a board of directors to hold CEO accountable?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "governance_6",
                "text": "Does your company have PDPA policies?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "governance_7",
                "text": "Does your company have a team to manage data protection?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "governance_8",
                "text": "Does your company prioritize diversity and inclusivity?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "governance_9",
                "text": "Can you trust management to make ethical decisions?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            },
            {
                "id": "governance_10",
                "text": "Are there policies to prevent corruption and bribery?",
                "category": "governance",
                "weight": 1.0,
                "options": [
                    {"value": "yes", "score": 100, "text": "Yes"},
                    {"value": "no", "score": 0, "text": "No"}
                ],
                "required": True
            }
        ]

    def get_questions(self, category: str = None) -> List[Dict]:
        """Get SRI questions, optionally filtered by category"""
        try:
            # Use hardcoded questions instead of database
            questions = self._get_default_questions()
            
            if category:
                questions = [q for q in questions if q['category'] == category]
            
            logging.info(f"Returning {len(questions)} questions for category: {category or 'all'}")
            return questions
        except Exception as e:
            logging.error(f"Error getting SRI questions: {e}")
            return []

    def submit_assessment(self, user_id: str, answers: Dict, context: Dict) -> Dict:
        """Submit SRI assessment and calculate scores using AI"""
        try:
            # Debug: Log what we're receiving
            logging.info(f"Received answers: {answers}")
            logging.info(f"Received context: {context}")
            
            # Get questions for scoring
            questions = self.get_questions()
            question_map = {q['id']: q for q in questions}
            
            # Debug: Log question map
            logging.info(f"Question map keys: {list(question_map.keys())[:5]}...")
            logging.info(f"Total questions in map: {len(question_map)}")
            logging.info(f"Answers received: {list(answers.keys())}")

            # Calculate category scores
            category_scores = self._calculate_category_scores(answers, question_map)
            
            # Calculate total score
            total_score = sum(category_scores.values()) / len(category_scores)
            
            # Debug: Log calculated scores
            logging.info(f"Calculated category scores: {category_scores}")
            logging.info(f"Calculated total score: {total_score}")
            
            # Determine trophy level
            trophy_level = self._get_trophy_level(total_score)

            # Generate AI analysis (synchronous for now)
            ai_analysis = self._generate_ai_analysis_sync(answers, category_scores, context)

            # Create assessment document
            assessment_doc = {
                'user_id': ObjectId(user_id),
                'total_score': total_score,
                'category_scores': category_scores,
                'answers': answers,
                'industry': context.get('industry', ''),
                'company_size': context.get('company_size', ''),
                'location': context.get('location', ''),
                'trophy_level': trophy_level,
                'has_assessment': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'status': 'completed',
                'ai_analysis': ai_analysis
            }

            # Save to database
            result = self.sri_collection.insert_one(assessment_doc)
            assessment_id = str(result.inserted_id)
            logging.info(f"Assessment saved to database with ID: {assessment_id}")

            # Update user's profile completion status
            from app.database import db_manager
            users_collection = db_manager.get_users_collection()
            users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {
                    'profile_completed': True,
                    'sustainability_profile.last_sri_date': datetime.utcnow(),
                    'sustainability_profile.sri_score': total_score
                }}
            )

            logging.info(f"SRI assessment submitted for user {user_id} with ID {assessment_id}")
            
            return {
                'success': True,
                'assessment_id': assessment_id,
                'total_score': total_score,
                'category_scores': category_scores,
                'trophy_level': trophy_level,
                'has_assessment': True,
                'ai_analysis': ai_analysis
            }

        except Exception as e:
            logging.error(f"Error submitting SRI assessment for user {user_id}: {e}")
            return {'success': False, 'error': str(e)}

    def _calculate_category_scores(self, answers: Dict, question_map: Dict) -> Dict:
        """Calculate scores for each category with proper weighting"""
        categories = {
            'general': {'total_weight': 0.0, 'weighted_score': 0.0},
            'environment': {'total_weight': 0.0, 'weighted_score': 0.0},
            'social': {'total_weight': 0.0, 'weighted_score': 0.0},
            'governance': {'total_weight': 0.0, 'weighted_score': 0.0}
        }

        logging.info(f"Processing {len(answers)} answers")
        
        for question_id, answer in answers.items():
            if question_id in question_map:
                question = question_map[question_id]
                category = question['category']
                weight = question['weight']
                
                # Find the score for this answer
                score = 0
                for option in question['options']:
                    if option['value'] == answer:
                        score = option['score']
                        break
                
                logging.info(f"Question {question_id}: answer={answer}, score={score}, weight={weight}, category={category}")
                
                # Add weighted score
                categories[category]['weighted_score'] += score * weight
                categories[category]['total_weight'] += weight
            else:
                logging.warning(f"Question {question_id} not found in question map")

        # Calculate final category scores
        category_scores = {}
        for category in categories:
            if categories[category]['total_weight'] > 0:
                category_scores[category] = (
                    categories[category]['weighted_score'] / 
                    categories[category]['total_weight']
                )
            else:
                category_scores[category] = 0.0

        return category_scores

    def _get_trophy_level(self, total_score: float) -> str:
        """Determine trophy level based on total score"""
        if total_score >= 75:
            return 'champion'      # 75-100%
        elif total_score >= 50:
            return 'leader'        # 50-74%
        elif total_score >= 25:
            return 'advocate'      # 25-49%
        else:
            return None            # 0-24% - No trophy

    def _generate_ai_analysis_sync(self, answers: Dict, category_scores: Dict, context: Dict) -> Dict:
        """Generate AI-powered analysis of the assessment (synchronous)"""
        try:
            # Prepare data for AI analysis
            analysis_data = {
                'answers': answers,
                'category_scores': category_scores,
                'total_score': sum(category_scores.values()) / len(category_scores),
                'context': context
            }

            # Use AI service to generate analysis (synchronous call)
            if ai_service.is_available:
                analysis = ai_service.analyze_sri_assessment(analysis_data)
                return analysis
            else:
                logging.warning("AI service not available, using fallback analysis")
                return self._get_fallback_analysis(category_scores)

        except Exception as e:
            logging.error(f"Error generating AI analysis: {e}")
            return self._get_fallback_analysis(category_scores)

    def _get_fallback_analysis(self, category_scores: Dict) -> Dict:
        """Fallback analysis when AI is not available"""
        total_score = sum(category_scores.values()) / len(category_scores)
        
        if total_score >= 80:
            level = "Advanced"
            recommendation = "Excellent sustainability practices. Consider becoming a sustainability leader in your industry."
        elif total_score >= 60:
            level = "Intermediate"
            recommendation = "Good foundation. Focus on strengthening weaker areas and expanding initiatives."
        elif total_score >= 40:
            level = "Developing"
            recommendation = "Basic sustainability practices in place. Develop comprehensive policies and programs."
        else:
            level = "Beginner"
            recommendation = "Start with basic sustainability practices and gradually build comprehensive programs."

        return {
            'level': level,
            'recommendation': recommendation,
            'strengths': self._identify_strengths(category_scores),
            'improvements': self._identify_improvements(category_scores)
        }

    def _identify_strengths(self, category_scores: Dict) -> List[str]:
        """Identify strongest categories"""
        strengths = []
        for category, score in category_scores.items():
            if score >= 70:
                strengths.append(f"Strong {category.title()} practices")
        return strengths

    def _identify_improvements(self, category_scores: Dict) -> List[str]:
        """Identify categories needing improvement"""
        improvements = []
        for category, score in category_scores.items():
            if score < 50:
                improvements.append(f"Improve {category.title()} practices")
        return improvements

    def get_latest_assessment(self, user_id: str) -> Optional[Dict]:
        """Get the latest SRI assessment for a user"""
        try:
            logging.info(f"Searching for assessment with user_id: {user_id}")
            assessment = self.sri_collection.find_one(
                {'user_id': ObjectId(user_id)},
                sort=[('created_at', -1)]
            )
            if assessment:
                logging.info(f"Found assessment in database: {assessment.get('_id')}")
            else:
                logging.info("No assessment found in database")
            return assessment
        except Exception as e:
            logging.error(f"Error getting latest SRI assessment for user {user_id}: {e}")
            return None

    def get_user_sri_scores(self, user_id: str) -> Dict:
        """Get user's SRI scores for dashboard display"""
        try:
            logging.info(f"Getting SRI scores for user: {user_id}")
            assessment = self.get_latest_assessment(user_id)
            if assessment:
                logging.info(f"Found assessment: total_score={assessment.get('total_score')}, categories={assessment.get('category_scores')}")
                return {
                    'total': assessment['total_score'],
                    'categories': assessment['category_scores'],
                    'trophy_level': assessment.get('trophy_level'),
                    'has_assessment': assessment.get('has_assessment', True),
                    'last_assessment_date': assessment.get('created_at'),
                    'ai_analysis': assessment.get('ai_analysis', {})
                }
            else:
                logging.info("No assessment found for user")
                # Return zero scores if no assessment exists
                return {
                    'total': 0.0,
                    'categories': {
                        'general': 0.0,
                        'environment': 0.0,
                        'social': 0.0,
                        'governance': 0.0
                    },
                    'trophy_level': None,
                    'has_assessment': False,
                    'last_assessment_date': None,
                    'ai_analysis': {}
                }
        except Exception as e:
            logging.error(f"Error getting SRI scores for user {user_id}: {e}")
            return {
                'total': 0.0,
                'categories': {
                    'general': 0.0,
                    'environment': 0.0,
                    'social': 0.0,
                    'governance': 0.0
                },
                'trophy_level': None,
                'has_assessment': False,
                'last_assessment_date': None,
                'ai_analysis': {}
            }

    def get_assessment_history(self, user_id: str) -> List[Dict]:
        """Get user's assessment history"""
        try:
            assessments = list(self.sri_collection.find(
                {'user_id': ObjectId(user_id)}
            ).sort('created_at', -1))
            return assessments
        except Exception as e:
            logging.error(f"Error getting assessment history for user {user_id}: {e}")
            return []

# Create service instance
sri_service = SRIService()
