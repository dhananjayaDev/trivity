from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import re
import logging

from app.database import db_manager
from app.models import User, Assessment, CarbonData

auth_bp = Blueprint('auth', __name__)

# Initialize login manager
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    """Load user from database for Flask-Login"""
    try:
        from bson import ObjectId
        users_collection = db_manager.get_users_collection()
        user_data = users_collection.find_one({'_id': ObjectId(user_id)})
        if user_data:
            return User(user_data)
        return None
    except Exception as e:
        logging.error(f"Error loading user {user_id}: {e}")
        return None

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login page"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False)
        
        # Validate input
        if not email or not password:
            flash('Please fill in all fields.', 'error')
            return render_template('auth/login.html')
        
        if not is_valid_email(email):
            flash('Please enter a valid email address.', 'error')
            return render_template('auth/login.html')
        
        try:
            # Find user in database
            users_collection = db_manager.get_users_collection()
            user_data = users_collection.find_one({'email': email})
            
            if user_data and check_password_hash(user_data['password_hash'], password):
                user = User(user_data)
                
                # Check if user is active
                if not user.is_active:
                    flash('Your account has been deactivated. Please contact support.', 'error')
                    return render_template('auth/login.html')
                
                # Update last login
                user.update_last_login()
                users_collection.update_one(
                    {'_id': user_data['_id']},
                    {'$set': {'last_login': user.last_login}}
                )
                
                # Login user
                login_user(user, remember=remember)
                
                # Redirect to next page or dashboard
                next_page = request.args.get('next')
                if next_page:
                    return redirect(next_page)
                return redirect(url_for('main.index'))
            else:
                flash('Invalid email or password.', 'error')
                
        except Exception as e:
            logging.error(f"Login error: {e}")
            flash('An error occurred during login. Please try again.', 'error')
    
    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration page"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        company = request.form.get('company', '').strip()
        
        # Validate input
        errors = []
        
        if not all([email, password, confirm_password, first_name, last_name]):
            errors.append('Please fill in all required fields.')
        
        if not is_valid_email(email):
            errors.append('Please enter a valid email address.')
        
        if len(password) < 8:
            errors.append('Password must be at least 8 characters long.')
        
        if password != confirm_password:
            errors.append('Passwords do not match.')
        
        if len(first_name) < 2 or len(last_name) < 2:
            errors.append('First and last names must be at least 2 characters long.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/register.html')
        
        try:
            # Check if user already exists
            users_collection = db_manager.get_users_collection()
            existing_user = users_collection.find_one({'email': email})
            
            if existing_user:
                flash('An account with this email already exists.', 'error')
                return render_template('auth/register.html')
            
            # Create new user
            password_hash = generate_password_hash(password)
            user_data = {
                'email': email,
                'password_hash': password_hash,
                'first_name': first_name,
                'last_name': last_name,
                'company': company,
                'role': 'user',
                'created_at': datetime.utcnow(),
                'last_login': None,
                'is_active': True,
                'profile_completed': False,
                'sustainability_profile': {}
            }
            
            # Insert user into database
            result = users_collection.insert_one(user_data)
            if not result.inserted_id:
                raise Exception("Failed to create user account")
            
            user_data['_id'] = result.inserted_id
            
            # Create user object and login
            user = User(user_data)
            login_user(user)
            
            flash('Registration successful! Welcome to Trivity.', 'success')
            return redirect(url_for('main.index'))
            
        except Exception as e:
            logging.error(f"Registration error: {e}")
            flash('Registration failed. Please try again or contact support.', 'error')
    
    return render_template('auth/register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    """User logout"""
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('auth.login'))

@auth_bp.route('/profile')
@login_required
def profile():
    """User profile page"""
    return render_template('auth/profile.html', user=current_user)

@auth_bp.route('/profile/update', methods=['POST'])
@login_required
def update_profile():
    """Update user profile"""
    try:
        from bson import ObjectId
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        company = request.form.get('company', '').strip()
        
        if not first_name or not last_name:
            flash('First and last names are required.', 'error')
            return redirect(url_for('auth.profile'))
        
        # Update user in database
        users_collection = db_manager.get_users_collection()
        users_collection.update_one(
            {'_id': ObjectId(current_user.id)},
            {'$set': {
                'first_name': first_name,
                'last_name': last_name,
                'company': company,
                'updated_at': datetime.utcnow()
            }}
        )
        
        # Update current user object
        current_user.first_name = first_name
        current_user.last_name = last_name
        current_user.company = company
        
        flash('Profile updated successfully.', 'success')
        
    except Exception as e:
        logging.error(f"Profile update error: {e}")
        flash('An error occurred while updating your profile.', 'error')
    
    return redirect(url_for('auth.profile'))

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Change user password"""
    try:
        from bson import ObjectId
        current_password = request.form.get('current_password', '')
        new_password = request.form.get('new_password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Validate input
        if not all([current_password, new_password, confirm_password]):
            flash('Please fill in all password fields.', 'error')
            return redirect(url_for('auth.profile'))
        
        if len(new_password) < 8:
            flash('New password must be at least 8 characters long.', 'error')
            return redirect(url_for('auth.profile'))
        
        if new_password != confirm_password:
            flash('New passwords do not match.', 'error')
            return redirect(url_for('auth.profile'))
        
        # Verify current password
        users_collection = db_manager.get_users_collection()
        user_data = users_collection.find_one({'_id': ObjectId(current_user.id)})
        
        if not check_password_hash(user_data['password_hash'], current_password):
            flash('Current password is incorrect.', 'error')
            return redirect(url_for('auth.profile'))
        
        # Update password
        new_password_hash = generate_password_hash(new_password)
        users_collection.update_one(
            {'_id': ObjectId(current_user.id)},
            {'$set': {'password_hash': new_password_hash}}
        )
        
        flash('Password changed successfully.', 'success')
        
    except Exception as e:
        logging.error(f"Password change error: {e}")
        flash('An error occurred while changing your password.', 'error')
    
    return redirect(url_for('auth.profile'))

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def init_login_manager(app):
    """Initialize login manager with Flask app"""
    login_manager.init_app(app)
