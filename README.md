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

- **Modern Dark Theme**: Professional dark UI design
- **Responsive Layout**: Works on all screen sizes
- **Real-time Data**: Dynamic charts and metrics
- **Interactive Charts**: Sessions and page views visualization
- **Sidebar Navigation**: Clean navigation with user profile
- **Material Design**: Google Material Design components
- **No Dependencies**: Pure Flask + vanilla JavaScript

## 🔌 API Endpoints

- `GET /` - Main dashboard page
- `GET /api/dashboard-data` - Dashboard metrics and chart data
- `GET /api/user-profile` - User profile information

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