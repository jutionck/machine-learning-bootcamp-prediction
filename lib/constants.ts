export const algorithms = [
  { id: "logistic", name: "Logistic Regression", type: "conventional" as const },
  { id: "decision_tree", name: "Decision Tree", type: "conventional" as const },
  { id: "knn", name: "k-Nearest Neighbors", type: "conventional" as const },
  { id: "svm", name: "Support Vector Machine", type: "conventional" as const },
  { id: "adaboost", name: "AdaBoost", type: "boosting" as const },
  { id: "xgboost", name: "XGBoost", type: "boosting" as const },
]

export const metricNames = {
  accuracy: "Accuracy",
  precision: "Precision",
  recall: "Recall",
  f1_score: "F1-Score",
  roc_auc: "ROC-AUC",
} as const

export const datasetAttributes = [
  { name: "age", type: "numeric", description: "Age of participant" },
  { name: "gender", type: "categorical", description: "Gender (L/P)", values: ["L", "P"] },
  {
    name: "grades",
    type: "categorical",
    description: "Education level (SMA, D3, S1, etc)",
    values: ["SMA", "D3", "S1", "S2", "S3"],
  },
  {
    name: "logical_test_score",
    type: "numeric",
    description: "Logical test score (0-100, standard: 60 for next step)",
    min: 0,
    max: 100,
  },
  {
    name: "tech_interview_result",
    type: "categorical",
    description: "Technical interview result (Pass/Fail)",
    values: ["Pass", "Fail"],
  },
  { name: "class", type: "target", description: "Target variable (pass/failed)", values: ["pass", "failed"] },
] as const
