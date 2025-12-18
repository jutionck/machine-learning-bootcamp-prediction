import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { participant_data, trained_models } = await request.json()

    // Simulate prediction logic (in real implementation, you'd use your trained models)
    // NOTE: Response shape is aligned with the UI (PredictionPanel) which expects an array:
    // { predictions: [{ algorithm, modelId, prediction, probability }] }
    const predictionsByModel: {
      [key: string]: { prediction: string; probability: number }
    } = {}
    const predictions: Array<{
      algorithm: string
      modelId: string
      prediction: "pass" | "fail"
      probability: number
    }> = []

    const algorithmLabel: Record<string, string> = {
      logistic: "Logistic Regression",
      decision_tree: "Decision Tree",
      knn: "KNN",
      svm: "SVM",
      adaboost: "AdaBoost",
      xgboost: "XGBoost",
    }

    // Mock prediction logic based on participant data
    const logicalScore = Number.parseInt(participant_data.logical_test_score)
    const techScore = Number.parseInt(participant_data.tech_interview_score)
    const hasExperience = participant_data.experience === "yes"
    const isIT = participant_data.majoring === "IT"
    const age = Number.parseInt(participant_data.age)

    // Calculate base success probability
    let baseSuccessProb = 0.5

    // Adjust based on scores
    if (logicalScore >= 80) baseSuccessProb += 0.2
    else if (logicalScore >= 60) baseSuccessProb += 0.1
    else if (logicalScore < 40) baseSuccessProb -= 0.2

    if (techScore >= 80) baseSuccessProb += 0.2
    else if (techScore >= 65) baseSuccessProb += 0.1
    else if (techScore < 50) baseSuccessProb -= 0.2

    // Adjust based on experience and background
    if (hasExperience) baseSuccessProb += 0.15
    if (isIT) baseSuccessProb += 0.1
    if (age >= 25 && age <= 35) baseSuccessProb += 0.05

    // Generate predictions for each trained model with slight variations
    const modelIds: string[] = Array.isArray(trained_models) ? trained_models : []

    modelIds.forEach((modelId: string) => {
      let modelProb = baseSuccessProb

      // Add model-specific variations
      switch (modelId) {
        case "logistic":
          modelProb += (Math.random() - 0.5) * 0.1
          break
        case "decision_tree":
          modelProb += (Math.random() - 0.5) * 0.15
          break
        case "knn":
          modelProb += (Math.random() - 0.5) * 0.12
          break
        case "svm":
          modelProb += (Math.random() - 0.5) * 0.08
          break
        case "adaboost":
          modelProb += (Math.random() - 0.5) * 0.06
          break
        case "xgboost":
          modelProb += (Math.random() - 0.5) * 0.05
          break
      }

      // Ensure probability is within bounds
      modelProb = Math.max(0.1, Math.min(0.9, modelProb))

      const prediction = modelProb > 0.5 ? "pass" : "fail"
      predictionsByModel[modelId] = {
        prediction,
        probability: modelProb,
      }
      predictions.push({
        algorithm: algorithmLabel[modelId] ?? modelId,
        modelId,
        prediction,
        probability: modelProb,
      })
    })

    return NextResponse.json({
      success: true,
      predictions,
      predictions_by_model: predictionsByModel,
      participant_summary: {
        logical_score: logicalScore,
        tech_score: techScore,
        has_experience: hasExperience,
        is_it_background: isIT,
        age: age,
      },
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
