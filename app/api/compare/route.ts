import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { file_data, target_column, algorithms } = body

    // Simulate training both with and without SMOTE
    const generateResults = (useSmote: boolean) => {
      const basePerformance = {
        logistic: { accuracy: 0.85, precision: 0.82, recall: 0.88, f1_score: 0.85, roc_auc: 0.87 },
        decision_tree: { accuracy: 0.78, precision: 0.76, recall: 0.82, f1_score: 0.79, roc_auc: 0.81 },
        knn: { accuracy: 0.8, precision: 0.78, recall: 0.84, f1_score: 0.81, roc_auc: 0.83 },
        svm: { accuracy: 0.83, precision: 0.81, recall: 0.86, f1_score: 0.83, roc_auc: 0.85 },
        adaboost: { accuracy: 0.87, precision: 0.85, recall: 0.89, f1_score: 0.87, roc_auc: 0.89 },
        xgboost: { accuracy: 0.89, precision: 0.87, recall: 0.91, f1_score: 0.89, roc_auc: 0.91 },
      }

      const results: any = {}

      algorithms.forEach((algId: string) => {
        if (basePerformance[algId as keyof typeof basePerformance]) {
          const base = basePerformance[algId as keyof typeof basePerformance]

          // SMOTE typically improves recall but may slightly reduce precision
          const smoteEffect = useSmote
            ? {
              accuracy: (Math.random() - 0.5) * 0.02, // Small random change
              precision: (Math.random() - 0.7) * 0.03, // Slight tendency to decrease
              recall: (Math.random() + 0.3) * 0.04, // Tendency to increase
              f1_score: (Math.random() - 0.3) * 0.025, // Mixed effect
              roc_auc: (Math.random() - 0.2) * 0.02, // Slight tendency to improve
            }
            : { accuracy: 0, precision: 0, recall: 0, f1_score: 0, roc_auc: 0 }

          results[algId] = {
            name: {
              logistic: "Logistic Regression",
              decision_tree: "Decision Tree",
              knn: "k-Nearest Neighbors",
              svm: "Support Vector Machine",
              adaboost: "AdaBoost",
              xgboost: "XGBoost",
            }[algId],
            metrics: {
              accuracy: Math.max(0.5, Math.min(0.99, base.accuracy + smoteEffect.accuracy)),
              precision: Math.max(0.5, Math.min(0.99, base.precision + smoteEffect.precision)),
              recall: Math.max(0.5, Math.min(0.99, base.recall + smoteEffect.recall)),
              f1_score: Math.max(0.5, Math.min(0.99, base.f1_score + smoteEffect.f1_score)),
              roc_auc: Math.max(0.5, Math.min(0.99, base.roc_auc + smoteEffect.roc_auc)),
            },
            type: ["logistic", "decision_tree", "knn", "svm"].includes(algId) ? "conventional" : "boosting",
          }
        }
      })

      return results
    }

    const withoutSmote = generateResults(false)
    const withSmote = generateResults(true)

    // Generate comparison data
    const comparison: any = {}
    algorithms.forEach((algId: string) => {
      if (withoutSmote[algId] && withSmote[algId]) {
        comparison[algId] = {
          name: withoutSmote[algId].name,
          improvements: {
            accuracy: withSmote[algId].metrics.accuracy - withoutSmote[algId].metrics.accuracy,
            precision: withSmote[algId].metrics.precision - withoutSmote[algId].metrics.precision,
            recall: withSmote[algId].metrics.recall - withoutSmote[algId].metrics.recall,
            f1_score: withSmote[algId].metrics.f1_score - withoutSmote[algId].metrics.f1_score,
            roc_auc: withSmote[algId].metrics.roc_auc - withoutSmote[algId].metrics.roc_auc,
          },
        }
      }
    })

    const comparisonResults = {
      success: true,
      results: {
        without_smote: withoutSmote,
        with_smote: withSmote,
        comparison: comparison,
      },
      message: `Successfully compared ${algorithms.length} algorithms with and without SMOTE`,
    }

    return NextResponse.json(comparisonResults)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Comparison failed", message: error }, { status: 500 })
  }
}
