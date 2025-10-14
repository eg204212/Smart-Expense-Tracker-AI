# 🧾 Smart Expense Tracker with AI Insights

An intelligent web application that helps users manage and analyze their daily expenses using **OCR** and **Machine Learning**.

---

## 🚀 Features
- 📸 **OCR Receipt Scanning** – Extracts expense data from uploaded receipts using **Tesseract / EasyOCR**.  
- 🤖 **AI Categorization** – Classifies expenses (Food, Transport, Bills, etc.) using ML models.  
- 📊 **Data Visualization** – Displays spending patterns and monthly insights with **Chart.js / Matplotlib**.  
- 🌐 **Full-Stack Web App** – Built with **React (frontend)** and **Flask (backend)**.  
- 💾 **Database Integration** – Stores transactions securely (MongoDB or SQLite).

---

## 🧠 Tech Stack
**Frontend:** React, Chart.js  
**Backend:** Flask (Python)  
**AI/OCR:** EasyOCR / Tesseract, Scikit-learn, Pandas, NumPy  
**Database:** MongoDB / SQLite  
**Other Tools:** Matplotlib, REST APIs, Git, VS Code  

---

## ⚙️ How It Works
1. User uploads a receipt or enters expense details.  
2. OCR extracts text data (amount, vendor, date, etc.).  
3. ML model categorizes the expense automatically.  
4. Dashboard shows spending insights and predictions.  

---

## 🧩 Setup Instructions
```bash
# Clone repository
git clone https://github.com/YourUsername/smart-expense-tracker-ai.git
cd smart-expense-tracker-ai/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # (Windows)

# Install dependencies
pip install -r requirements.txt

# Run Flask backend
python app.py
