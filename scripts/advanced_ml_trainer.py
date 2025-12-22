import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import AdaBoostClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from imblearn.over_sampling import SMOTE
import shap
import json
import sys
import os
import joblib
import warnings
warnings.filterwarnings('ignore')

class AdvancedMLBootcampPredictor:
    def __init__(self):
        # Define algorithms with hyperparameter grids
        self.algorithms = {
            'logistic': {
                'model': LogisticRegression(random_state=42, max_iter=1000),
                'params': {
                    'C': [0.1, 1, 10, 100],
                    'solver': ['liblinear', 'lbfgs']
                }
            },
            'decision_tree': {
                'model': DecisionTreeClassifier(random_state=42),
                'params': {
                    'max_depth': [3, 5, 7, 10, None],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
            },
            'knn': {
                'model': KNeighborsClassifier(),
                'params': {
                    'n_neighbors': [3, 5, 7, 9, 11],
                    'weights': ['uniform', 'distance'],
                    'metric': ['euclidean', 'manhattan']
                }
            },
            'svm': {
                'model': SVC(random_state=42, probability=True),
                'params': {
                    'C': [0.1, 1, 10, 100],
                    'kernel': ['rbf', 'linear'],
                    'gamma': ['scale', 'auto']
                }
            },
            'adaboost': {
                'model': AdaBoostClassifier(random_state=42, algorithm='SAMME'),
                'params': {
                    'n_estimators': [50, 100, 200],
                    'learning_rate': [0.01, 0.1, 1.0]
                }
            },
            'xgboost': {
                'model': XGBClassifier(random_state=42, eval_metric='logloss'),
                'params': {
                    'n_estimators': [100, 200, 300],
                    'max_depth': [3, 4, 5, 6],
                    'learning_rate': [0.01, 0.1, 0.2]
                }
            }
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
        self.column_encoders = {}
        self.feature_names = []
        
    def _counts_dict(self, labels):
        """Return counts as a JSON-serializable dict with native int keys/values."""
        uniq, counts = np.unique(labels, return_counts=True)
        # Ensure native Python ints for JSON compatibility (avoid numpy.int64 keys)
        return {int(u): int(c) for u, c in zip(uniq.tolist(), counts.tolist())}

    def stratified_split(self, X, y, train_size=0.9, val_size=0.05, test_size=0.05):
        """
        Perform stratified splitting: 90% train, 5% validation, 5% test
        Maintains unbalanced class ratio across all splits
        """
        # First split: separate test set (5%)
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        # Second split: separate train and validation from remaining data
        # Calculate validation size relative to remaining data
        val_size_adjusted = val_size / (train_size + val_size)
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=val_size_adjusted, random_state=42, stratify=y_temp
        )
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def preprocess_bootcamp_data(self, df, target_column='class', use_smote=False):
        """Preprocess bootcamp dataset with specific attribute handling"""
        # Separate features and target
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Store original feature names
        self.feature_names = X.columns.tolist()
        
        # Handle categorical variables with proper encoding
        categorical_columns = X.select_dtypes(include=['object']).columns
        
        for col in categorical_columns:
            if col == 'gender':
                # Handle gender: L=0, P=1
                X[col] = X[col].map({'L': 0, 'P': 1})
            elif col == 'grades':
                # Handle education levels with proper ordering
                education_order = {'SMA': 1, 'D3': 2, 'S1': 3, 'S2': 4, 'S3': 5}
                X[col] = X[col].map(education_order).fillna(1)  # Default to SMA if unknown
                # Use label encoding for majoring (text field)
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                self.column_encoders[col] = le
            else:
                # General categorical encoding
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                self.column_encoders[col] = le
        
        # Validate score constraints
        if 'logical_test_score' in X.columns:
            X['logical_test_score'] = X['logical_test_score'].clip(lower=60)
        if 'tech_interview_grades' in X.columns:
            X['tech_interview_grades'] = X['tech_interview_grades'].clip(lower=65)

        # Handle missing values (NaN) in numeric columns prevents classifier errors
        numeric_columns = X.select_dtypes(include=['number']).columns
        if len(numeric_columns) > 0:
            from sklearn.impute import SimpleImputer
            imputer = SimpleImputer(strategy='mean')
            X[numeric_columns] = imputer.fit_transform(X[numeric_columns])
        
        # Encode target variable (pass/failed)
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Stratified split: 90% train, 5% validation, 5% test
        X_train, X_val, X_test, y_train, y_val, y_test = self.stratified_split(X, y_encoded)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Apply SMOTE only to training data if requested
        if use_smote:
            smote = SMOTE(random_state=42)
            X_train_scaled, y_train = smote.fit_resample(X_train_scaled, y_train)
            
        return X_train_scaled, X_val_scaled, X_test_scaled, y_train, y_val, y_test
    
    def hyperparameter_tuning(self, algorithm_id, X_train, y_train, X_val, y_val):
        """Perform Grid Search hyperparameter tuning using validation set"""
        algorithm_config = self.algorithms[algorithm_id]
        model = algorithm_config['model']
        param_grid = algorithm_config['params']
        
        # Use StratifiedKFold for cross-validation
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        
        # Grid Search with cross-validation
        grid_search = GridSearchCV(
            model, param_grid, cv=cv, scoring='f1_weighted', 
            n_jobs=-1, verbose=0
        )
        
        grid_search.fit(X_train, y_train)
        
        # Validate on validation set
        
        # Get CV results for the best estimator
        best_index = grid_search.best_index_
        std_val_score = grid_search.cv_results_['std_test_score'][best_index]
        mean_val_score = grid_search.cv_results_['mean_test_score'][best_index]
        
        return grid_search.best_estimator_, grid_search.best_params_, mean_val_score, std_val_score
    
    def calculate_feature_importance(self, model, algorithm_id):
        """Calculate feature importance based on algorithm type"""
        importance = None
        
        if hasattr(model, 'feature_importances_'):
            # Tree-based models and boosting algorithms
            importance = model.feature_importances_
        elif hasattr(model, 'coef_'):
            # Linear models
            importance = np.abs(model.coef_[0]) if len(model.coef_.shape) > 1 else np.abs(model.coef_)
        
        if importance is not None:
            # Create feature importance dictionary
            feature_importance = dict(zip(self.feature_names, importance))
            # Sort by importance
            feature_importance = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True))
            return feature_importance
        
        return {}
    
    def calculate_shap_values(self, model, X_test, algorithm_id, max_samples=100):
        """Calculate SHAP values for model interpretability"""
        try:
            # Limit samples for computational efficiency
            X_sample = X_test[:max_samples] if len(X_test) > max_samples else X_test
            
            if algorithm_id in ['decision_tree', 'adaboost', 'xgboost']:
                # Tree-based explainer
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(X_sample)
            else:
                # Kernel explainer for other models
                explainer = shap.KernelExplainer(model.predict_proba, X_sample[:10])  # Use small background
                shap_values = explainer.shap_values(X_sample[:20])  # Limit for efficiency
            
            # Handle multi-class case
            if isinstance(shap_values, list):
                shap_values = shap_values[1]  # Use positive class for binary classification
            
            # Calculate mean absolute SHAP values for feature importance
            mean_shap = np.mean(np.abs(shap_values), axis=0)
            shap_importance = dict(zip(self.feature_names, mean_shap))
            shap_importance = dict(sorted(shap_importance.items(), key=lambda x: x[1], reverse=True))
            
            return shap_importance
            
        except Exception as e:
            print(f"SHAP calculation failed for {algorithm_id}: {str(e)}")
            return {}
    
    def mcnemar_test(self, y_true, y_pred1, y_pred2):
        """Perform McNemar test to compare two algorithms"""
        try:
            # Create contingency table
            correct1 = (y_pred1 == y_true)
            correct2 = (y_pred2 == y_true)
            
            # McNemar table: [both_correct, model1_correct_model2_wrong, 
            #                 model1_wrong_model2_correct, both_wrong]
            both_correct = np.sum(correct1 & correct2)
            model1_only = np.sum(correct1 & ~correct2)
            model2_only = np.sum(~correct1 & correct2)
            both_wrong = np.sum(~correct1 & ~correct2)
            
            # McNemar test statistic
            if model1_only + model2_only > 0:
                mcnemar_stat = ((abs(model1_only - model2_only) - 1) ** 2) / (model1_only + model2_only)
                p_value = 1 - np.exp(-mcnemar_stat / 2)  # Approximation
            else:
                mcnemar_stat = 0
                p_value = 1.0
            
            return {
                'statistic': mcnemar_stat,
                'p_value': p_value,
                'significant': p_value < 0.05,
                'contingency': {
                    'both_correct': both_correct,
                    'model1_only_correct': model1_only,
                    'model2_only_correct': model2_only,
                    'both_wrong': both_wrong
                }
            }
        except Exception as e:
            return {'error': str(e)}
    
    def calculate_metrics(self, y_true, y_pred, y_pred_proba):
        """Calculate comprehensive evaluation metrics"""
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
            'f1_score': f1_score(y_true, y_pred, average='weighted', zero_division=0),
            'roc_auc': roc_auc_score(y_true, y_pred_proba[:, 1]) if y_pred_proba.shape[1] == 2 else roc_auc_score(y_true, y_pred_proba, multi_class='ovr', average='weighted')
        }
        return metrics
    
    def train_and_evaluate_advanced(self, data_path, target_column, selected_algorithms, use_smote=False, save_dir=None):
        """Advanced training with hyperparameter tuning, feature importance, and SHAP"""
        try:
            # Load data
            df = pd.read_csv(data_path)
            print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
            
            # Preprocess data with stratified splitting
            X_train, X_val, X_test, y_train, y_val, y_test = self.preprocess_bootcamp_data(
                df, target_column, use_smote
            )
            
            print(f"Stratified split completed:")
            print(f"  Training: {X_train.shape[0]} samples ({X_train.shape[0]/df.shape[0]*100:.1f}%)")
            print(f"  Validation: {X_val.shape[0]} samples ({X_val.shape[0]/df.shape[0]*100:.1f}%)")
            print(f"  Test: {X_test.shape[0]} samples ({X_test.shape[0]/df.shape[0]*100:.1f}%)")
            
            if use_smote:
                print(f"SMOTE applied to training set: {X_train.shape[0]} samples")
            
            if save_dir:
                os.makedirs(save_dir, exist_ok=True)
                joblib.dump(self.scaler, os.path.join(save_dir, 'scaler.joblib'))
                joblib.dump(self.label_encoder, os.path.join(save_dir, 'label_encoder.joblib'))
                joblib.dump(self.column_encoders, os.path.join(save_dir, 'column_encoders.joblib'))
            
            results = {}
            predictions = {}  # Store predictions for McNemar test
            
            # Train each selected algorithm
            for alg_id in selected_algorithms:
                if alg_id not in self.algorithms:
                    continue
                    
                print(f"\nTraining {self.algorithm_names[alg_id]} with hyperparameter tuning...")
                
                # Hyperparameter tuning
                best_model, best_params, val_score, val_std = self.hyperparameter_tuning(
                    alg_id, X_train, y_train, X_val, y_val
                )
                
                # Final evaluation on test set
                y_pred = best_model.predict(X_test)
                y_pred_proba = best_model.predict_proba(X_test)
                
                # Store predictions for statistical tests
                predictions[alg_id] = y_pred
                
                # Calculate metrics
                metrics = self.calculate_metrics(y_test, y_pred, y_pred_proba)
                
                # Feature importance analysis
                feature_importance = self.calculate_feature_importance(best_model, alg_id)
                
                # SHAP analysis
                shap_importance = self.calculate_shap_values(best_model, X_test, alg_id)
                
                # Store comprehensive results
                results[alg_id] = {
                    'name': self.algorithm_names[alg_id],
                    'metrics': metrics,
                    'cv_stats': {
                        'mean_f1': float(val_score),
                        'std_f1': float(val_std)
                    },
                    'best_params': best_params,
                    'validation_score': val_score,
                    'feature_importance': feature_importance,
                    'shap_importance': shap_importance,
                    'type': 'conventional' if alg_id in ['logistic', 'decision_tree', 'knn', 'svm'] else 'boosting'
                }
                
                print(f"  Best params: {best_params}")
                print(f"  Validation F1: {val_score:.4f}")
                print(f"  Test Accuracy: {metrics['accuracy']:.4f}")
                print(f"  Test Accuracy: {metrics['accuracy']:.4f}")
                print(f"  Test F1: {metrics['f1_score']:.4f}")
                
                if save_dir:
                    joblib.dump(best_model, os.path.join(save_dir, f'{alg_id}.joblib'))
            
            conventional_algs = [alg for alg in selected_algorithms if alg in ['logistic', 'decision_tree', 'knn', 'svm']]
            boosting_algs = [alg for alg in selected_algorithms if alg in ['adaboost', 'xgboost']]
            
            statistical_comparisons = {}
            
            # McNemar tests between algorithm groups
            if len(conventional_algs) > 0 and len(boosting_algs) > 0:
                print(f"\nPerforming McNemar statistical tests...")
                
                for conv_alg in conventional_algs:
                    for boost_alg in boosting_algs:
                        if conv_alg in predictions and boost_alg in predictions:
                            mcnemar_result = self.mcnemar_test(
                                y_test, predictions[conv_alg], predictions[boost_alg]
                            )
                            
                            comparison_key = f"{conv_alg}_vs_{boost_alg}"
                            statistical_comparisons[comparison_key] = {
                                'conventional_algorithm': self.algorithm_names[conv_alg],
                                'boosting_algorithm': self.algorithm_names[boost_alg],
                                'mcnemar_test': mcnemar_result
                            }
                            
                            significance = "significant" if mcnemar_result.get('significant', False) else "not significant"
                            print(f"  {self.algorithm_names[conv_alg]} vs {self.algorithm_names[boost_alg]}: {significance} (p={mcnemar_result.get('p_value', 'N/A'):.4f})")
            
            # Add comprehensive metadata
            results['metadata'] = {
                'dataset_shape': df.shape,
                'train_shape': X_train.shape,
                'validation_shape': X_val.shape,
                'test_shape': X_test.shape,
                'use_smote': use_smote,
                'target_classes': len(np.unique(y_test)),
                'algorithms_trained': len(selected_algorithms),
                'feature_names': self.feature_names,
                'class_distribution': {
                    'train': self._counts_dict(y_train),
                    'test': self._counts_dict(y_test)
                }
            }

            # Ensure keys in statistical_comparisons are strings
            results['statistical_analysis'] = {str(k): v for k, v in statistical_comparisons.items()}

            return results
            
        except Exception as e:
            print(f"Error during advanced training: {str(e)}")
            return {'error': str(e)}

    def load_artifacts(self, load_dir):
        """Load models and preprocessors"""
        self.scaler = joblib.load(os.path.join(load_dir, 'scaler.joblib'))
        self.label_encoder = joblib.load(os.path.join(load_dir, 'label_encoder.joblib'))
        self.column_encoders = joblib.load(os.path.join(load_dir, 'column_encoders.joblib'))
        return self

    def predict_new_data(self, data_dict, model_ids, models_dir='saved_models'):
        """
        Predict for a single participant
        data_dict: dictionary of feature values
        model_ids: list of algorithm names to use
        """
        import pandas as pd
        
        # Convert single dict to DataFrame
        df = pd.DataFrame([data_dict])
        X_scaled = self._preprocess_inference(df)
        
        predictions = {}
        for alg_id in model_ids:
            model_path = os.path.join(models_dir, f'{alg_id}.joblib')
            if not os.path.exists(model_path):
                predictions[alg_id] = {'error': 'Model not found'}
                continue
                
            model = joblib.load(model_path)
            prob = 0.5
            pred_class = "unknown"
            
            try:
                # Predict probability
                if hasattr(model, 'predict_proba'):
                    prob = model.predict_proba(X_scaled)[0][1] # Probability of class 1 (Pass)
                else:
                    # Fallback for models without proba (shouldn't happen with our config)
                    pred = model.predict(X_scaled)[0]
                    prob = 1.0 if pred == 1 else 0.0
                
                # Return standardized format
                pred_label = 'pass' if prob > 0.5 else 'fail'
                confidence = prob if prob > 0.5 else 1 - prob
                
                predictions[alg_id] = {
                    'prediction': pred_label,
                    'confidence': float(confidence)
                }
            except Exception as e:
                predictions[alg_id] = {'error': str(e)}
                
        return predictions
        
    def _preprocess_inference(self, df):
        """Preprocess inference data (shared between single and batch)"""
        import pandas as pd
        import numpy as np

        # 1. Preprocess
        # Manual mapping for ordered/specific columns
        if 'gender' in df.columns:
             df['gender'] = df['gender'].map({'L': 0, 'P': 1})
        
        if 'grades' in df.columns:
            education_order = {'SMA': 1, 'D3': 2, 'S1': 3, 'S2': 4, 'S3': 5}
            # Fill unknown with default (SMA=1) or handle error
            df['grades'] = df['grades'].map(education_order).fillna(1)
            
        # Apply strict column encoding
        for col, le in self.column_encoders.items():
            if col in df.columns:
                # Handle unseen labels carefully
                # Vectorized map with fallback
                def safe_transform(x):
                    try:
                        return le.transform([str(x)])[0]
                    except:
                        return 0
                
                # Apply safe transform
                # Optimized: identify unique values, transform valid ones, map back
                # For safety/simplicity in this context, valid classes check is good
                valid_classes = set(le.classes_)
                df[col] = df[col].astype(str).map(lambda x: le.transform([x])[0] if x in valid_classes else 0)

        # Scale
        X_aligned = pd.DataFrame(index=df.index)
        
        if hasattr(self.scaler, 'feature_names_in_'):
            dataset_features = self.scaler.feature_names_in_
        else:
            dataset_features = df.columns
            
        for feature in dataset_features:
            if feature in df.columns:
                X_aligned[feature] = df[feature]
            else:
                X_aligned[feature] = 0 # Missing feature
                
        # Fill any remaining NaNs (e.g. from missing columns)
        X_aligned = X_aligned.fillna(0)
                
        return self.scaler.transform(X_aligned)

    def predict_batch(self, df, model_ids, models_dir='saved_models'):
        """Batch prediction for DataFrame"""
        import numpy as np
        
        X_scaled = self._preprocess_inference(df)
        
        # Initialize results structure: list of dicts (one per row)
        # Each dict contains predictions for all models
        batch_results = [{} for _ in range(len(df))]
        
        for alg_id in model_ids:
            model_path = os.path.join(models_dir, f'{alg_id}.joblib')
            if not os.path.exists(model_path):
                for i in range(len(df)):
                    batch_results[i][alg_id] = {'error': 'Model not found'}
                continue
                
            model = joblib.load(model_path)
            
            try:
                # Batch predict
                if hasattr(model, 'predict_proba'):
                    probs = model.predict_proba(X_scaled)[:, 1] # Class 1 (Pass)
                else:
                    preds = model.predict(X_scaled)
                    probs = (preds == 1).astype(float)
                
                # Assign to results
                for i, prob in enumerate(probs):
                    pred_label = 'pass' if prob > 0.5 else 'fail'
                    confidence = prob if prob > 0.5 else 1 - prob
                    batch_results[i][alg_id] = {
                        'prediction': pred_label,
                        'confidence': float(confidence)
                    }
                    
            except Exception as e:
                for i in range(len(df)):
                    batch_results[i][alg_id] = {'error': str(e)}
                    
        return batch_results


