from flask import Flask, render_template
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

# Route for /admin
@app.route('/admin')
def admin():
    return render_template('index.html')
@app.route('/')
def home():
    return "Welcome to the Home Page!"
if __name__ == "__main__":
    app.run(debug=True)
