@echo off
echo Setting up Sitemark Dashboard...

echo.
echo Step 1: Creating Python virtual environment...
python -m venv venv

echo.
echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Step 3: Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Step 4: Installing Node.js dependencies...
npm install

echo.
echo Step 5: Building the frontend...
npm run build

echo.
echo Setup complete! 
echo.
echo To run the application:
echo 1. Activate virtual environment: venv\Scripts\activate.bat
echo 2. Start Flask server: python app.py
echo 3. Open browser: http://localhost:5000
echo.
pause
