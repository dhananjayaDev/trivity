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
        You are a sustainability expert AI recommending UN SDG goals for a company based on their sustainability readiness assessment.
        
        Company Profile:
        - Name: {user_profile.get('company', 'Unknown')}
        - Industry: {user_profile.get('industry', 'Not specified')}
        - Size: {user_profile.get('size', 'Not specified')}
        
        Sustainability Assessment Scores (0-100%):
        - Environmental Management: {assessment_scores.get('environmental_management', 0):.1f}%
        - Social Responsibility: {assessment_scores.get('social_responsibility', 0):.1f}%
        - Economic Sustainability: {assessment_scores.get('economic_sustainability', 0):.1f}%
        - Governance & Compliance: {assessment_scores.get('governance_compliance', 0):.1f}%
        - Innovation & Technology: {assessment_scores.get('innovation_technology', 0):.1f}%
        - Stakeholder Engagement: {assessment_scores.get('stakeholder_engagement', 0):.1f}%
        - Total Score: {assessment_scores.get('total_score', 0):.1f}%
        
        Based on these assessment scores, recommend the top 2 most relevant UN SDG goals that align with the company's current sustainability performance and offer the greatest impact opportunities.
        
        Consider:
        1. Which SDGs match the company's strongest performance areas for building on success
        2. Which SDGs address the company's weakest areas for maximum improvement potential
        3. Industry-specific relevance and typical SDG priorities
        4. Feasibility and implementation timeline for the company's size and resources
        
        Respond in JSON format with this structure:
        {{
            "primary_goal": {{
                "number": 7,
                "title": "Affordable and Clean Energy",
                "description": "Detailed explanation of why this goal is most relevant based on assessment scores and company profile",
                "priority": "high",
                "relevance_score": 85,
                "opportunities": [
                    "Specific opportunity 1 with implementation details",
                    "Specific opportunity 2 with expected impact",
                    "Specific opportunity 3 with timeline"
                ],
                "implementation_timeline": "6-12 months",
                "expected_impact": "High - aligns with environmental management strengths"
            }},
            "secondary_goal": {{
                "number": 13,
                "title": "Climate Action",
                "description": "Detailed explanation of why this goal is second most relevant based on assessment scores and company profile",
                "priority": "medium",
                "relevance_score": 72,
                "opportunities": [
                    "Specific opportunity 1 with implementation details",
                    "Specific opportunity 2 with expected impact",
                    "Specific opportunity 3 with timeline"
                ],
                "implementation_timeline": "12-18 months",
                "expected_impact": "Medium - addresses governance compliance gaps"
            }}
        }}
        """
    
    def _build_carbon_prompt(self, carbon_data: Dict, user_profile: Dict) -> str:
        """Build prompt for carbon footprint analysis"""
        return f"""
        You are a sustainability expert AI analyzing carbon footprint data for a company.
        
        Company Profile:
        - Name: {user_profile.get('company', 'Unknown')}
        - Industry: {user_profile.get('industry', 'Not specified')}
        - Size: {user_profile.get('size', 'Not specified')}
        
        Carbon Footprint Data (in tonnes CO₂e):
        - Electricity: {carbon_data.get('electricity', 0):.2f} tCO₂e
        - Transportation: {carbon_data.get('transportation', 0):.2f} tCO₂e
        - Refrigerants: {carbon_data.get('refrigerants', 0):.2f} tCO₂e
        - Mobile/Digital: {carbon_data.get('mobile', 0):.2f} tCO₂e
        - Combustion: {carbon_data.get('combustion', 0):.2f} tCO₂e
        - Total: {sum(carbon_data.values()):.2f} tCO₂e
        
        Analyze this carbon footprint data and provide comprehensive insights:
        1. Overall assessment of the carbon footprint level and areas of concern
        2. Key insights about which emission sources are highest and why
        3. Comparison to industry benchmarks and typical company footprints
        4. Specific, actionable improvement recommendations for each category
        5. Priority actions ranked by impact and feasibility
        6. Estimated reduction potential with specific percentages
        
        Focus on practical, implementable solutions that a company can realistically adopt.
        Consider the company's industry and size when making recommendations.
        
        Respond in JSON format with this structure:
        {{
            "overall_assessment": "Detailed assessment of the carbon footprint with specific observations about the company's sustainability performance",
            "key_insights": [
                "Specific insight about electricity emissions and energy efficiency",
                "Transportation patterns and opportunities for improvement",
                "Refrigerant management and leak prevention",
                "Digital footprint and data usage optimization",
                "Combustion sources and heating efficiency"
            ],
            "industry_comparison": "Comparison to industry average with specific benchmarks and context",
            "improvement_recommendations": [
                "Specific recommendation 1 with implementation details",
                "Specific recommendation 2 with expected impact",
                "Specific recommendation 3 with timeline",
                "Specific recommendation 4 with cost considerations",
                "Specific recommendation 5 with monitoring approach"
            ],
            "priority_actions": [
                "Immediate action 1 (next 30 days)",
                "Short-term action 2 (next 3 months)",
                "Medium-term action 3 (next 6 months)",
                "Long-term action 4 (next 12 months)"
            ],
            "estimated_reduction_potential": "X% reduction possible (X tonnes CO₂e saved annually) with specific breakdown by category"
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
        """Parse AI response for carbon footprint analysis"""
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
                "description": "Focus on renewable energy adoption and energy efficiency to reduce environmental impact and operational costs",
                "priority": "high",
                "relevance_score": 85,
                "opportunities": [
                    "Install solar panels or purchase renewable energy credits",
                    "Conduct energy efficiency audits and implement improvements",
                    "Switch to LED lighting and energy-efficient equipment"
                ],
                "implementation_timeline": "6-12 months",
                "expected_impact": "High - immediate cost savings and environmental benefits"
            },
            {
                "number": 13,
                "title": "Climate Action",
                "description": "Implement comprehensive climate change mitigation and adaptation strategies",
                "priority": "medium",
                "relevance_score": 72,
                "opportunities": [
                    "Develop carbon reduction targets and action plans",
                    "Implement carbon offset programs for unavoidable emissions",
                    "Conduct climate risk assessments and adaptation planning"
                ],
                "implementation_timeline": "12-18 months",
                "expected_impact": "Medium - long-term climate resilience and compliance"
            }
        ]
    
    def _get_fallback_carbon_analysis(self) -> Dict:
        """Fallback carbon analysis when AI is unavailable"""
        return {
            "overall_assessment": "Based on your carbon footprint data, there are several opportunities for improvement. Focus on the highest emission categories first for maximum impact.",
            "key_insights": [
                "Electricity consumption is typically the largest source of emissions for most companies",
                "Transportation emissions can be significantly reduced through efficient planning and alternative transport",
                "Refrigerant leaks, while small in volume, have high global warming potential",
                "Digital emissions are often overlooked but can be optimized through efficient data management",
                "Combustion sources like heating can be improved through energy efficiency measures"
            ],
            "industry_comparison": "Your emissions appear to be within typical ranges for companies of your size and industry. There's room for improvement through targeted sustainability initiatives.",
            "improvement_recommendations": [
                "Switch to renewable energy sources for electricity to reduce emissions by up to 100%",
                "Implement energy efficiency measures to reduce overall consumption by 20-30%",
                "Optimize transportation through route planning, carpooling, or electric vehicles",
                "Regular maintenance of refrigerant systems to prevent leaks and improve efficiency",
                "Implement digital sustainability practices to reduce data center and device emissions"
            ],
            "priority_actions": [
                "Conduct an energy audit to identify the biggest efficiency opportunities (next 30 days)",
                "Switch to renewable energy suppliers or install solar panels (next 3 months)",
                "Implement transportation optimization program (next 6 months)",
                "Develop comprehensive sustainability strategy with measurable targets (next 12 months)"
            ],
            "estimated_reduction_potential": "30-50% reduction possible (estimated 2-5 tonnes CO₂e saved annually) through focused improvements in energy efficiency and renewable energy adoption"
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
