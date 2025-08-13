import json
import os
from ml_trainer import MLBootcampPredictor

def handle_training_request(request_data):
    """Handle training request from the frontend"""
    try:
        # Extract parameters from request
        file_path = request_data.get('file_path')
        target_column = request_data.get('target_column', 'target')
        selected_algorithms = request_data.get('algorithms', [])
        use_smote = request_data.get('use_smote', False)
        
        # Initialize predictor
        predictor = MLBootcampPredictor()
        
        # Train and evaluate
        results = predictor.train_and_evaluate(
            file_path, target_column, selected_algorithms, use_smote
        )
        
        return {
            'success': True,
            'results': results,
            'message': f'Successfully trained {len(selected_algorithms)} algorithms'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Training failed'
        }

def compare_smote_results(file_path, target_column, selected_algorithms):
    """Compare results with and without SMOTE"""
    predictor = MLBootcampPredictor()
    
    # Train without SMOTE
    results_no_smote = predictor.train_and_evaluate(
        file_path, target_column, selected_algorithms, use_smote=False
    )
    
    # Train with SMOTE
    results_with_smote = predictor.train_and_evaluate(
        file_path, target_column, selected_algorithms, use_smote=True
    )
    
    return {
        'without_smote': results_no_smote,
        'with_smote': results_with_smote,
        'comparison': generate_comparison_summary(results_no_smote, results_with_smote)
    }

def generate_comparison_summary(results_no_smote, results_with_smote):
    """Generate a summary comparing SMOTE vs no SMOTE results"""
    comparison = {}
    
    if 'error' in results_no_smote or 'error' in results_with_smote:
        return {'error': 'Could not generate comparison due to training errors'}
    
    for alg_id in results_no_smote:
        if alg_id == 'metadata':
            continue
            
        if alg_id in results_with_smote:
            no_smote_metrics = results_no_smote[alg_id]['metrics']
            with_smote_metrics = results_with_smote[alg_id]['metrics']
            
            comparison[alg_id] = {
                'name': results_no_smote[alg_id]['name'],
                'improvements': {
                    'accuracy': with_smote_metrics['accuracy'] - no_smote_metrics['accuracy'],
                    'precision': with_smote_metrics['precision'] - no_smote_metrics['precision'],
                    'recall': with_smote_metrics['recall'] - no_smote_metrics['recall'],
                    'f1_score': with_smote_metrics['f1_score'] - no_smote_metrics['f1_score'],
                    'roc_auc': with_smote_metrics['roc_auc'] - no_smote_metrics['roc_auc']
                }
            }
    
    return comparison

# Example usage for testing
if __name__ == "__main__":
    # Test the API handler
    test_request = {
        'file_path': '/tmp/sample_bootcamp_data.csv',
        'target_column': 'bootcamp_success',
        'algorithms': ['logistic', 'decision_tree', 'xgboost'],
        'use_smote': True
    }
    
    result = handle_training_request(test_request)
    print(json.dumps(result, indent=2, default=str))
