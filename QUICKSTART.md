# 🚀 Quick Start Guide - Sustainability Platform

## ⚡ **Get Started in 5 Minutes**

### **1. Prerequisites**
- Python 3.8+ installed
- MongoDB Atlas account (free tier available)
- Google AI Studio account (for Gemini API)

### **2. Clone & Setup**
```bash
# Clone the repository
git clone <repository-url>
cd sustainability-platform

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### **3. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Required: MONGO_URI, GEMINI_API_KEY, SECRET_KEY
```

### **4. Run the Application**
```bash
python run.py
```

### **5. Access the Platform**
Open your browser to `http://localhost:5000`

## 🎯 **First Steps**

### **Register & Login**
1. Click "Sign Up" on the login page
2. Fill in your details (company, email, password)
3. Complete registration and login

### **Complete Assessment**
1. Navigate to "Sustainability Readiness Index"
2. Answer the comprehensive questionnaire
3. Get your personalized SRI score and AI analysis

### **Calculate Carbon Footprint**
1. Go to "Carbon Emissions Calculator"
2. Enter your energy and transportation data
3. Get detailed emissions breakdown and reduction tips

### **View Recommendations**
1. Check "Recommended UN SDGs" for AI-powered suggestions
2. See personalized sustainability goals based on your profile

### **Generate Reports**
1. Visit "Reports & Analytics"
2. Download Excel/CSV reports of your data
3. Share insights with stakeholders

## 🔧 **Configuration Options**

### **Environment Variables**
```bash
# Required
SECRET_KEY=your-secret-key
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
GEMINI_API_KEY=your-gemini-api-key

# Optional
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_NAME=sustainability_platform
```

### **MongoDB Setup**
1. Create MongoDB Atlas account
2. Create a new cluster (free tier: M0)
3. Get connection string
4. Add to MONGO_URI in .env

### **Gemini AI Setup**
1. Visit Google AI Studio
2. Create API key
3. Add to GEMINI_API_KEY in .env

## 🚀 **Production Deployment**

### **Environment Setup**
```bash
# Production environment
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-production-secret-key
```

### **Security Considerations**
- Use strong SECRET_KEY
- Enable HTTPS in production
- Set up proper CORS origins
- Configure rate limiting
- Use environment-specific MongoDB credentials

### **Monitoring**
- Health check endpoint: `/api/health`
- AI status endpoint: `/api/ai/status`
- Log monitoring for errors and performance

## 🆘 **Troubleshooting**

### **Common Issues**

**Database Connection Error**
- Check MONGO_URI format
- Verify MongoDB Atlas cluster is running
- Ensure IP whitelist includes your IP

**AI Service Unavailable**
- Verify GEMINI_API_KEY is correct
- Check API quota limits
- Platform works in fallback mode without AI

**Import Errors**
- Ensure all dependencies installed: `pip install -r requirements.txt`
- Check Python version compatibility

**Theme Issues**
- Clear browser cache
- Check localStorage for theme settings

### **Support**
- Check logs in console/terminal
- Verify environment variables
- Test individual API endpoints
- Check browser developer tools for errors

## 📊 **Platform Features Overview**

| Feature | Status | Description |
|---------|--------|-------------|
| 🔐 Authentication | ✅ Complete | User registration, login, profile management |
| 📊 Assessment | ✅ Complete | SRI questionnaire with AI analysis |
| 🌍 Carbon Calculator | ✅ Complete | Multi-source emissions calculation |
| 🎯 SDG Recommendations | ✅ Complete | AI-powered UN SDG suggestions |
| 📈 Dashboard | ✅ Complete | Real-time data visualization |
| 📋 Reports | ✅ Complete | Excel/CSV export functionality |
| 🤖 AI Integration | ✅ Complete | Gemini AI with fallback mode |
| 💾 Data Persistence | ✅ Complete | MongoDB Atlas integration |

## 🎉 **You're Ready!**

The platform is now fully functional with:
- ✅ User authentication and management
- ✅ AI-powered sustainability analysis
- ✅ Real-time data visualization
- ✅ Professional report generation
- ✅ Modern, responsive UI

**Start your sustainability journey today!** 🌱
