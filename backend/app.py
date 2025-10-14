from flask import Flask, jsonify, request
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Basic route
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Smart Expense Tracker API!"})

if __name__ == '__main__':
    app.run(debug=True)