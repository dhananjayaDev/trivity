#!/bin/bash

echo "Starting Sitemark Dashboard..."

echo ""
echo "Activating virtual environment..."
source venv/bin/activate

echo ""
echo "Starting Flask server..."
python app.py
