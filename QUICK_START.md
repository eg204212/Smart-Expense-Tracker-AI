# Quick Start Guide - Smart Expense Tracker

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Python 3.9+ installed
- Node.js 16+ and npm installed
- Git installed

### Step 1: Clone the Repository
```powershell
git clone https://github.com/eg204212/Smart-Expense-Tracker-AI.git
cd Smart-Expense-Tracker-AI
```

### Step 2: Start Backend
```powershell
cd backend

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start Flask server
python app.py
```

**Backend will run on:** http://127.0.0.1:5000

### Step 3: Start Frontend (New Terminal)
```powershell
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

**Frontend will run on:** http://localhost:3000

### Step 4: Use the Application

1. **Register Account**
   - Navigate to http://localhost:3000
   - Click "Register"
   - Create your account

2. **Login**
   - Use your credentials to login
   - You'll receive a JWT token automatically

3. **Add Expenses**
   - Manual: Click "Add Expense" and fill the form
   - Receipt: Click "Upload Receipt" for OCR extraction

4. **View Insights**
   - Dashboard: Overview of spending
   - Insights: Charts and visualizations
   - History: All your expenses

## Features

### ✨ Core Features
- **User Authentication:** Register, login with JWT tokens
- **Add Expenses:** Manual entry with vendor, amount, date, category
- **Receipt OCR:** Upload receipt images for automatic text extraction
- **ML Categorization:** Automatic expense categorization using trained model
- **Visual Analytics:** Charts showing spending by category and time
- **Expense Management:** Edit, delete, view all expenses
- **User Profile:** Manage account settings

### 🎨 UI/UX
- Modern Material-UI design with teal theme
- Responsive layout for mobile and desktop
- Interactive charts with Chart.js
- Clean navigation with protected routes

### 🔐 Security
- Password hashing with werkzeug
- JWT token authentication
- Protected API endpoints
- Secure password storage

### 📊 Technologies
- **Backend:** Flask, SQLAlchemy, SQLite
- **Frontend:** React 19, Material-UI v5, Chart.js
- **ML:** Scikit-learn for categorization
- **OCR:** EasyOCR for receipt processing

## Troubleshooting

### Backend Issues

**Problem: ModuleNotFoundError**
```powershell
# Make sure virtual environment is activated
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

**Problem: Port 5000 already in use**
```python
# In app.py, change the port:
if __name__ == '__main__':
    app.run(debug=True, port=5001)
```

**Problem: Database not created**
```powershell
# The database is auto-created on first run
# Check backend/expense_tracker.db exists after starting Flask
```

### Frontend Issues

**Problem: npm install fails**
```powershell
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules
npm install
```

**Problem: API connection refused**
```javascript
// Check backend is running on port 5000
// Verify in frontend/src/services/api.js:
// baseURL: 'http://127.0.0.1:5000'
```

**Problem: CORS errors**
```python
# Already configured in backend/app.py
# CORS(app) enables all origins in development
```

## API Testing

### Test Registration
```powershell
curl -X POST http://127.0.0.1:5000/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Test Login
```powershell
curl -X POST http://127.0.0.1:5000/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Add Expense (with token)
```powershell
$token = "your-jwt-token-from-login"
curl -X POST http://127.0.0.1:5000/expenses `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"vendor":"Grocery Store","amount":45.99,"date":"2025-01-15","category":"Food"}'
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vendor VARCHAR(100),
    date DATE NOT NULL,
    description TEXT,
    amount FLOAT NOT NULL,
    category VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## File Structure

```
smart-expense-tracker/
│
├── backend/
│   ├── app.py                      # Main Flask application
│   ├── models.py                   # SQLAlchemy database models
│   ├── ocr.py                      # EasyOCR receipt processing
│   ├── ml_model.py                 # ML categorization training
│   ├── requirements.txt            # Python dependencies
│   ├── expense_categorizer_model.pkl  # Trained ML model
│   └── vectorizer.pkl              # TF-IDF vectorizer
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js            # Landing page
│   │   │   ├── Login.js           # Login form
│   │   │   ├── Register.js        # Registration form
│   │   │   ├── Dashboard.js       # Main dashboard
│   │   │   ├── AddExpense.js      # Add expense form
│   │   │   ├── ExpenseHistory.js  # Expense list
│   │   │   ├── Insights.js        # Charts and analytics
│   │   │   └── Profile.js         # User profile
│   │   ├── context/
│   │   │   └── AuthContext.js     # Authentication state
│   │   ├── services/
│   │   │   └── api.js             # Axios API client
│   │   ├── theme.js               # Material-UI theme
│   │   └── App.js                 # Main React component
│   └── package.json                # Node dependencies
│
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
├── DEPLOYMENT_GUIDE.md            # Deployment instructions
└── QUICK_START.md                 # This file
```

## Environment Variables (Production)

Create `.env` file in backend/:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@host:port/dbname
FLASK_ENV=production
```

Create `.env` file in frontend/:
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## Common Commands

### Backend
```powershell
# Activate venv
.\venv\Scripts\activate

# Install new package
pip install package-name
pip freeze > requirements.txt

# Run Flask server
python app.py

# Run in production mode
$env:FLASK_ENV="production"
python app.py
```

### Frontend
```powershell
# Install new package
npm install package-name

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Git
```powershell
# Check status
git status

# Commit changes
git add .
git commit -m "Your message"

# Push to GitHub
git push origin main
```

## Next Steps

1. ✅ Test all features locally
2. ✅ Customize the theme and branding
3. ✅ Add more expense categories
4. ✅ Retrain ML model with your data
5. ✅ Deploy to production (see DEPLOYMENT_GUIDE.md)

## Need Help?

- **Documentation:** See DEPLOYMENT_GUIDE.md for detailed info
- **GitHub Issues:** Report bugs at your repository
- **Flask Docs:** https://flask.palletsprojects.com/
- **React Docs:** https://react.dev/
- **Material-UI:** https://mui.com/

---

**Happy Expense Tracking! 💰**
