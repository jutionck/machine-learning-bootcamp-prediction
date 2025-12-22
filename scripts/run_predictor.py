#!/usr/bin/env python3
import argparse
import json
import sys
from advanced_ml_trainer import AdvancedMLBootcampPredictor

def main():
    parser = argparse.ArgumentParser(description="Run prediction using saved models")
    parser.add_argument("--participant", required=False, help="JSON string of participant data")
    parser.add_argument("--csv_file", required=False, help="Path to CSV file for batch prediction")
    parser.add_argument("--models", required=True, help="Comma-separated list of model IDs")
    parser.add_argument("--models_dir", default="saved_models", help="Directory containing saved models")
    args = parser.parse_args()

    try:
        model_ids = [m.strip() for m in args.models.split(",") if m.strip()]
        predictor = AdvancedMLBootcampPredictor()
        
        try:
            predictor.load_artifacts(args.models_dir)
        except Exception as e:
            print(json.dumps({"error": f"Failed to load model artifacts: {str(e)}. Please run training first."}))
            sys.exit(1)
            
        if args.csv_file:
            import pandas as pd
            df = pd.read_csv(args.csv_file)
            
            # Column mapping for batch compatibility
            # Ensure names match model's expected features (Title Case usually)
            column_map = {
                'tech_interview_result': 'Tech Interview Result',
                'education': 'Education', 
                'grades': 'Education', # Fallback
                'logical_test_score': 'Logical Test Score',
                'age': 'Age'
            }
            df = df.rename(columns=column_map)
            
            predictions = predictor.predict_batch(df, model_ids, args.models_dir)
            result = {
                "success": True,
                "batch_predictions": predictions,
                "summary": {
                    "total_rows": len(df),
                    "columns": list(df.columns)
                }
            }
        elif args.participant:
            participant_data = json.loads(args.participant)
            # Ensure keys match model expectations (Run mapping inside predict_new_data or here)
            # The model likely expects 'Tech Interview Result' (Title Case) or 'tech_interview_result' depending on how it was trained.
            # Based on generate_thesis_plots.py, features are: ['Logical Test Score', 'Tech Interview Result', 'Education_Num', 'Age']
            
            # Simple mapper for single prediction entry compatibility
            if 'tech_interview_result' in participant_data:
                # Handle Pass/Fail -> 1.0/0.0 or keep as is if model expects string
                val = participant_data['tech_interview_result']
                if str(val).lower() == 'pass':
                    participant_data['Tech Interview Result'] = 1.0
                elif str(val).lower() == 'fail' or str(val).lower() == 'failed':
                    participant_data['Tech Interview Result'] = 0.0
                else:
                    # Fallback for numeric or other strings
                    try:
                        participant_data['Tech Interview Result'] = float(val)
                    except:
                        participant_data['Tech Interview Result'] = 0.0
            
            if 'grades' in participant_data:
                 participant_data['Grades'] = participant_data['grades']
            # Fallback/Aliases
            if 'education' in participant_data and 'Grades' not in participant_data:
                 participant_data['Grades'] = participant_data['education']
                 
            if 'logical_test_score' in participant_data:
                 participant_data['Logical Test Score'] = float(participant_data['logical_test_score'])
            if 'age' in participant_data:
                 participant_data['Age'] = int(participant_data['age'])
            
            predictions = predictor.predict_new_data(participant_data, model_ids, args.models_dir)
            
            result = {
                "success": True,
                "predictions": predictions,
                "participant_summary": {
                    "logical_score": int(participant_data.get("Logical Test Score", 0)),
                    "tech_score": int(participant_data.get("Tech Interview Result", 0)),
                    "age": int(participant_data.get("Age", 0))
                }
            }
        else:
            raise ValueError("Either --participant or --csv_file must be provided")
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e), "success": False}))
        sys.exit(1)

if __name__ == "__main__":
    main()
