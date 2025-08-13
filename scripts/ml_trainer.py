import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import AdaBoostClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from imblearn.over_sampling import SMOTE
import json
import sys
import warnings
warnings.filterwarnings('ignore')

class MLBootcampPredictor:
    def __init__(self):
        self.algorithms = {
            'logistic': LogisticRegression(random_state=42, max_iter=1000),
            'decision_tree': DecisionTreeClassifier(random_state=42),
            'knn': KNeighborsClassifier(n_neighbors=5),
            'svm': SVC(random_state=42, probability=True),
            'adaboost': AdaBoostClassifier(random_state=42, algorithm='SAMME'),
            'xgboost': XGBClassifier(random_state=42, eval_metric='logloss')
        }
        
        self.algorithm_names = {
            'logistic': 'Logistic Regression',
            'decision_tree': 'Decision Tree',
            'knn': 'k-Nearest Neighbors',
            'svm': 'Support Vector Machine',
            'adaboost': 'AdaBoost',
            'xgboost': 'XGBoost'
        }
        
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
    def preprocess_data(self, df, target_column, use_smote=False):
        """Preprocess the dataset and optionally apply SMOTE"""
        # Separate features and target
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Handle categorical variables
        categorical_columns = X.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
        
        # Encode target variable
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Apply SMOTE if requested
        if use_smote:
            smote = SMOTE(random_state=42)
            X_train_scaled, y_train = smote.fit_resample(X_train_scaled, y_train)
            
        return X_train_scaled, X_test_scaled, y_train, y_test
    
    def calculate_metrics(self, y_true, y_pred, y_pred_proba):
        """Calculate all evaluation metrics"""
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
            'f1_score': f1_score(y_true, y_pred, average='weighted', zero_division=0),
            'roc_auc': roc_auc_score(y_true, y_pred_proba, multi_class='ovr', average='weighted') if len(np.unique(y_true)) > 2 else roc_auc_score(y_true, y_pred_proba[:, 1])
        }
        return metrics
    
    def train_and_evaluate(self, data_path, target_column, selected_algorithms, use_smote=False):
        """Train selected algorithms and return evaluation results"""
        try:
            # Load data
            df = pd.read_csv(data_path)
            print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
            
            # Preprocess data
            X_train, X_test, y_train, y_test = self.preprocess_data(df, target_column, use_smote)
            print(f"Data preprocessed. Training set: {X_train.shape}, Test set: {X_test.shape}")
            
            if use_smote:
                print(f"SMOTE applied. New training set size: {X_train.shape}")
            
            results = {}
            
            # Train each selected algorithm
            for alg_id in selected_algorithms:
                if alg_id not in self.algorithms:
                    continue
                    
                print(f"Training {self.algorithm_names[alg_id]}...")
                
                # Get the algorithm
                algorithm = self.algorithms[alg_id]
                
                # Train the model
                algorithm.fit(X_train, y_train)
                
                # Make predictions
                y_pred = algorithm.predict(X_test)
                y_pred_proba = algorithm.predict_proba(X_test)
                
                # Calculate metrics
                metrics = self.calculate_metrics(y_test, y_pred, y_pred_proba)
                
                # Store results
                results[alg_id] = {
                    'name': self.algorithm_names[alg_id],
                    'metrics': metrics,
                    'type': 'conventional' if alg_id in ['logistic', 'decision_tree', 'knn', 'svm'] else 'boosting'
                }
                
                print(f"{self.algorithm_names[alg_id]} - Accuracy: {metrics['accuracy']:.4f}")
            
            # Add metadata
            results['metadata'] = {
                'dataset_shape': df.shape,
                'train_shape': X_train.shape,
                'test_shape': X_test.shape,
                'use_smote': use_smote,
                'target_classes': len(np.unique(y_test)),
                'algorithms_trained': len(selected_algorithms)
            }
            
            return results
            
        except Exception as e:
            print(f"Error during training: {str(e)}")
            return {'error': str(e)}

def main():
    """Main function to run the ML training"""
    # Example usage - in real implementation, these would come from the frontend
    predictor = MLBootcampPredictor()
    
    # Sample data for demonstration
    np.random.seed(42)
    n_samples = 1000
    
    # Create synthetic bootcamp dataset
    data = {
        'age': np.random.randint(18, 45, n_samples),
        'education_level': np.random.choice(['High School', 'Bachelor', 'Master', 'PhD'], n_samples),
        'programming_experience': np.random.randint(0, 10, n_samples),
        'math_background': np.random.choice(['Weak', 'Average', 'Strong'], n_samples),
        'motivation_score': np.random.randint(1, 11, n_samples),
        'time_availability': np.random.randint(10, 40, n_samples),
        'bootcamp_success': np.random.choice([0, 1], n_samples, p=[0.3, 0.7])
    }
    
    df = pd.DataFrame(data)
    df.to_csv('/tmp/sample_bootcamp_data.csv', index=False)
    
    # Test both scenarios
    selected_algorithms = ['logistic', 'decision_tree', 'knn', 'svm', 'adaboost', 'xgboost']
    
    print("=== Training WITHOUT SMOTE ===")
    results_no_smote = predictor.train_and_evaluate(
        '/tmp/sample_bootcamp_data.csv', 
        'bootcamp_success', 
        selected_algorithms, 
        use_smote=False
    )
    
    print("\n=== Training WITH SMOTE ===")
    results_with_smote = predictor.train_and_evaluate(
        '/tmp/sample_bootcamp_data.csv', 
        'bootcamp_success', 
        selected_algorithms, 
        use_smote=True
    )
    
    # Save results
    with open('/tmp/ml_results_no_smote.json', 'w') as f:
        json.dump(results_no_smote, f, indent=2, default=str)
        
    with open('/tmp/ml_results_with_smote.json', 'w') as f:
        json.dump(results_with_smote, f, indent=2, default=str)
    
    print("\nTraining completed! Results saved to JSON files.")
    
    # Print summary
    print("\n=== RESULTS SUMMARY ===")
    for scenario, results in [("Without SMOTE", results_no_smote), ("With SMOTE", results_with_smote)]:
        print(f"\n{scenario}:")
        if 'error' not in results:
            for alg_id, result in results.items():
                if alg_id != 'metadata':
                    metrics = result['metrics']
                    print(f"  {result['name']}: Acc={metrics['accuracy']:.3f}, F1={metrics['f1_score']:.3f}, AUC={metrics['roc_auc']:.3f}")

if __name__ == "__main__":
    main()
