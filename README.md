# 💰 Smart Expense Tracker

AI-powered expense tracking with OCR receipt scanning and ML categorization.

## Features

- OCR receipt scanning with auto-extraction
- AI categorization (98%+ confidence)
- Interactive charts & budget alerts
- JWT authentication

## Tech Stack

**Frontend:** React • Material-UI • Chart.js  
**Backend:** Flask • SQLAlchemy  
**AI:** EasyOCR • scikit-learn

## Quick Start

```powershell
# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python ml_model.py
python app.py

# Frontend
cd frontend
npm install
npm start
