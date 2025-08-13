import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
import json

class BootcampDataProcessor:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_names = []
        
    def validate_dataset(self, df):
        """Validate bootcamp dataset structure and constraints"""
        errors = []
        
        # Check required columns
        required_columns = ['age', 'gender', 'grades', 'majoring', 'experience',
                          'logical_test_score', 'tech_interview_grades', 'class']
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            errors.append(f"Missing required columns: {missing_cols}")
            
        if len(errors) > 0:
            return False, errors
            
        # Validate data constraints
        for idx, row in df.iterrows():
            # Logical test score validation
            if pd.notna(row['logical_test_score']):
                score = float(row['logical_test_score'])
                if score < 60 or score > 100:
                    errors.append(f"Row {idx+2}: Logical test score must be 60-100 (found: {score})")
                    
            # Tech interview score validation  
            if pd.notna(row['tech_interview_grades']):
                score = float(row['tech_interview_grades'])
                if score < 65 or score > 100:
                    errors.append(f"Row {idx+2}: Tech interview score must be 65-100 (found: {score})")
                    
            # Gender validation
            if pd.notna(row['gender']) and row['gender'].upper() not in ['L', 'P']:
                errors.append(f"Row {idx+2}: Gender must be 'L' or 'P' (found: {row['gender']})")
                
            if pd.notna(row['majoring']) and row['majoring'] not in ['IT', 'Non IT']:
                errors.append(f"Row {idx+2}: Majoring must be 'IT' or 'Non IT' (found: {row['majoring']})")
                
            if pd.notna(row['experience']) and row['experience'].lower() not in ['yes', 'no']:
                errors.append(f"Row {idx+2}: Experience must be 'yes' or 'no' (found: {row['experience']})")
                
            # Class validation
            if pd.notna(row['class']) and row['class'].lower() not in ['pass', 'failed']:
                errors.append(f"Row {idx+2}: Class must be 'pass' or 'failed' (found: {row['class']})")
                
        return len(errors) == 0, errors
    
    def preprocess_data(self, df, target_column='class', apply_smote=False):
        """Preprocess bootcamp dataset with proper handling of categorical variables"""
        
        # Validate dataset first
        is_valid, validation_errors = self.validate_dataset(df)
        if not is_valid:
            raise ValueError(f"Dataset validation failed: {validation_errors}")
        
        # Make a copy to avoid modifying original
        df_processed = df.copy()
        
        # Handle missing values
        df_processed = df_processed.dropna()
        
        # Separate features and target
        X = df_processed.drop(columns=[target_column])
        y = df_processed[target_column]
        
        # Encode target variable
        if target_column not in self.label_encoders:
            self.label_encoders[target_column] = LabelEncoder()
            y_encoded = self.label_encoders[target_column].fit_transform(y)
        else:
            y_encoded = self.label_encoders[target_column].transform(y)
        
        categorical_columns = ['gender', 'grades', 'majoring', 'experience']
        for col in categorical_columns:
            if col in X.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    X[col] = self.label_encoders[col].fit_transform(X[col].astype(str))
                else:
                    X[col] = self.label_encoders[col].transform(X[col].astype(str))
        
        # Ensure numeric columns are properly typed
        numeric_columns = ['age', 'logical_test_score', 'tech_interview_grades']
        for col in numeric_columns:
            if col in X.columns:
                X[col] = pd.to_numeric(X[col], errors='coerce')
        
        # Store feature names
        self.feature_names = list(X.columns)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Apply SMOTE if requested
        if apply_smote:
            smote = SMOTE(random_state=42)
            X_train, y_train = smote.fit_resample(X_train, y_train)
        
        return X_train, X_test, y_train, y_test
    
    def get_feature_info(self):
        """Get information about processed features"""
        return {
            'feature_names': self.feature_names,
            'encoders': {k: list(v.classes_) if hasattr(v, 'classes_') else None 
                        for k, v in self.label_encoders.items()},
            'preprocessing_applied': ['label_encoding', 'standard_scaling']
        }

# Example usage and testing
if __name__ == "__main__":
    # Create sample bootcamp dataset
    np.random.seed(42)
    n_samples = 1000
    
    sample_data = {
        'age': np.random.randint(18, 35, n_samples),
        'gender': np.random.choice(['L', 'P'], n_samples),
        'grades': np.random.choice(['SMA', 'D3', 'S1', 'S2'], n_samples, p=[0.4, 0.3, 0.25, 0.05]),
        'majoring': np.random.choice(['IT', 'Non IT'], n_samples, p=[0.6, 0.4]),
        'experience': np.random.choice(['yes', 'no'], n_samples, p=[0.3, 0.7]),
        'logical_test_score': np.random.randint(60, 101, n_samples),
        'tech_interview_grades': np.random.randint(65, 101, n_samples),
        'class': np.random.choice(['pass', 'failed'], n_samples, p=[0.7, 0.3])
    }
    
    df = pd.DataFrame(sample_data)
    
    processor = BootcampDataProcessor()
    
    # Test validation
    is_valid, errors = processor.validate_dataset(df)
    print(f"Dataset valid: {is_valid}")
    if errors:
        print(f"Validation errors: {errors}")
    
    # Test preprocessing
    try:
        X_train, X_test, y_train, y_test = processor.preprocess_data(df, apply_smote=True)
        print(f"Training set shape: {X_train.shape}")
        print(f"Test set shape: {X_test.shape}")
        print(f"Feature info: {processor.get_feature_info()}")
        print("Preprocessing successful!")
    except Exception as e:
        print(f"Preprocessing failed: {e}")
