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
            predictions = predictor.predict_new_data(participant_data, model_ids, args.models_dir)
            
            result = {
                "success": True,
                "predictions": predictions,
                "participant_summary": {
                    "logical_score": int(participant_data.get("logical_test_score", 0)),
                    "tech_score": int(participant_data.get("tech_interview_grades", 0)),
                    "age": int(participant_data.get("age", 0))
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
