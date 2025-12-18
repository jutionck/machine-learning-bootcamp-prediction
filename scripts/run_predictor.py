#!/usr/bin/env python3
import argparse
import json
import sys
from advanced_ml_trainer import AdvancedMLBootcampPredictor

def main():
    parser = argparse.ArgumentParser(description="Run prediction using saved models")
    parser.add_argument("--participant", required=True, help="JSON string of participant data")
    parser.add_argument("--models", required=True, help="Comma-separated list of model IDs")
    parser.add_argument("--models_dir", default="saved_models", help="Directory containing saved models")
    args = parser.parse_args()

    try:
        participant_data = json.loads(args.participant)
        model_ids = [m.strip() for m in args.models.split(",") if m.strip()]
        
        predictor = AdvancedMLBootcampPredictor()
        
        try:
            predictor.load_artifacts(args.models_dir)
        except Exception as e:
            print(json.dumps({"error": f"Failed to load model artifacts: {str(e)}. Please run training first."}))
            sys.exit(1)
            
        predictions = predictor.predict_new_data(participant_data, model_ids, args.models_dir)
        
        result = {
            "success": True,
            "predictions": predictions,
            "participant_summary": {
                # Echo back some summary stats used
                "logical_score": int(participant_data.get("logical_test_score", 0)),
                "tech_score": int(participant_data.get("tech_interview_grades", 0)), # Note mismatch handling
                "age": int(participant_data.get("age", 0))
            }
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e), "success": False}))
        sys.exit(1)

if __name__ == "__main__":
    main()
