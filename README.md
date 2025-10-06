# Sitemark Dashboard

A modern, responsive analytics dashboard built with **pure Flask** (Python backend) and vanilla JavaScript frontend. This application features a clean, professional architecture with Material Design UI components.

## 🏗️ Pure Flask Architecture

### Project Structure
```
├── app/                          # Flask application package
│   ├── __init__.py              # Application factory
│   ├── routes/                  # API and main routes
│   │   ├── __init__.py
│   │   ├── main.py             # Main page routes
│   │   └── api.py              # API endpoints
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── dashboard_service.py # Dashboard data logic
│   │   └── user_service.py     # User data logic
│   ├── templates/              # Jinja2 templates
│   │   ├── base.html          # Base template
│   │   └── index.html         # Dashboard page
│   └── static/                # Static files
│       ├── css/
│       │   └── dashboard.css  # Custom CSS styles
│       └── js/
│           └── dashboard.js   # JavaScript functionality
├── config.py                   # Configuration settings
├── run.py                     # Application entry point
├── requirements.txt           # Python dependencies
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sitemark-dashboard
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/macOS
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python run.py
   ```

5. **Access the dashboard**
   Open your browser to `http://localhost:5000`

## 🔧 Development

### Development Mode
```bash
python run.py
```
The application runs in debug mode with auto-reload enabled.

### Available Scripts
- `python run.py` - Start the Flask development server

## 🏛️ Architecture Overview

### Backend (Flask)
- **Application Factory Pattern**: Clean app initialization
- **Blueprint Organization**: Modular route organization
- **Service Layer**: Business logic separation
- **Configuration Management**: Environment-based config
- **Type Hints**: Python type annotations for better code quality

### Frontend (Vanilla JavaScript + HTML + CSS)
- **Pure HTML**: Semantic markup with Jinja2 templating
- **CSS3**: Modern styling with Material Design principles
- **Vanilla JavaScript**: No frameworks, pure JavaScript
- **Chart.js**: Data visualization library
- **Responsive Design**: Mobile-first approach

### Data Flow
```
Flask API → JSON Data → Vanilla JavaScript → DOM Updates
```

## 📊 Features

### 🔐 **Authentication & User Management**
- **User Registration/Login** - Secure authentication with MongoDB
- **Profile Management** - Update personal information and company details
- **Password Security** - Bcrypt hashing for secure password storage
- **Session Management** - Flask-Login integration with persistent sessions

### 🤖 **AI-Powered Analysis**
- **Gemini AI Integration** - Google's advanced AI for sustainability analysis
- **Smart Assessment Analysis** - AI-powered scoring and recommendations
- **Personalized SDG Recommendations** - Tailored UN Sustainable Development Goals
- **Carbon Footprint Analysis** - AI insights on emissions reduction strategies
- **Fallback Mode** - Graceful degradation when AI is unavailable

### 📊 **Sustainability Assessment**
- **Comprehensive Questionnaire** - Multi-category sustainability evaluation
- **Real-time Scoring** - Instant calculation of Sustainability Readiness Index (SRI)
- **Category Breakdown** - Detailed scores for General, Environment, Social, Governance
- **Progress Tracking** - Visual progress indicators and completion status

### 🌍 **Carbon Footprint Calculator**
- **Multi-source Emissions** - Electricity, transportation, refrigerants, mobile, combustion
- **Industry-standard Factors** - Accurate emission calculations using established coefficients
- **Visual Analytics** - Charts and graphs for emission breakdown
- **Reduction Recommendations** - AI-powered suggestions for emission reduction

### 🎯 **UN SDG Recommendations**
- **AI-Powered Suggestions** - Personalized recommendations based on user profile
- **Priority Classification** - Primary and secondary goal identification
- **Detailed Explanations** - Why each SDG is relevant to the user
- **Actionable Insights** - Specific opportunities and implementation strategies

### 📈 **Dashboard & Analytics**
- **Real-time Data** - Live updates from user assessments and calculations
- **Circular Progress Indicators** - Visual representation of sustainability scores
- **Achievement System** - Trophy-based recognition for sustainability milestones
- **AI Insights Panel** - Personalized recommendations and performance summaries
- **Progress Tracking** - Completion status across all platform features

