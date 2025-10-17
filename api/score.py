from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from pathlib import Path

# Add the scorer directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent / 'scorer'))

from score import calculate_score, validate_submission_data, load_iris_data
import pandas as pd
import io

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get the request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            data = json.loads(post_data.decode('utf-8'))
            csv_content = data.get('csv_content')
            username = data.get('username')
            
            if not csv_content or not username:
                self.send_error(400, 'Missing csv_content or username')
                return
            
            # Parse CSV content
            df = pd.read_csv(io.StringIO(csv_content))
            
            # Validate data
            validation_result = validate_submission_data(df)
            if not validation_result:
                self.send_error(400, 'Invalid CSV data')
                return
            
            # Load reference data and calculate score
            reference_data = load_iris_data()
            
            # For now, we'll use a simple mock scoring
            # In a real implementation, you'd train a model and make predictions
            import numpy as np
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.model_selection import train_test_split
            from sklearn.metrics import accuracy_score, f1_score
            
            # Prepare reference data
            X_ref = reference_data[['sepal_length', 'sepal_width', 'petal_length', 'petal_width']]
            y_ref = reference_data['species']
            
            # Train a simple model
            X_train, X_test, y_train, y_test = train_test_split(X_ref, y_ref, test_size=0.2, random_state=42)
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Make predictions on test data
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='weighted')
            score = 0.7 * accuracy + 0.3 * f1
            
            # Prepare response
            result = {
                'success': True,
                'score': float(score),
                'accuracy': float(accuracy),
                'f1_score': float(f1),
                'username': username
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_error(500, f'Internal server error: {str(e)}')
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
