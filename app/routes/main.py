from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Serve the main dashboard page"""
    return render_template('index.html')

@main_bp.route('/sustainability-index')
def sustainability_index():
    """Serve the sustainability readiness index page"""
    return render_template('sustainability_index.html')

@main_bp.route('/recommended-sdgs')
def recommended_sdgs():
    """Serve the recommended UN SDGs page"""
    return render_template('recommended_sdgs.html')

@main_bp.route('/data-center')
def data_center():
    """Serve the data center page"""
    return render_template('data_center.html')

@main_bp.route('/carbon-calculator')
def carbon_calculator():
    """Serve the carbon emissions calculator page"""
    return render_template('carbon_calculator.html')