### 📋 **Reports & Export**
- **Excel Export** - Professional .xlsx reports with formatting
- **CSV Export** - Universal data format for analysis
- **Assessment Reports** - Detailed SRI analysis with category breakdowns
- **Carbon Reports** - Comprehensive emissions analysis by source
- **SDG Reports** - AI recommendations with priority levels
- **Comprehensive Reports** - Complete sustainability overview
- **Admin Reports** - System-wide analytics for administrators

### 🎨 **Modern UI/UX**
- **Dark/Light Themes** - Professional theme switching with persistence
- **Responsive Design** - Mobile-first approach for all screen sizes
- **Material Design** - Google Material Design principles and components
- **Glass-morphism Effects** - Modern visual effects and animations
- **Interactive Elements** - Hover effects, transitions, and micro-interactions
- **Accessibility** - Semantic HTML and keyboard navigation support

### 🔧 **Technical Features**
- **MongoDB Atlas** - Cloud-hosted NoSQL database for scalability
- **RESTful API** - Clean API endpoints for all platform functionality
- **Real-time Updates** - Dynamic data loading and updates
- **Error Handling** - Comprehensive error management and user feedback
- **Performance Monitoring** - Built-in performance tracking and optimization
- **Security** - Input validation, sanitization, and secure authentication

## 🔌 API Endpoints

### **Authentication**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/profile` - User profile page
- `POST /auth/profile/update` - Update user profile
- `POST /auth/change-password` - Change user password

### **Main Pages**
- `GET /` - Dashboard page
- `GET /sustainability-index` - Sustainability assessment page
- `GET /recommended-sdgs` - UN SDG recommendations page
- `GET /data-center` - Data center page
- `GET /carbon-calculator` - Carbon calculator page
- `GET /reports` - Reports & analytics page

### **API Endpoints**
- `GET /api/health` - Health check endpoint
- `GET /api/dashboard/data` - Dashboard data
- `GET /api/user/progress` - User progress tracking
- `POST /api/assessment/analyze` - Analyze sustainability assessment
- `GET /api/sdg/recommendations` - Get SDG recommendations
- `POST /api/carbon/analyze` - Analyze carbon footprint
- `GET /api/insights/dashboard` - Get AI dashboard insights
- `GET /api/ai/status` - Check AI service status

### **Report Generation**
- `GET /api/reports/assessment?format=excel` - Generate assessment report
- `GET /api/reports/carbon?format=csv` - Generate carbon report
- `GET /api/reports/sdg?format=excel` - Generate SDG report
- `GET /api/reports/comprehensive?format=excel` - Generate comprehensive report
- `GET /api/reports/admin?format=excel` - Generate admin report (admin only)

## 🛠️ Configuration

### Environment Variables
- `SECRET_KEY` - Flask secret key (required in production)
- `FLASK_ENV` - Environment (development/production)

### Configuration Classes
- `DevelopmentConfig` - Development settings
- `ProductionConfig` - Production settings
- `TestingConfig` - Testing settings

## 📦 Dependencies

### Python (Backend)
- Flask 2.3.3 - Web framework
- Flask-CORS 4.0.0 - Cross-origin resource sharing
- python-dotenv 1.0.0 - Environment variable management

### Frontend (CDN)
- Chart.js - Data visualization
- Google Fonts - Typography
- Material Icons - Icon library

## 🚀 Deployment

### Production Build
```bash
python run.py
```

### Environment Setup
```bash
export SECRET_KEY="your-production-secret-key"
export FLASK_ENV="production"
```

## 🧪 Testing

### Run Tests
```bash
python -m pytest
```

## 📝 Code Quality

- **Python Type Hints**: Full type annotations
- **PEP 8**: Python code style
- **Clean Architecture**: Separation of concerns
- **Responsive Design**: Mobile-first CSS
- **Semantic HTML**: Accessible markup

## 🎨 UI Components

### Material Design Elements
- **Cards**: Metric cards and chart containers
- **Navigation**: Sidebar with active states
- **Typography**: Inter font family
- **Colors**: Dark theme with accent colors
- **Icons**: Material Icons from Google

### Interactive Features
- **Charts**: Line charts and bar charts
- **Hover Effects**: Button and card interactions
- **Responsive Grid**: CSS Grid layout
- **Search**: Real-time search functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Built with ❤️ using pure Flask and vanilla JavaScript**