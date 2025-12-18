export interface Metrics {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  roc_auc: number
}

export type AlgorithmType = "conventional" | "boosting"

export interface AlgorithmResult {
  name: string
  metrics: Metrics
  type: AlgorithmType
  best_params?: any
  validation_score?: number
  feature_importance?: { [key: string]: number }
  shap_importance?: { [key: string]: number }
  cv_stats?: {
    mean_f1: number
    std_f1: number
  }
}

export interface TrainingResultsMap {
  [key: string]: AlgorithmResult
}

export interface StatisticalAnalysisItem {
  conventional_algorithm: string
  boosting_algorithm: string
  mcnemar_test: {
    statistic: number
    p_value: number
    significant: boolean
    contingency: any
  }
}

export interface StatisticalAnalysisMap {
  [key: string]: StatisticalAnalysisItem
}

export interface AdvancedMetadata {
  dataset_shape: [number, number]
  train_shape: [number, number]
  validation_shape: [number, number]
  test_shape: [number, number]
  use_smote: boolean
  target_classes: number
  algorithms_trained: number
  feature_names: string[]
  class_distribution: any
}

export interface ComparisonResults {
  without_smote: TrainingResultsMap
  with_smote: TrainingResultsMap
  comparison: {
    [key: string]: {
      name: string
      improvements: Metrics
    }
  }
}
