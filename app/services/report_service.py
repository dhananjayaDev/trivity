import pandas as pd
import io
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
from flask import make_response, send_file

from app.database import db_manager
from app.models import User, Assessment, CarbonData
from app.services.data_service import data_service

class ReportGenerationService:
    """Service for generating Excel and CSV reports"""
    
    def __init__(self):
        self.users_collection = db_manager.get_users_collection()
        self.assessments_collection = db_manager.get_assessments_collection()
        self.carbon_collection = db_manager.get_carbon_data_collection()
        self.sdg_collection = db_manager.get_sdg_recommendations_collection()
    
    def generate_assessment_report(self, user_id: str, format: str = 'excel') -> Any:
        """
        Generate assessment report for a user
        
        Args:
            user_id: User's ID
            format: 'excel' or 'csv'
            
        Returns:
            File response or DataFrame
        """
        try:
            # Get user data
            user = self.users_collection.find_one({'_id': user_id})
            if not user:
                raise Exception("User not found")
            
            # Get assessment data
            assessment = self.assessments_collection.find_one(
                {'user_id': user_id},
                sort=[('created_at', -1)]
            )
            
            if not assessment:
                raise Exception("No assessment data found")
            
            # Prepare report data
            report_data = {
                'Company': [user.get('company', 'Not specified')],
                'User Name': [f"{user.get('first_name', '')} {user.get('last_name', '')}"],
                'Email': [user.get('email', '')],
                'Assessment Date': [assessment.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S')],
                'Total Score': [assessment.get('total_score', 0)],
                'General Score': [assessment.get('category_scores', {}).get('general', 0)],
                'Environment Score': [assessment.get('category_scores', {}).get('environment', 0)],
                'Social Score': [assessment.get('category_scores', {}).get('social', 0)],
                'Governance Score': [assessment.get('category_scores', {}).get('governance', 0)],
                'Status': [assessment.get('status', 'Unknown')]
            }
            
            # Add assessment answers
            answers = assessment.get('answers', {})
            for question_id, answer in answers.items():
                report_data[f'Q_{question_id}'] = [str(answer)]
            
            # Create DataFrame
            df = pd.DataFrame(report_data)
            
            if format.lower() == 'excel':
                return self._create_excel_response(df, f"Assessment_Report_{user_id}")
            else:
                return self._create_csv_response(df, f"Assessment_Report_{user_id}")
                
        except Exception as e:
            logging.error(f"Error generating assessment report: {e}")
            raise e
    
    def generate_carbon_report(self, user_id: str, format: str = 'excel') -> Any:
        """
        Generate carbon footprint report for a user
        
        Args:
            user_id: User's ID
            format: 'excel' or 'csv'
            
        Returns:
            File response or DataFrame
        """
        try:
            # Get user data
            user = self.users_collection.find_one({'_id': user_id})
            if not user:
                raise Exception("User not found")
            
            # Get carbon data
            carbon_data = self.carbon_collection.find_one(
                {'user_id': user_id},
                sort=[('created_at', -1)]
            )
            
            if not carbon_data:
                raise Exception("No carbon data found")
            
            # Prepare report data
            report_data = {
                'Company': [user.get('company', 'Not specified')],
                'User Name': [f"{user.get('first_name', '')} {user.get('last_name', '')}"],
                'Email': [user.get('email', '')],
                'Report Date': [carbon_data.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S')],
                'Total Emissions (tCO2e)': [carbon_data.get('total_emissions', 0)],
                'Electricity Emissions (tCO2e)': [carbon_data.get('electricity_emissions', 0)],
                'Transportation Emissions (tCO2e)': [carbon_data.get('transportation_emissions', 0)],
                'Refrigerant Emissions (tCO2e)': [carbon_data.get('refrigerant_emissions', 0)],
                'Mobile Emissions (tCO2e)': [carbon_data.get('mobile_emissions', 0)],
                'Combustion Emissions (tCO2e)': [carbon_data.get('combustion_emissions', 0)],
                'Period': [carbon_data.get('period', 'monthly')]
            }
            
            # Create DataFrame
            df = pd.DataFrame(report_data)
            
            if format.lower() == 'excel':
                return self._create_excel_response(df, f"Carbon_Report_{user_id}")
            else:
                return self._create_csv_response(df, f"Carbon_Report_{user_id}")
                
        except Exception as e:
            logging.error(f"Error generating carbon report: {e}")
            raise e
    
    def generate_sdg_report(self, user_id: str, format: str = 'excel') -> Any:
        """
        Generate SDG recommendations report for a user
        
        Args:
            user_id: User's ID
            format: 'excel' or 'csv'
            
        Returns:
            File response or DataFrame
        """
        try:
            # Get user data
            user = self.users_collection.find_one({'_id': user_id})
            if not user:
                raise Exception("User not found")
            
            # Get SDG recommendations
            sdg_data = self.sdg_collection.find_one(
                {'user_id': user_id},
                sort=[('generated_at', -1)]
            )
            
            if not sdg_data:
                raise Exception("No SDG recommendations found")
            
            recommendations = sdg_data.get('recommendations', [])
            
            # Prepare report data
            report_data = {
                'Company': [],
                'User Name': [],
                'Email': [],
                'Generated Date': [],
                'SDG Number': [],
                'SDG Title': [],
                'Description': [],
                'Priority': [],
                'Opportunities': []
            }
            
            for rec in recommendations:
                report_data['Company'].append(user.get('company', 'Not specified'))
                report_data['User Name'].append(f"{user.get('first_name', '')} {user.get('last_name', '')}")
                report_data['Email'].append(user.get('email', ''))
                report_data['Generated Date'].append(sdg_data.get('generated_at', '').strftime('%Y-%m-%d %H:%M:%S'))
                report_data['SDG Number'].append(rec.get('number', ''))
                report_data['SDG Title'].append(rec.get('title', ''))
                report_data['Description'].append(rec.get('description', ''))
                report_data['Priority'].append(rec.get('priority', ''))
                report_data['Opportunities'].append(', '.join(rec.get('opportunities', [])))
            
            # Create DataFrame
            df = pd.DataFrame(report_data)
            
            if format.lower() == 'excel':
                return self._create_excel_response(df, f"SDG_Report_{user_id}")
            else:
                return self._create_csv_response(df, f"SDG_Report_{user_id}")
                
        except Exception as e:
            logging.error(f"Error generating SDG report: {e}")
            raise e
    
    def generate_comprehensive_report(self, user_id: str, format: str = 'excel') -> Any:
        """
        Generate comprehensive sustainability report for a user
        
        Args:
            user_id: User's ID
            format: 'excel' or 'csv'
            
        Returns:
            File response or DataFrame
        """
        try:
            # Get user data
            user = self.users_collection.find_one({'_id': user_id})
            if not user:
                raise Exception("User not found")
            
            # Get all user data
            dashboard_data = data_service.update_dashboard_data(user_id)
            
            # Prepare comprehensive report data
            report_data = {
                'Report Type': [],
                'Company': [],
                'User Name': [],
                'Email': [],
                'Date': [],
                'Score/Value': [],
                'Details': []
            }
            
            # Add user info
            report_data['Report Type'].append('User Information')
            report_data['Company'].append(user.get('company', 'Not specified'))
            report_data['User Name'].append(f"{user.get('first_name', '')} {user.get('last_name', '')}")
            report_data['Email'].append(user.get('email', ''))
            report_data['Date'].append(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            report_data['Score/Value'].append('N/A')
            report_data['Details'].append('User Profile Information')
            
            # Add SRI scores
            if dashboard_data.get('sri_scores'):
                sri = dashboard_data['sri_scores']
                report_data['Report Type'].append('SRI Assessment')
                report_data['Company'].append(user.get('company', 'Not specified'))
                report_data['User Name'].append(f"{user.get('first_name', '')} {user.get('last_name', '')}")
                report_data['Email'].append(user.get('email', ''))
                report_data['Date'].append(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                report_data['Score/Value'].append(f"{sri.get('total', 0)}%")
                report_data['Details'].append(f"General: {sri.get('categories', {}).get('general', 0)}%, Environment: {sri.get('categories', {}).get('environment', 0)}%, Social: {sri.get('categories', {}).get('social', 0)}%, Governance: {sri.get('categories', {}).get('governance', 0)}%")
            
            # Add carbon data
            if dashboard_data.get('carbon_data'):
                carbon = dashboard_data['carbon_data']
                report_data['Report Type'].append('Carbon Footprint')
                report_data['Company'].append(user.get('company', 'Not specified'))
                report_data['User Name'].append(f"{user.get('first_name', '')} {user.get('last_name', '')}")
                report_data['Email'].append(user.get('email', ''))
                report_data['Date'].append(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                report_data['Score/Value'].append(f"{carbon.get('total_emissions', 0)} tCO2e")
                report_data['Details'].append(f"Electricity: {carbon.get('breakdown', {}).get('electricity', 0)} tCO2e, Transportation: {carbon.get('breakdown', {}).get('transportation', 0)} tCO2e")
            
            # Add SDG recommendations
            if dashboard_data.get('sdg_recommendations'):
                for rec in dashboard_data['sdg_recommendations']:
                    report_data['Report Type'].append('SDG Recommendation')
                    report_data['Company'].append(user.get('company', 'Not specified'))
                    report_data['User Name'].append(f"{user.get('first_name', '')} {user.get('last_name', '')}")
                    report_data['Email'].append(user.get('email', ''))
                    report_data['Date'].append(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                    report_data['Score/Value'].append(f"SDG {rec.get('number', '')}")
                    report_data['Details'].append(f"{rec.get('title', '')} - {rec.get('description', '')}")
            
            # Create DataFrame
            df = pd.DataFrame(report_data)
            
            if format.lower() == 'excel':
                return self._create_excel_response(df, f"Comprehensive_Report_{user_id}")
            else:
                return self._create_csv_response(df, f"Comprehensive_Report_{user_id}")
                
        except Exception as e:
            logging.error(f"Error generating comprehensive report: {e}")
            raise e
    
    def generate_admin_report(self, format: str = 'excel') -> Any:
        """
        Generate admin report with all users' data
        
        Args:
            format: 'excel' or 'csv'
            
        Returns:
            File response or DataFrame
        """
        try:
            # Get all users
            users = list(self.users_collection.find({}))
            
            # Prepare admin report data
            report_data = {
                'User ID': [],
                'Company': [],
                'Name': [],
                'Email': [],
                'Registration Date': [],
                'Last Login': [],
                'Profile Completed': [],
                'Assessment Completed': [],
                'Carbon Data Submitted': [],
                'SDG Recommendations Generated': [],
                'Total SRI Score': [],
                'Total Carbon Emissions': []
            }
            
            for user in users:
                user_id = str(user['_id'])
                
                # Get user progress
                progress = data_service.get_user_progress(user_id)
                
                # Get latest assessment score
                assessment = self.assessments_collection.find_one(
                    {'user_id': user_id},
                    sort=[('created_at', -1)]
                )
                total_score = assessment.get('total_score', 0) if assessment else 0
                
                # Get latest carbon data
                carbon_data = self.carbon_collection.find_one(
                    {'user_id': user_id},
                    sort=[('created_at', -1)]
                )
                total_emissions = carbon_data.get('total_emissions', 0) if carbon_data else 0
                
                report_data['User ID'].append(user_id)
                report_data['Company'].append(user.get('company', 'Not specified'))
                report_data['Name'].append(f"{user.get('first_name', '')} {user.get('last_name', '')}")
                report_data['Email'].append(user.get('email', ''))
                report_data['Registration Date'].append(user.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S') if user.get('created_at') else '')
                report_data['Last Login'].append(user.get('last_login', '').strftime('%Y-%m-%d %H:%M:%S') if user.get('last_login') else 'Never')
                report_data['Profile Completed'].append('Yes' if progress.get('profile_completed', False) else 'No')
                report_data['Assessment Completed'].append('Yes' if progress.get('assessment_completed', False) else 'No')
                report_data['Carbon Data Submitted'].append('Yes' if progress.get('carbon_data_submitted', False) else 'No')
                report_data['SDG Recommendations Generated'].append('Yes' if progress.get('sdg_recommendations_generated', False) else 'No')
                report_data['Total SRI Score'].append(total_score)
                report_data['Total Carbon Emissions'].append(total_emissions)
            
            # Create DataFrame
            df = pd.DataFrame(report_data)
            
            if format.lower() == 'excel':
                return self._create_excel_response(df, f"Admin_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            else:
                return self._create_csv_response(df, f"Admin_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
                
        except Exception as e:
            logging.error(f"Error generating admin report: {e}")
            raise e
    
    def _create_excel_response(self, df: pd.DataFrame, filename: str) -> Any:
        """Create Excel file response"""
        try:
            # Create Excel file in memory
            output = io.BytesIO()
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Report', index=False)
                
                # Get the workbook and worksheet
                workbook = writer.book
                worksheet = writer.sheets['Report']
                
                # Auto-adjust column widths
                for column in worksheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
            
            output.seek(0)
            
            # Create response
            response = make_response(output.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = f'attachment; filename={filename}.xlsx'
            
            return response
            
        except Exception as e:
            logging.error(f"Error creating Excel response: {e}")
            raise e
    
    def _create_csv_response(self, df: pd.DataFrame, filename: str) -> Any:
        """Create CSV file response"""
        try:
            # Create CSV file in memory
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)
            
            # Create response
            response = make_response(output.getvalue())
            response.headers['Content-Type'] = 'text/csv'
            response.headers['Content-Disposition'] = f'attachment; filename={filename}.csv'
            
            return response
            
        except Exception as e:
            logging.error(f"Error creating CSV response: {e}")
            raise e

# Global report generation service instance
report_service = ReportGenerationService()
