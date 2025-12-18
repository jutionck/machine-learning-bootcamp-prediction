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
        # 1. Run Baseline (No SMOTE)
        print("--- Phase 1: Training Baseline Models (No SMOTE) ---")
        baseline_results = predictor.train_and_evaluate_advanced(
            args.data_path, args.target_column, algos, use_smote=False, save_dir=None
        )
        
        # 2. Run SMOTE (Balanced) - Save these models
        print("\n--- Phase 2: Training Balanced Models (SMOTE) ---")
        smote_results = predictor.train_and_evaluate_advanced(
            args.data_path, args.target_column, algos, use_smote=True, save_dir='saved_models'
        )

    # Construct Composite Result
    # We use smote_results as the primary response structure for backward compatibility
    final_response = smote_results.copy()
    
    # Calculate Improvements
    comparison = {}
    for alg in algos:
        if alg in baseline_results and alg in smote_results:
            base_metrics = baseline_results[alg]['metrics']
            smote_metrics = smote_results[alg]['metrics']
            
            # Calculate diffs for all metrics
            # Metrics: accuracy, precision, recall, f1_score, roc_auc
            comparison[alg] = {
                'name': smote_results[alg]['name'],
                'improvements': {
                    'accuracy': smote_metrics['accuracy'] - base_metrics['accuracy'],
                    'precision': smote_metrics['precision'] - base_metrics['precision'],
                    'recall': smote_metrics['recall'] - base_metrics['recall'],
                    'f1_score': smote_metrics['f1_score'] - base_metrics['f1_score'],
                    'roc_auc': smote_metrics['roc_auc'] - base_metrics['roc_auc']
                }
            }
            
    final_response['smote_analysis'] = {
        'without_smote': baseline_results,
        'with_smote': smote_results,
        'comparison': comparison
    }
    
    # Print combined logs
    logs = log_buffer.getvalue()
    if logs:
        print(logs, file=sys.stderr, end="")
        
    print(json.dumps(final_response, default=str))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
