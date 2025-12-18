#!/usr/bin/env python3
import argparse
import json
import sys
import io
import contextlib
from advanced_ml_trainer import AdvancedMLBootcampPredictor


def main():
    parser = argparse.ArgumentParser(description="Run advanced ML trainer and print JSON results to stdout")
    parser.add_argument("--data_path", required=True, help="Path to CSV dataset")
    parser.add_argument("--target_column", default="class", help="Target column name")
    parser.add_argument("--algorithms", required=True, help="Comma-separated algorithm ids")
    parser.add_argument("--use_smote", action="store_true", help="Apply SMOTE on training set")
    args = parser.parse_args()

    algos = [a.strip() for a in args.algorithms.split(",") if a.strip()]

    predictor = AdvancedMLBootcampPredictor()
    log_buffer = io.StringIO()
    # Capture all prints from the trainer to avoid polluting stdout JSON
    with contextlib.redirect_stdout(log_buffer):
        results = predictor.train_and_evaluate_advanced(
            args.data_path, args.target_column, algos, use_smote=args.use_smote, save_dir='saved_models'
        )

    logs = log_buffer.getvalue()
    if logs:
        # Send logs to stderr for visibility without breaking stdout JSON
        print(logs, file=sys.stderr, end="")

    print(json.dumps(results, default=str))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
