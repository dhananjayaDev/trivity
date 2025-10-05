@echo off
echo Starting Sitemark Dashboard...

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting Flask server...
python app.py
