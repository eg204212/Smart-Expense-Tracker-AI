# 💰 Smart Expense Tracker with AI Insights

A full-stack web application that helps users track and manage their daily expenses with AI-powered insights. Upload receipts, automatically categorize expenses using machine learning, and visualize spending trends with interactive charts.

![Tech Stack](https://img.shields.io/badge/React-19.2.0-blue)
![Flask](https://img.shields.io/badge/Flask-Latest-green)
![Material_UI](https://img.shields.io/badge/Material_UI-Latest-purple)
![Python](https://img.shields.io/badge/Python-3.9+-yellow)

## ✨ Features

### 🧾 OCR Receipt Scanning
- Upload receipt images (JPG, PNG)
- Automatic text extraction using EasyOCR
- Parse vendor, date, amount, and description

### 🤖 AI Categorization
- Machine learning model predicts expense categories
- Supports: Food, Transport, Bills, Shopping, Entertainment, Healthcare, and more
- Confidence scores for predictions

### 📊 Data Visualization
- **Pie Chart**: Spending distribution by category
- **Bar Chart**: Category-wise expense totals
- **Line Chart**: Daily spending trends
- **Summary Cards**: Total spent, top category, average expense

### 🔐 User Authentication
- Secure JWT-based authentication
- User registration and login
- Protected routes and API endpoints

### 📜 Expense Management
- Add, edit, and delete expenses
- Search and filter by vendor or category
- Detailed expense history table

### 💡 AI Insights
- Spending pattern analysis
- Budget recommendations
- Predictive insights based on historical data

## 🏗️ Architecture

```
smart-expense-tracker/
├── backend/              # Flask API
│   ├── app.py           # Main Flask application
│   ├── models.py        # Data models (User, Expense)
│   ├── ocr.py           # OCR text extraction
│   ├── ml_model.py      # ML training script
│   ├── requirements.txt # Python dependencies
│   └── uploads/         # Receipt storage
│
└── frontend/            # React SPA
    ├── public/
    ├── src/
    │   ├── components/  # React components
    │   ├── context/     # Auth context
    │   ├── services/    # API integration
    │   ├── theme.js     # MUI theme
    │   └── App.js       # Main app component
    └── package.json
```

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **Material-UI (MUI)** - Component library
- **Chart.js & react-chartjs-2** - Data visualization
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Backend
- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **PyJWT** - JWT authentication
- **EasyOCR** - Optical character recognition
- **scikit-learn** - Machine learning
- **pandas** - Data manipulation
- **joblib** - Model persistence

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 16+ and npm
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Create virtual environment**
   ```powershell
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Train the ML model** (first time only)
   ```powershell
   python ml_model.py
   ```

5. **Run the Flask server**
   ```powershell
   python app.py
   ```
   
   Backend will run on `http://127.0.0.1:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Start development server**
   ```powershell
   npm start
   ```
   
   Frontend will run on `http://localhost:3000` (or another port if 3000 is busy)

## 📖 Usage Guide

### 1. **Register & Login**
- Visit the home page at `http://localhost:3000`
- Click "Create Account" to register
- Login with your credentials

### 2. **Add Expenses**
- Navigate to "Add Expense"
- **Option A**: Upload a receipt image
  - Click "Choose File" and select receipt
  - Click "Extract Details" (OCR + AI categorization)
  - Review and edit extracted fields
  - Click "Save Expense"
- **Option B**: Manual entry
  - Fill in vendor, date, description, amount, category
  - Click "Save Expense"

### 3. **View Dashboard**
- See total spent, top category, and average expense
- View pie, bar, and line charts
- Read AI-generated insights

### 4. **Manage Expenses**
- Go to "History" to see all expenses
- Use search to filter by vendor/category
- Edit or delete expenses

### 5. **Profile Settings**
- Update name, email, monthly budget
- Set preferred currency

## 🔌 API Endpoints

### Authentication
- `POST /register` - Create new user
- `POST /login` - User login (returns JWT)

### Expenses
- `POST /add` - Add new expense (protected)
- `GET /list` - Get all user expenses (protected)
- `PUT /update/:id` - Update expense (protected)
- `DELETE /delete/:id` - Delete expense (protected)

### OCR & ML
- `POST /upload` - Upload receipt, extract text
- `POST /categorize` - Predict category from text

## 🎨 Design System

### Colors
- **Primary (Teal)**: `#00A8A8`
- **Secondary (Blue)**: `#007BFF`
- **Background**: `#F6F8FA`

### Typography
- **Font**: Poppins, Inter
- **Weights**: 400 (regular), 600 (semi-bold), 700 (bold)

## 🧪 Testing

### Manual Testing Flow
1. Start backend and frontend servers
2. Register a new user
3. Login
4. Upload a receipt image
5. Verify OCR extraction
6. Check category prediction
7. Save expense
8. View on dashboard
9. Check charts update
10. Test search/filter in history

## 🚢 Deployment

### Backend (Heroku/Render)
```bash
# Procfile
web: python app.py

# Runtime
python-3.9.x
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy 'build' folder
```

### Environment Variables
- Backend: `SECRET_KEY`, `DATABASE_URL` (if using real DB)
- Frontend: `REACT_APP_API_BASE_URL`

## 🔒 Security Notes

⚠️ **Current implementation uses in-memory storage and plain-text passwords for demo purposes.**

For production:
- Use PostgreSQL/MongoDB for persistence
- Hash passwords with bcrypt
- Use environment variables for secrets
- Implement rate limiting
- Add input validation and sanitization
- Set up HTTPS

## 📊 Future Enhancements

- [ ] Budget alerts and notifications
- [ ] Export expenses as CSV/PDF
- [ ] Recurring expense tracking
- [ ] Multi-currency support
- [ ] Dark mode
- [ ] Mobile responsive optimization
- [ ] Bulk upload
- [ ] Expense categories customization
- [ ] Social sharing of insights

## 🐛 Known Issues

- In-memory storage resets on server restart
- OCR accuracy depends on image quality
- Date parsing may fail for non-standard formats

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Push and create a PR

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 👨‍💻 Author

**Chithramali Sewwandi**
- GitHub: [@eg204212](https://github.com/eg204212)
- Email: chithramalisewwandi20@gmail.com

## 🙏 Acknowledgments

- EasyOCR for OCR functionality
- scikit-learn for ML models
- Material-UI for beautiful components
- Chart.js for data visualization

---

**Built with ❤️ using React, Flask, and AI**
