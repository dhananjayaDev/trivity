import google.generativeai as genai
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

from app.config import Config

class GeminiAIService:
    """Gemini AI service for sustainability analysis and recommendations"""
    
    def __init__(self):
        """Initialize Gemini AI service"""
        try:
            genai.configure(api_key=Config.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            self.is_available = True
            logging.info("Gemini AI service initialized successfully with gemini-2.0-flash-exp")
        except Exception as e:
            logging.error(f"Failed to initialize Gemini AI service: {e}")
            self.is_available = False
    
    def analyze_sustainability_assessment(self, user_profile: Dict, assessment_answers: Dict) -> Dict:
        """
        Analyze sustainability assessment answers and provide scoring
        
        Args:
            user_profile: User's company profile and information
            assessment_answers: User's answers to sustainability questions
            
        Returns:
            Dict containing scores, insights, and recommendations
        """
        if not self.is_available:
            return self._get_fallback_assessment()
        
        try:
            prompt = self._build_assessment_prompt(user_profile, assessment_answers)
            response = self.model.generate_content(prompt)
            
            # Parse AI response
            analysis = self._parse_assessment_response(response.text)
            return analysis
            
        except Exception as e:
            logging.error(f"Error in sustainability assessment analysis: {e}")
            return self._get_fallback_assessment()

    def analyze_sri_assessment(self, assessment_data: Dict) -> Dict:
        """
        Analyze SRI assessment data and provide AI-powered insights
        
        Args:
            assessment_data: Dictionary containing answers, scores, and context
            
        Returns:
            Dict containing AI analysis and recommendations
        """
        if not self.is_available:
            return self._get_fallback_sri_analysis(assessment_data)
        
        try:
            prompt = self._build_sri_analysis_prompt(assessment_data)
            response = self.model.generate_content(prompt)
            
            # Parse AI response
            analysis = self._parse_sri_analysis_response(response.text)
            return analysis
            
        except Exception as e:
            logging.error(f"Error in SRI assessment analysis: {e}")
            return self._get_fallback_sri_analysis(assessment_data)
    
    def generate_sdg_recommendations(self, user_profile: Dict, assessment_scores: Dict) -> List[Dict]:
        """
        Generate personalized SDG recommendations based on user profile and scores
        
        Args:
            user_profile: User's company profile
            assessment_scores: User's sustainability assessment scores
            
        Returns:
            List of recommended SDGs with explanations
        """
        if not self.is_available:
            return self._get_fallback_sdg_recommendations()
        
        try:
            prompt = self._build_sdg_prompt(user_profile, assessment_scores)
            response = self.model.generate_content(prompt)
            
            # Parse AI response
            recommendations = self._parse_sdg_response(response.text)
            return recommendations
            
        except Exception as e:
            logging.error(f"Error in SDG recommendations generation: {e}")
            return self._get_fallback_sdg_recommendations()
    
    def analyze_carbon_footprint(self, carbon_data: Dict, user_profile: Dict) -> Dict:
        """
        Analyze carbon footprint data and provide insights
        
        Args:
            carbon_data: User's carbon emissions data
            user_profile: User's company profile
            
        Returns:
            Dict containing analysis, insights, and improvement suggestions
        """
        if not self.is_available:
            return self._get_fallback_carbon_analysis()
        
        try:
            prompt = self._build_carbon_prompt(carbon_data, user_profile)
            response = self.model.generate_content(prompt)
            
            # Parse AI response
            analysis = self._parse_carbon_response(response.text)
            return analysis
            
        except Exception as e:
            logging.error(f"Error in carbon footprint analysis: {e}")
            return self._get_fallback_carbon_analysis()
    
    def generate_sustainability_insights(self, user_data: Dict) -> Dict:
        """
        Generate comprehensive sustainability insights for dashboard
        
        Args:
            user_data: Combined user profile, assessment, and carbon data
            
        Returns:
            Dict containing personalized insights and recommendations
        """
        if not self.is_available:
            return self._get_fallback_insights()
        
        try:
            prompt = self._build_insights_prompt(user_data)
            response = self.model.generate_content(prompt)
            
            # Parse AI response
            insights = self._parse_insights_response(response.text)
            return insights
            
        except Exception as e:
            logging.error(f"Error in sustainability insights generation: {e}")
            return self._get_fallback_insights()
    
    def _build_assessment_prompt(self, user_profile: Dict, assessment_answers: Dict) -> str:
        """Build prompt for sustainability assessment analysis"""
        return f"""
        You are a sustainability expert AI analyzing a company's sustainability readiness assessment.
        
        Company Profile:
        - Name: {user_profile.get('company', 'Unknown')}
        - Industry: {user_profile.get('industry', 'Not specified')}
        - Size: {user_profile.get('size', 'Not specified')}
        - Location: {user_profile.get('location', 'Not specified')}
        
        Assessment Answers:
        {json.dumps(assessment_answers, indent=2)}
        
        Please analyze these answers and provide:
        1. Overall sustainability readiness score (0-100)
        2. Category scores for: General, Environment, Social, Governance (0-100 each)
        3. Key strengths and weaknesses
        4. Priority improvement areas
        5. Next steps recommendations
        
        Respond in JSON format with this structure:
        {{
            "total_score": 75,
            "category_scores": {{
                "general": 80,
                "environment": 70,
                "social": 75,
                "governance": 80
            }},
            "strengths": ["strength1", "strength2"],
            "weaknesses": ["weakness1", "weakness2"],
            "priority_areas": ["area1", "area2"],
            "recommendations": ["recommendation1", "recommendation2"],
            "interpretation": "Overall assessment interpretation"
        }}
        """
    
    def _build_sdg_prompt(self, user_profile: Dict, assessment_scores: Dict) -> str:
        """Build prompt for SDG recommendations"""
        return f"""
        You are a sustainability expert AI recommending UN SDG goals for a company.
        
        Company Profile:
        - Name: {user_profile.get('company', 'Unknown')}
        - Industry: {user_profile.get('industry', 'Not specified')}
        - Size: {user_profile.get('size', 'Not specified')}
        
        Assessment Scores:
        {json.dumps(assessment_scores, indent=2)}
        
        Recommend the top 2 most relevant UN SDG goals for this company based on their profile and assessment scores.
        
        Respond in JSON format with this structure:
        {{
            "primary_goal": {{
                "number": 7,
                "title": "Affordable and Clean Energy",
                "description": "Why this goal is relevant",
                "priority": "high",
                "opportunities": ["opportunity1", "opportunity2"]
            }},
            "secondary_goal": {{
                "number": 13,
                "title": "Climate Action",
                "description": "Why this goal is relevant",
                "priority": "medium",
                "opportunities": ["opportunity1", "opportunity2"]
            }}
        }}
        """
    
    def _build_carbon_prompt(self, carbon_data: Dict, user_profile: Dict) -> str:
        """Build prompt for carbon footprint analysis"""
        return f"""
        You are a sustainability expert AI analyzing carbon footprint data.
        
        Company Profile:
        - Name: {user_profile.get('company', 'Unknown')}
        - Industry: {user_profile.get('industry', 'Not specified')}
        - Size: {user_profile.get('size', 'Not specified')}
        
        Carbon Footprint Data:
        {json.dumps(carbon_data, indent=2)}
        
        Analyze this carbon footprint data and provide:
        1. Overall assessment of the carbon footprint
        2. Key insights about emissions sources
        3. Comparison to industry benchmarks
        4. Specific improvement recommendations
        5. Priority actions
        
        Respond in JSON format with this structure:
        {{
            "overall_assessment": "Assessment of carbon footprint",
            "key_insights": ["insight1", "insight2"],
            "industry_comparison": "Comparison to industry average",
            "improvement_recommendations": ["rec1", "rec2"],
            "priority_actions": ["action1", "action2"],
            "estimated_reduction_potential": "X% reduction possible"
        }}
        """
    
    def _build_insights_prompt(self, user_data: Dict) -> str:
        """Build prompt for comprehensive sustainability insights"""
        return f"""
        You are a sustainability expert AI providing comprehensive insights for a company's sustainability dashboard.
        
        Company Data:
        {json.dumps(user_data, indent=2)}
        
        Provide personalized sustainability insights including:
        1. Overall sustainability performance summary
        2. Key achievements and milestones
        3. Areas needing attention
        4. Personalized recommendations
        5. Next quarter priorities
        
        Respond in JSON format with this structure:
        {{
            "performance_summary": "Overall performance summary",
            "achievements": ["achievement1", "achievement2"],
            "attention_areas": ["area1", "area2"],
            "personalized_recommendations": ["rec1", "rec2"],
            "next_quarter_priorities": ["priority1", "priority2"],
            "motivational_message": "Encouraging message for the user"
        }}
        """
    
    def _parse_assessment_response(self, response_text: str) -> Dict:
        """Parse AI response for assessment analysis"""
        try:
            # Extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        except Exception as e:
            logging.error(f"Error parsing assessment response: {e}")
            return self._get_fallback_assessment()
    
    def _parse_sdg_response(self, response_text: str) -> List[Dict]:
        """Parse AI response for SDG recommendations"""
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            data = json.loads(json_str)
            return [data.get('primary_goal', {}), data.get('secondary_goal', {})]
        except Exception as e:
            logging.error(f"Error parsing SDG response: {e}")
            return self._get_fallback_sdg_recommendations()
    
    def _parse_carbon_response(self, response_text: str) -> Dict:
        """Parse AI response for carbon analysis"""
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        except Exception as e:
            logging.error(f"Error parsing carbon response: {e}")
            return self._get_fallback_carbon_analysis()
    
    def _parse_insights_response(self, response_text: str) -> Dict:
        """Parse AI response for insights"""
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        except Exception as e:
            logging.error(f"Error parsing insights response: {e}")
            return self._get_fallback_insights()
    
    def _get_fallback_assessment(self) -> Dict:
        """Fallback assessment when AI is unavailable"""
        return {
            "total_score": 75,
            "category_scores": {
                "general": 80,
                "environment": 70,
                "social": 75,
                "governance": 80
            },
            "strengths": ["Basic sustainability awareness", "Some environmental initiatives"],
            "weaknesses": ["Limited social impact programs", "Governance needs improvement"],
            "priority_areas": ["Environmental management", "Social responsibility"],
            "recommendations": ["Implement environmental policies", "Develop social impact programs"],
            "interpretation": "Good foundation with room for improvement in environmental and social areas."
        }
    
    def _get_fallback_sdg_recommendations(self) -> List[Dict]:
        """Fallback SDG recommendations when AI is unavailable"""
        return [
            {
                "number": 7,
                "title": "Affordable and Clean Energy",
                "description": "Focus on renewable energy adoption and energy efficiency",
                "priority": "high",
                "opportunities": ["Solar panel installation", "Energy efficiency audits"]
            },
            {
                "number": 13,
                "title": "Climate Action",
                "description": "Implement climate change mitigation strategies",
                "priority": "medium",
                "opportunities": ["Carbon offset programs", "Climate risk assessment"]
            }
        ]
    
    def _get_fallback_carbon_analysis(self) -> Dict:
        """Fallback carbon analysis when AI is unavailable"""
        return {
            "overall_assessment": "Moderate carbon footprint with improvement potential",
            "key_insights": ["Electricity is the largest emission source", "Transportation emissions are significant"],
            "industry_comparison": "Slightly above industry average",
            "improvement_recommendations": ["Switch to renewable energy", "Implement telecommuting"],
            "priority_actions": ["Energy audit", "Transportation optimization"],
            "estimated_reduction_potential": "25% reduction possible"
        }
    
    def _get_fallback_insights(self) -> Dict:
        """Fallback insights when AI is unavailable"""
        return {
            "performance_summary": "Good progress on sustainability initiatives",
            "achievements": ["Completed initial assessment", "Identified key focus areas"],
            "attention_areas": ["Environmental impact", "Social responsibility"],
            "personalized_recommendations": ["Focus on energy efficiency", "Develop community programs"],
            "next_quarter_priorities": ["Implement energy audit", "Launch social impact program"],
            "motivational_message": "Great start on your sustainability journey! Keep up the excellent work."
        }

    def _build_sri_analysis_prompt(self, assessment_data: Dict) -> str:
        """Build prompt for SRI analysis"""
        answers = assessment_data.get('answers', {})
        category_scores = assessment_data.get('category_scores', {})
        total_score = assessment_data.get('total_score', 0)
        context = assessment_data.get('context', {})
        
        prompt = f"""
        Analyze this Sustainability Readiness Index (SRI) assessment and provide comprehensive insights.
        
        Assessment Data:
        - Total Score: {total_score}/100
        - Category Scores: {category_scores}
        - Industry: {context.get('industry', 'Not specified')}
        - Company Size: {context.get('company_size', 'Not specified')}
        - Location: {context.get('location', 'Not specified')}
        
        Answers:
        {json.dumps(answers, indent=2)}
        
        Please provide a JSON response with the following structure:
        {{
            "level": "Beginner/Developing/Intermediate/Advanced/Expert",
            "overall_assessment": "Brief overall assessment of sustainability readiness",
            "strengths": ["List of key strengths identified"],
            "weaknesses": ["List of areas needing improvement"],
            "priority_recommendations": ["Top 3-5 actionable recommendations"],
            "category_insights": {{
                "general": "Insights for general sustainability practices",
                "environment": "Insights for environmental practices",
                "social": "Insights for social practices",
                "governance": "Insights for governance practices"
            }},
            "next_steps": ["Immediate next steps to take"],
            "long_term_vision": "Long-term sustainability vision and goals",
            "industry_benchmark": "How this compares to industry standards",
            "motivational_message": "Encouraging message for the user"
        }}
        """
        return prompt

    def _parse_sri_analysis_response(self, response_text: str) -> Dict:
        """Parse AI response for SRI analysis"""
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        except Exception as e:
            logging.error(f"Error parsing SRI analysis response: {e}")
            return self._get_fallback_sri_analysis({})

    def _get_fallback_sri_analysis(self, assessment_data: Dict) -> Dict:
        """Fallback SRI analysis when AI is unavailable"""
        category_scores = assessment_data.get('category_scores', {})
        total_score = assessment_data.get('total_score', 0)
        
        if total_score >= 80:
            level = "Advanced"
            assessment = "Excellent sustainability practices with strong foundation"
        elif total_score >= 60:
            level = "Intermediate"
            assessment = "Good sustainability foundation with room for improvement"
        elif total_score >= 40:
            level = "Developing"
            assessment = "Basic sustainability practices in place, needs expansion"
        else:
            level = "Beginner"
            assessment = "Early stage of sustainability journey, significant potential"
        
        return {
            "level": level,
            "overall_assessment": assessment,
            "strengths": self._identify_sri_strengths(category_scores),
            "weaknesses": self._identify_sri_weaknesses(category_scores),
            "priority_recommendations": [
                "Develop comprehensive sustainability policy",
                "Implement regular sustainability reporting",
                "Engage stakeholders in sustainability initiatives"
            ],
            "category_insights": {
                "general": "Focus on building organizational commitment",
                "environment": "Implement environmental management systems",
                "social": "Develop social impact programs",
                "governance": "Strengthen sustainability governance"
            },
            "next_steps": [
                "Create sustainability action plan",
                "Assign sustainability responsibilities",
                "Set measurable sustainability goals"
            ],
            "long_term_vision": "Become a sustainability leader in your industry",
            "industry_benchmark": "Above average for your industry sector",
            "motivational_message": "Great progress on your sustainability journey! Keep building momentum."
        }

    def _identify_sri_strengths(self, category_scores: Dict) -> List[str]:
        """Identify SRI strengths based on category scores"""
        strengths = []
        for category, score in category_scores.items():
            if score >= 70:
                strengths.append(f"Strong {category.title()} practices")
        return strengths if strengths else ["Basic sustainability awareness"]

    def _identify_sri_weaknesses(self, category_scores: Dict) -> List[str]:
        """Identify SRI weaknesses based on category scores"""
        weaknesses = []
        for category, score in category_scores.items():
            if score < 50:
                weaknesses.append(f"Needs improvement in {category.title()} practices")
        return weaknesses if weaknesses else ["Overall sustainability maturity"]

# Global AI service instance
ai_service = GeminiAIService()
