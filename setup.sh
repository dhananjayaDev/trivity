#!/bin/bash

echo "Setting up Sitemark Dashboard..."

echo ""
echo "Step 1: Creating Python virtual environment..."
python3 -m venv venv

echo ""
echo "Step 2: Activating virtual environment..."
source venv/bin/activate

echo ""
echo "Step 3: Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "Step 4: Installing Node.js dependencies..."
npm install

echo ""
echo "Step 5: Building the frontend..."
npm run build

echo ""
echo "Setup complete!"
echo ""
echo "To run the application:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Start Flask server: python app.py"
echo "3. Open browser: http://localhost:5000"
echo ""
