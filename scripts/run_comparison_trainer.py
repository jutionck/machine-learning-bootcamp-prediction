#!/usr/bin/env python3
import argparse
import json
import sys
import io
import contextlib
from advanced_ml_trainer import AdvancedMLBootcampPredictor


def main():
    parser = argparse.ArgumentParser(description="Run comparison trainer (SMOTE vs No SMOTE)")
    parser.add_argument("--data_path", required=True, help="Path to CSV dataset")
    parser.add_argument("--target_column", default="class", help="Target column name")
    parser.add_argument("--algorithms", required=True, help="Comma-separated algorithm ids")
    args = parser.parse_args()

    algos = [a.strip() for a in args.algorithms.split(",") if a.strip()]

    predictor = AdvancedMLBootcampPredictor()
    
    # We will run twice: once without SMOTE, once with SMOTE
    # We capture logs to stderr so stdout is clean JSON

    log_buffer = io.StringIO()
    
    with contextlib.redirect_stdout(log_buffer):
        # 1. Run Baseline (No SMOTE)
        print("Running Baseline (No SMOTE)...")
        without_smote = predictor.train_and_evaluate_advanced(
            args.data_path, args.target_column, algos, use_smote=False
        )

        # 2. Run SMOTE
        print("Running with SMOTE...")
        with_smote = predictor.train_and_evaluate_advanced(
            args.data_path, args.target_column, algos, use_smote=True
        )
    
    # Process comparison
    comparison = {}
    for alg_id in algos:
        if alg_id in without_smote and alg_id in with_smote:
            base_metrics = without_smote[alg_id]['metrics']
            smote_metrics = with_smote[alg_id]['metrics']
            
            comparison[alg_id] = {
                "name": without_smote[alg_id]['name'],
                "improvements": {
                    "accuracy": smote_metrics['accuracy'] - base_metrics['accuracy'],
                    "precision": smote_metrics['precision'] - base_metrics['precision'],
                    "recall": smote_metrics['recall'] - base_metrics['recall'],
                    "f1_score": smote_metrics['f1_score'] - base_metrics['f1_score'],
                    "roc_auc": smote_metrics['roc_auc'] - base_metrics['roc_auc']
                }
            }

    final_output = {
        "without_smote": without_smote,
        "with_smote": with_smote,
        "comparison": comparison
    }

    # Print any logs to stderr
    logs = log_buffer.getvalue()
    if logs:
        print(logs, file=sys.stderr, end="")

    print(json.dumps(final_output, default=str))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
