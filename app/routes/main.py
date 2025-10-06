from flask import Blueprint, render_template
from flask_login import login_required, current_user

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@login_required
def index():
    """Serve the main dashboard page"""
    return render_template('index.html', user=current_user)

@main_bp.route('/sustainability-index')
@login_required
def sustainability_index():
    """Serve the sustainability readiness index page"""
    return render_template('sustainability_index.html', user=current_user)

@main_bp.route('/recommended-sdgs')
@login_required
def recommended_sdgs():
    """Serve the recommended UN SDGs page"""
    return render_template('recommended_sdgs.html', user=current_user)

@main_bp.route('/data-center')
@login_required
def data_center():
    """Serve the data center page"""
    return render_template('data_center.html', user=current_user)

@main_bp.route('/carbon-calculator')
@login_required
def carbon_calculator():
    """Serve the carbon emissions calculator page"""
    return render_template('carbon_calculator.html', user=current_user)

@main_bp.route('/reports')
@login_required
def reports():
    """Serve the reports and analytics page"""
    return render_template('reports.html', user=current_user)