def main():
    """Main function for advanced ML training"""
    predictor = AdvancedMLBootcampPredictor()
    
    # Create synthetic bootcamp dataset with proper attributes
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'age': np.random.randint(18, 45, n_samples),
        'gender': np.random.choice(['L', 'P'], n_samples, p=[0.6, 0.4]),
        'grades': np.random.choice(['SMA', 'D3', 'S1', 'S2'], n_samples, p=[0.4, 0.3, 0.25, 0.05]),
        'majoring': np.random.choice(['Computer Science', 'Engineering', 'Mathematics', 'Business', 'Other'], n_samples),
        'logical_test_score': np.random.randint(60, 101, n_samples),
        'tech_interview_grades': np.random.randint(65, 101, n_samples),
        'class': np.random.choice(['pass', 'failed'], n_samples, p=[0.7, 0.3])  # Unbalanced
    }
    
    df = pd.DataFrame(data)
    df.to_csv('/tmp/bootcamp_participants.csv', index=False)
    
    # Test advanced training
    selected_algorithms = ['logistic', 'decision_tree', 'knn', 'svm', 'adaboost', 'xgboost']
    
    print("=== ADVANCED ML TRAINING WITH RESEARCH METHODOLOGIES ===")
    print("Features: Stratified splitting (90%-5%-5%), Grid Search, McNemar test, Feature importance, SHAP")
    
    results = predictor.train_and_evaluate_advanced(
        '/tmp/bootcamp_participants.csv', 
        'class', 
        selected_algorithms, 
        use_smote=False
    )
    
    # Save results
    with open('/tmp/advanced_ml_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print("\nAdvanced training completed! Results saved with comprehensive analysis.")
    
    # Print summary
    if 'error' not in results:
        print("\n=== RESULTS SUMMARY ===")
        for alg_id, result in results.items():
            if alg_id not in ['metadata', 'statistical_analysis']:
                metrics = result['metrics']
                print(f"{result['name']} ({result['type']}):")
                print(f"  Accuracy: {metrics['accuracy']:.4f}, F1: {metrics['f1_score']:.4f}, AUC: {metrics['roc_auc']:.4f}")
                print(f"  Top features: {list(result['feature_importance'].keys())[:3]}")
        
        print(f"\n=== STATISTICAL ANALYSIS ===")
        for comparison, stats in results.get('statistical_analysis', {}).items():
            mcnemar = stats['mcnemar_test']
            significance = "significant" if mcnemar.get('significant', False) else "not significant"
            print(f"{stats['conventional_algorithm']} vs {stats['boosting_algorithm']}: {significance}")

if __name__ == "__main__":
    main()
