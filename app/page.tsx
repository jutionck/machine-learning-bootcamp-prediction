"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Upload,
  Play,
  BarChart3,
  Trophy,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Table,
  Minus,
  ArrowUp,
  ArrowDown,
  Target,
  Settings,
  AlertTriangle,
  Brain,
  X,
  Check,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const algorithms = [
  { id: "logistic", name: "Logistic Regression", type: "conventional" },
  { id: "decision_tree", name: "Decision Tree", type: "conventional" },
  { id: "knn", name: "k-Nearest Neighbors", type: "conventional" },
  { id: "svm", name: "Support Vector Machine", type: "conventional" },
  { id: "adaboost", name: "AdaBoost", type: "boosting" },
  { id: "xgboost", name: "XGBoost", type: "boosting" },
]

const metricNames = {
  accuracy: "Accuracy",
  precision: "Precision",
  recall: "Recall",
  f1_score: "F1-Score",
  roc_auc: "ROC-AUC",
}

interface TrainingResults {
  [key: string]: {
    name: string
    metrics: {
      accuracy: number
      precision: number
      recall: number
      f1_score: number
      roc_auc: number
    }
    type: "conventional" | "boosting"
  }
}

interface ComparisonResults {
  without_smote: TrainingResults
  with_smote: TrainingResults
  comparison: {
    [key: string]: {
      name: string
      improvements: {
        accuracy: number
        precision: number
        recall: number
        f1_score: number
        roc_auc: number
      }
    }
  }
}

interface AdvancedTrainingResults {
  [key: string]: {
    name: string
    metrics: {
      accuracy: number
      precision: number
      recall: number
      f1_score: number
      roc_auc: number
    }
    best_params: any
    validation_score: number
    feature_importance: { [key: string]: number }
    shap_importance: { [key: string]: number }
    type: "conventional" | "boosting"
  }
}

interface StatisticalAnalysis {
  [key: string]: {
    conventional_algorithm: string
    boosting_algorithm: string
    mcnemar_test: {
      statistic: number
      p_value: number
      significant: boolean
      contingency: any
    }
  }
}

interface AdvancedMetadata {
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

const datasetAttributes = [
  { name: "age", type: "numeric", description: "Age of participant" },
  { name: "gender", type: "categorical", description: "Gender (L/P)", values: ["L", "P"] },
  {
    name: "grades",
    type: "categorical",
    description: "Education level (SMA, D3, S1, etc)",
    values: ["SMA", "D3", "S1", "S2", "S3"],
  },
  { name: "majoring", type: "categorical", description: "Field of study", values: ["IT", "Non IT"] },
  { name: "experience", type: "categorical", description: "Prior experience", values: ["yes", "no"] },
  {
    name: "logical_test_score",
    type: "numeric",
    description: "Logical test score (0-100, standard: 60 for next step)",
    min: 0,
    max: 100,
  },
  {
    name: "tech_interview_grades",
    type: "numeric",
    description: "Technical interview score (0-100, standard: 60 for next step)",
    min: 0,
    max: 100,
  },
  { name: "class", type: "target", description: "Target variable (pass/failed)", values: ["pass", "failed"] },
]

// interface ChartContainerProps {
//   children: React.ReactNode
//   config: { [key: string]: { label: string; color: string } }
//   className?: string
// }

// const ChartContainer: React.FC<ChartContainerProps> = ({ children, config, className }) => {
//   return (
//     <div className={`relative ${className}`}>
//       {Object.entries(config).map(([key, value]) => (
//         <div key={key} style={{ "--color": value.color }} className="absolute -top-2 -left-2 w-0 h-0"></div>
//       ))}
//       {children}
//     </div>
//   )
// }

export default function MLBootcampPredictor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([])
  const [useSmote, setUseSmote] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingComplete, setTrainingComplete] = useState(false)
  const [results, setResults] = useState<AdvancedTrainingResults | null>(null)
  const [metadata, setMetadata] = useState<AdvancedMetadata | null>(null)
  const [statisticalAnalysis, setStatisticalAnalysis] = useState<StatisticalAnalysis | null>(null)
  const [showFeatureImportance, setShowFeatureImportance] = useState(false)
  const [showShapAnalysis, setShowShapAnalysis] = useState(false)
  const [showStatisticalTests, setShowStatisticalTests] = useState(false)

  const [comparisonMode, setComparisonMode] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [currentAlgorithm, setCurrentAlgorithm] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [exportLoading, setExportLoading] = useState(false)

  const [datasetPreview, setDatasetPreview] = useState<any[]>([])
  const [datasetValid, setDatasetValid] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [predictionMode, setPredictionMode] = useState(false)
  const [predictionData, setPredictionData] = useState({
    age: "",
    gender: "",
    grades: "",
    majoring: "",
    experience: "",
    logical_test_score: "",
    tech_interview_score: "",
  })
  const [predictionResults, setPredictionResults] = useState<any>(null)
  const [isPredicting, setIsPredicting] = useState(false)

  // Enhanced file upload with validation
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setErrors([])
    setValidationErrors([])
    setDatasetPreview([])
    setDatasetValid(false)

    if (!file) return

    if (file.type !== "text/csv") {
      setErrors(["Please upload a CSV file"])
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(["File size must be less than 10MB"])
      return
    }

    setSelectedFile(file)

    // Preview and validate dataset
    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        setValidationErrors(["Dataset must contain at least header and one data row"])
        return
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const sampleRows = lines.slice(1, 6).map((line) =>
        line.split(",").reduce((obj, val, idx) => {
          obj[headers[idx]] = val.trim()
          return obj
        }, {} as any),
      )

      setDatasetPreview(sampleRows)

      // Validate required columns
      const requiredColumns = [
        "age",
        "gender",
        "grades",
        "majoring",
        "experience",
        "logical_test_score",
        "tech_interview_grades",
        "class",
      ]
      const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

      const newValidationErrors: string[] = []

      if (missingColumns.length > 0) {
        newValidationErrors.push(`Missing required columns: ${missingColumns.join(", ")}`)
      }

      // Validate data types and constraints
      sampleRows.forEach((row, idx) => {
        // Check logical test score
        const logicalScore = Number.parseFloat(row.logical_test_score)
        if (isNaN(logicalScore) || logicalScore < 0 || logicalScore > 100) {
          newValidationErrors.push(
            `Row ${idx + 2}: Logical test score must be 0-100 (found: ${row.logical_test_score})`,
          )
        }

        // Check tech interview score
        const techScore = Number.parseFloat(row.tech_interview_grades)
        if (isNaN(techScore) || techScore < 0 || techScore > 100) {
          newValidationErrors.push(
            `Row ${idx + 2}: Tech interview score must be 0-100 (found: ${row.tech_interview_grades})`,
          )
        }

        // Check gender values
        if (row.gender && !["L", "P"].includes(row.gender.toUpperCase())) {
          newValidationErrors.push(`Row ${idx + 2}: Gender must be 'L' or 'P' (found: ${row.gender})`)
        }

        // Check majoring values
        if (row.majoring && !["IT", "Non IT"].includes(row.majoring)) {
          newValidationErrors.push(`Row ${idx + 2}: Majoring must be 'IT' or 'Non IT' (found: ${row.majoring})`)
        }

        // Check experience values
        if (row.experience && !["yes", "no"].includes(row.experience.toLowerCase())) {
          newValidationErrors.push(`Row ${idx + 2}: Experience must be 'yes' or 'no' (found: ${row.experience})`)
        }

        // Check class values
        if (row.class && !["pass", "failed"].includes(row.class.toLowerCase())) {
          newValidationErrors.push(`Row ${idx + 2}: Class must be 'pass' or 'failed' (found: ${row.class})`)
        }
      })

      setValidationErrors(newValidationErrors)
      setDatasetValid(newValidationErrors.length === 0)
    } catch (error) {
      setValidationErrors(["Error reading CSV file. Please check file format."])
    }
  }

  const handleAlgorithmToggle = (algorithmId: string) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithmId) ? prev.filter((id) => id !== algorithmId) : [...prev, algorithmId],
    )
  }

  const handleSelectAll = (type: "conventional" | "boosting" | "all") => {
    if (type === "all") {
      setSelectedAlgorithms(algorithms.map((alg) => alg.id))
    } else {
      const typeAlgorithms = algorithms.filter((alg) => alg.type === type).map((alg) => alg.id)
      setSelectedAlgorithms((prev) => [...new Set([...prev, ...typeAlgorithms])])
    }
  }

  const handlePrediction = async () => {
    const hasTrainedModels = results || comparisonResults
    if (!hasTrainedModels) {
      setErrors(["Please train models first before making predictions"])
      return
    }

    // Validate prediction data
    const requiredFields = [
      "age",
      "gender",
      "grades",
      "majoring",
      "experience",
      "logical_test_score",
      "tech_interview_score",
    ]
    const missingFields = requiredFields.filter((field) => !predictionData[field as keyof typeof predictionData])

    if (missingFields.length > 0) {
      setErrors([`Please fill in all fields: ${missingFields.join(", ")}`])
      return
    }

    // Validate numeric fields
    const age = Number.parseInt(predictionData.age)
    const logicalScore = Number.parseInt(predictionData.logical_test_score)
    const techScore = Number.parseInt(predictionData.tech_interview_score)

    if (isNaN(age) || age < 16 || age > 60) {
      setErrors(["Age must be between 16 and 60"])
      return
    }

    if (isNaN(logicalScore) || logicalScore < 0 || logicalScore > 100) {
      setErrors(["Logical test score must be between 0 and 100"])
      return
    }

    if (isNaN(techScore) || techScore < 0 || techScore > 100) {
      setErrors(["Tech interview score must be between 0 and 100"])
      return
    }

    setIsPredicting(true)
    setErrors([])

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participant_data: predictionData,
          trained_models: results ? Object.keys(results) : Object.keys(comparisonResults?.without_smote || {}),
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setPredictionResults(data.predictions)
    } catch (error) {
      console.error("Prediction error:", error)
      setErrors([error instanceof Error ? error.message : "Prediction failed"])
    } finally {
      setIsPredicting(false)
    }
  }

  const handleTraining = async () => {
    if (!selectedFile || selectedAlgorithms.length === 0) {
      setErrors(["Please upload a dataset and select at least one algorithm"])
      return
    }

    setIsTraining(true)
    setTrainingComplete(false)
    setResults(null)
    setMetadata(null)
    setStatisticalAnalysis(null)
    setErrors([])
    setTrainingProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("algorithms", JSON.stringify(selectedAlgorithms))
      formData.append("use_smote", useSmote.toString())
      formData.append("advanced_mode", "true")
      formData.append("comparison_mode", comparisonMode.toString())

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 1000)

      const response = await fetch("/api/train", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setTrainingProgress(100)

      if (!response.ok) {
        throw new Error(`Training failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.comparison_mode) {
        // For comparison mode, store the comparison results
        setComparisonResults({
          without_smote: data.without_smote,
          with_smote: data.with_smote,
          comparison: data.comparison,
        })
        setStatisticalAnalysis(data.statistical_analysis)
        setMetadata(data.with_smote.metadata) // Use SMOTE metadata as primary
        setTrainingComplete(true)

        // Show advanced features
        if (data.statistical_analysis && Object.keys(data.statistical_analysis).length > 0) {
          setShowStatisticalTests(true)
        }

        // Check feature importance from SMOTE results
        const hasFeatureImportance = Object.values(data.with_smote).some(
          (result: any) => result.feature_importance && Object.keys(result.feature_importance).length > 0,
        )
        if (hasFeatureImportance) {
          setShowFeatureImportance(true)
        }

        // Check SHAP analysis from SMOTE results
        const hasShapAnalysis = Object.values(data.with_smote).some(
          (result: any) => result.shap_importance && Object.keys(result.shap_importance).length > 0,
        )
        if (hasShapAnalysis) {
          setShowShapAnalysis(true)
        }
      } else {
        // Regular training mode
        const { metadata: resultMetadata, statistical_analysis, ...algorithmResults } = data

        setResults(algorithmResults)
        setMetadata(resultMetadata)
        setStatisticalAnalysis(statistical_analysis)
        setTrainingComplete(true)

        // Show advanced features if available
        if (statistical_analysis && Object.keys(statistical_analysis).length > 0) {
          setShowStatisticalTests(true)
        }

        // Check if feature importance is available
        const hasFeatureImportance = Object.values(algorithmResults).some(
          (result: any) => result.feature_importance && Object.keys(result.feature_importance).length > 0,
        )
        if (hasFeatureImportance) {
          setShowFeatureImportance(true)
        }

        // Check if SHAP analysis is available
        const hasShapAnalysis = Object.values(algorithmResults).some(
          (result: any) => result.shap_importance && Object.keys(result.shap_importance).length > 0,
        )
        if (hasShapAnalysis) {
          setShowShapAnalysis(true)
        }
      }
    } catch (error) {
      console.error("Training error:", error)
      setErrors([error instanceof Error ? error.message : "Training failed"])
    } finally {
      setIsTraining(false)
      setTrainingProgress(0)
      setCurrentAlgorithm("")
    }
  }

  // Enhanced comparison with progress tracking
  const startComparison = async () => {
    if (!selectedFile || selectedAlgorithms.length === 0) return

    setIsComparing(true)
    setComparisonResults(null)
    setTrainingComplete(false)
    setTrainingProgress(0)
    setErrors([])

    const progressInterval = setInterval(() => {
      setTrainingProgress((prev) => Math.min(prev + Math.random() * 10, 90))
    }, 300)

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_data: selectedFile.name,
          target_column: "target",
          algorithms: selectedAlgorithms,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setComparisonResults(data.results)
        setTrainingComplete(true)
        setTrainingProgress(100)
      } else {
        setErrors([data.message || "Comparison failed"])
      }
    } catch (error) {
      setErrors(["Network error occurred during comparison"])
      console.error("Comparison failed:", error)
    } finally {
      setIsComparing(false)
      clearInterval(progressInterval)
    }
  }

  const getAlgorithmResults = (resultsData: any) => {
    if (!resultsData) return {}

    // Filter out metadata and non-algorithm properties
    const algorithmResults: any = {}
    Object.entries(resultsData).forEach(([key, value]: [string, any]) => {
      // Only include objects that have algorithm properties (name, metrics, type)
      if (value && typeof value === "object" && value.name && value.metrics && value.type) {
        algorithmResults[key] = value
      }
    })

    return algorithmResults
  }

  const getBestAlgorithm = () => {
    const algorithmResults = getAlgorithmResults(results)
    if (!algorithmResults || Object.keys(algorithmResults).length === 0) return null

    let bestAlgorithm = null
    let bestScore = 0

    Object.entries(algorithmResults).forEach(([id, result]: [string, any]) => {
      if (result?.metrics?.f1_score > bestScore) {
        bestScore = result.metrics.f1_score
        bestAlgorithm = { id, ...result }
      }
    })

    return bestAlgorithm
  }

  const getImprovementIndicator = (improvement: number, metricKey: string) => {
    const threshold = metricKey === "accuracy" ? 0.01 : 0.005

    if (Math.abs(improvement) < threshold) {
      return <Minus className="h-4 w-4 text-gray-400" />
    } else if (improvement > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />
    } else {
      return <ArrowDown className="h-4 w-4 text-red-500" />
    }
  }

  const formatMetric = (value: number) => (value * 100).toFixed(1) + "%"
  const formatImprovement = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return sign + (value * 100).toFixed(2) + "%"
  }

  // Enhanced export functions with academic report generation
  const exportJSON = async () => {
    setExportLoading(true)
    try {
      const exportData = comparisonResults
        ? { comparison_results: comparisonResults, export_type: "comparison" }
        : { results, metadata, export_type: "single_training" }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ml_results_${comparisonResults ? "comparison" : useSmote ? "with_smote" : "no_smote"}_${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportLoading(false)
    }
  }

  const exportCSV = async () => {
    setExportLoading(true)
    try {
      let csvContent = ""

      if (comparisonResults) {
        // Export comparison results
        csvContent = [
          ["Algorithm", "Type", "SMOTE", "Accuracy", "Precision", "Recall", "F1-Score", "ROC-AUC"].join(","),
          ...Object.entries(comparisonResults.without_smote || {})
            .flatMap(([id, result]) => [
              result?.metrics
                ? [result.name, result.type, "No", ...Object.values(result.metrics).map((v) => v.toFixed(4))].join(",")
                : "",
              comparisonResults.with_smote?.[id]?.metrics
                ? [
                    comparisonResults.with_smote[id].name,
                    comparisonResults.with_smote[id].type,
                    "Yes",
                    ...Object.values(comparisonResults.with_smote[id].metrics).map((v) => v.toFixed(4)),
                  ].join(",")
                : "",
            ])
            .filter((row) => row),
        ].join("\n")
      } else if (results) {
        csvContent = [
          ["Algorithm", "Type", "Accuracy", "Precision", "Recall", "F1-Score", "ROC-AUC"].join(","),
          ...Object.entries(getAlgorithmResults(results))
            .map(([id, result]) =>
              result?.metrics
                ? [result.name, result.type, ...Object.values(result.metrics).map((v) => v.toFixed(4))].join(",")
                : "",
            )
            .filter((row) => row),
        ].join("\n")
      }

      const dataBlob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ml_results_${comparisonResults ? "comparison" : useSmote ? "with_smote" : "no_smote"}_${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportLoading(false)
    }
  }

  const exportAcademicReport = async () => {
    setExportLoading(true)
    try {
      const reportData = {
        title: "Machine Learning Bootcamp Prediction Analysis",
        date: new Date().toLocaleDateString(),
        dataset: selectedFile?.name || "Unknown Dataset",
        algorithms_tested: selectedAlgorithms.length,
        smote_applied: comparisonResults ? "Both approaches tested" : useSmote ? "Yes" : "No",
        results: comparisonResults || results,
        metadata: metadata,
        summary: comparisonResults
          ? "Comprehensive comparison of algorithm performance with and without SMOTE balancing technique."
          : `Training results for ${selectedAlgorithms.length} machine learning algorithms on bootcamp prediction dataset.`,
        methodology: {
          algorithms: selectedAlgorithms.map((id) => algorithms.find((a) => a.id === id)?.name).filter(Boolean),
          metrics: Object.values(metricNames),
          data_preprocessing:
            useSmote || comparisonResults ? "SMOTE applied for class balancing" : "Standard preprocessing",
          evaluation: "Train-test split with stratified sampling",
        },
      }

      const reportStr = JSON.stringify(reportData, null, 2)
      const dataBlob = new Blob([reportStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `academic_report_${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportLoading(false)
    }
  }

  const getTopFeatures = (type: "feature_importance" | "shap_importance", limit = 5) => {
    if (!results) return []

    const allFeatures: { [key: string]: number[] } = {}

    Object.values(results).forEach((result: any) => {
      const importance = result[type] || {}
      Object.entries(importance).forEach(([feature, value]: [string, any]) => {
        if (!allFeatures[feature]) allFeatures[feature] = []
        allFeatures[feature].push(Number(value))
      })
    })

    // Calculate average importance across algorithms
    const avgFeatures = Object.entries(allFeatures).map(([feature, values]) => ({
      feature,
      avgImportance: values.reduce((sum, val) => sum + val, 0) / values.length,
      algorithms: values.length,
    }))

    return avgFeatures.sort((a, b) => b.avgImportance - a.avgImportance).slice(0, limit)
  }

  const resetPredictionForm = () => {
    setPredictionData({
      age: "",
      gender: "",
      grades: "",
      majoring: "",
      experience: "",
      logical_test_score: "",
      tech_interview_score: "",
    })
    setPredictionResults(null)
    setErrors([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl backdrop-blur-sm border border-primary/20">
            <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-xl animate-pulse-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-serif font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Unlock Insights: Your ML Research Hub
              </h1>
              <p className="text-lg text-muted-foreground font-sans">Transforming Data into Knowledge</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setPredictionMode(false)
                setErrors([])
              }}
              className={`px-8 py-3 rounded-xl font-serif font-semibold transition-all duration-300 ${
                !predictionMode
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg transform scale-105 animate-pulse-glow"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              Training Mode
            </button>
            <button
              onClick={() => {
                setPredictionMode(true)
                setErrors([])
              }}
              className={`px-8 py-3 rounded-xl font-serif font-semibold transition-all duration-300 ${
                predictionMode
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg transform scale-105 animate-pulse-glow"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              Prediction Mode
            </button>
          </div>
        </div>

        {predictionMode ? (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-serif font-black text-slate-900 dark:text-white mb-4 animate-slide-in">
                Individual Prediction
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto animate-slide-in-delay">
                Input participant data to get predictions from your trained models
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {!results && !comparisonResults && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="text-amber-800 dark:text-amber-200">No Trained Models</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                      Please switch to Training Mode and train some models first before making predictions.
                    </AlertDescription>
                  </Alert>
                )}

                {(results || comparisonResults) && (
                  <Card className="mb-8 shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                        <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        Individual Participant Prediction
                      </CardTitle>
                      <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                        Enter participant details to predict bootcamp success using your trained models
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            placeholder="Enter age (16-60)"
                            value={predictionData.age}
                            onChange={(e) => setPredictionData((prev) => ({ ...prev, age: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <select
                            id="gender"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={predictionData.gender}
                            onChange={(e) => setPredictionData((prev) => ({ ...prev, gender: e.target.value }))}
                          >
                            <option value="">Select gender</option>
                            <option value="L">L (Laki-laki)</option>
                            <option value="P">P (Perempuan)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grades">Education Level</Label>
                          <select
                            id="grades"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={predictionData.grades}
                            onChange={(e) => setPredictionData((prev) => ({ ...prev, grades: e.target.value }))}
                          >
                            <option value="">Select education level</option>
                            <option value="SMA">SMA</option>
                            <option value="D3">D3</option>
                            <option value="S1">S1</option>
                            <option value="S2">S2</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="majoring">Major Background</Label>
                          <select
                            id="majoring"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={predictionData.majoring}
                            onChange={(e) => setPredictionData((prev) => ({ ...prev, majoring: e.target.value }))}
                          >
                            <option value="">Select major background</option>
                            <option value="IT">IT</option>
                            <option value="Non IT">Non IT</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experience">Programming Experience</Label>
                          <select
                            id="experience"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={predictionData.experience}
                            onChange={(e) => setPredictionData((prev) => ({ ...prev, experience: e.target.value }))}
                          >
                            <option value="">Select experience</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="logical_test_score">Logical Test Score (0-100)</Label>
                          <Input
                            id="logical_test_score"
                            type="number"
                            placeholder="Enter logical test score"
                            value={predictionData.logical_test_score}
                            onChange={(e) =>
                              setPredictionData((prev) => ({ ...prev, logical_test_score: e.target.value }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tech_interview_score">Tech Interview Score (0-100)</Label>
                          <Input
                            id="tech_interview_score"
                            type="number"
                            placeholder="Enter tech interview score"
                            value={predictionData.tech_interview_score}
                            onChange={(e) =>
                              setPredictionData((prev) => ({ ...prev, tech_interview_score: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          onClick={handlePrediction}
                          disabled={isPredicting || (!results && !comparisonResults)}
                          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-serif font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                          size="lg"
                        >
                          {isPredicting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Predicting...
                            </>
                          ) : (
                            <>
                              <Target className="mr-2 h-5 w-5" />
                              Predict Success
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={resetPredictionForm}
                          variant="outline"
                          className="border-2 hover:bg-slate-50 dark:hover:bg-slate-700 font-serif font-semibold py-3 rounded-xl transition-all duration-300 bg-transparent"
                          size="lg"
                        >
                          Reset Form
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 transition-all duration-300 hover:shadow-2xl hover:scale-105 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-serif">
                  <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  Upload Data
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Upload your bootcamp participant CSV dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="file-upload" className="font-serif font-semibold">
                    Dataset File
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="mt-2 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary transition-colors duration-300 rounded-xl py-3"
                  />
                  {selectedFile && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        {datasetValid ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        )}
                        <div>
                          <div className={`font-medium ${datasetValid ? "text-emerald-600" : "text-amber-600"}`}>
                            {selectedFile.name}
                          </div>
                          <div className="text-slate-500 text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      {datasetValid && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                        >
                          Dataset validated ✓
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Required Dataset Attributes:</Label>
                  <div className="space-y-2 text-xs">
                    {datasetAttributes.map((attr, idx) => (
                      <div key={idx} className="flex flex-col space-y-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{attr.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {attr.type}
                          </Badge>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">{attr.description}</span>
                        {attr.values && (
                          <span className="text-blue-600 dark:text-blue-400">Values: {attr.values.join(", ")}</span>
                        )}
                        {attr.min && attr.max && (
                          <span className="text-green-600 dark:text-green-400">
                            Range: {attr.min}-{attr.max}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Switch
                    id="comparison-toggle"
                    checked={comparisonMode}
                    onCheckedChange={setComparisonMode}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent"
                  />
                  <Label htmlFor="comparison-toggle" className="font-serif font-medium">
                    SMOTE Comparison Mode
                  </Label>
                </div>

                {!comparisonMode && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Switch
                      id="smote-toggle"
                      checked={useSmote}
                      onCheckedChange={setUseSmote}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent"
                    />
                    <Label htmlFor="smote-toggle" className="font-serif font-medium">
                      Apply SMOTE (Synthetic Minority Oversampling)
                    </Label>
                  </div>
                )}

                {comparisonMode && (
                  <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                      Comparison mode will train all algorithms both with and without SMOTE for detailed analysis
                    </AlertDescription>
                  </Alert>
                )}

                {!comparisonMode && useSmote && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <AlertDescription className="text-xs text-green-700 dark:text-green-300">
                      SMOTE will be applied to balance the dataset before training
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {datasetPreview.length > 0 && (
              <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Dataset Preview
                  </CardTitle>
                  <CardDescription>Sample rows from your uploaded dataset</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(datasetPreview[0] || {}).map((header) => (
                            <th key={header} className="text-left p-2 font-semibold bg-gray-50 dark:bg-gray-800">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {datasetPreview.map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            {Object.values(row).map((value: any, cellIdx) => (
                              <td key={cellIdx} className="p-2">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Showing first {datasetPreview.length} rows •
                    {datasetValid ? (
                      <span className="text-green-600 ml-1">Dataset format is valid</span>
                    ) : (
                      <span className="text-yellow-600 ml-1">Please fix validation issues above</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {datasetValid && (
              <Card className="lg:col-span-3 transition-all duration-300 hover:shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-serif">
                    <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    Algorithm Selection
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Choose which algorithms to train and evaluate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll("all")}
                        className="transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white border-2 font-serif"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll("conventional")}
                        className="transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-white border-2 font-serif"
                      >
                        All Conventional
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll("boosting")}
                        className="transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-white border-2 font-serif"
                      >
                        All Boosting
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAlgorithms([])}
                        className="transition-all duration-300 hover:scale-105 hover:bg-destructive hover:text-white border-2 font-serif"
                      >
                        Clear All
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Conventional Algorithms */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        <h4 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          Conventional Algorithms
                        </h4>
                        <div className="space-y-3">
                          {algorithms
                            .filter((alg) => alg.type === "conventional")
                            .map((algorithm) => (
                              <div
                                key={algorithm.id}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 hover:shadow-md"
                              >
                                <Checkbox
                                  id={algorithm.id}
                                  checked={selectedAlgorithms.includes(algorithm.id)}
                                  onCheckedChange={() => handleAlgorithmToggle(algorithm.id)}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <Label htmlFor={algorithm.id} className="font-serif cursor-pointer flex-1">
                                  {algorithm.name}
                                </Label>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Boosting Algorithms */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        <h4 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <div className="w-3 h-3 bg-accent rounded-full"></div>
                          Boosting Algorithms
                        </h4>
                        <div className="space-y-3">
                          {algorithms
                            .filter((alg) => alg.type === "boosting")
                            .map((algorithm) => (
                              <div
                                key={algorithm.id}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 hover:shadow-md"
                              >
                                <Checkbox
                                  id={algorithm.id}
                                  checked={selectedAlgorithms.includes(algorithm.id)}
                                  onCheckedChange={() => handleAlgorithmToggle(algorithm.id)}
                                  className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                />
                                <Label htmlFor={algorithm.id} className="font-serif cursor-pointer flex-1">
                                  {algorithm.name}
                                </Label>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                      <div className="font-serif text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-lg">{selectedAlgorithms.length}</span> algorithm
                        {selectedAlgorithms.length !== 1 ? "s" : ""} selected
                      </div>
                      {selectedAlgorithms.length > 0 && (
                        <Badge className="bg-gradient-to-r from-primary to-accent text-white animate-pulse font-serif">
                          Ready to train
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {datasetValid && selectedAlgorithms.length > 0 && (
              <Card className="lg:col-span-3 transition-all duration-300 hover:shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-serif">
                    <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    Training Configuration
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Configure training parameters and start the training process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Switch
                      id="smote"
                      checked={useSmote}
                      onCheckedChange={setUseSmote}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent"
                    />
                    <Label htmlFor="smote" className="font-serif font-medium">
                      Apply SMOTE (Synthetic Minority Oversampling Technique)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Switch
                      id="comparison"
                      checked={comparisonMode}
                      onCheckedChange={setComparisonMode}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent"
                    />
                    <Label htmlFor="comparison" className="font-serif font-medium">
                      Comparison Mode (Train with and without SMOTE)
                    </Label>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-600">
                    <Button
                      onClick={handleTraining}
                      disabled={isTraining || selectedAlgorithms.length === 0}
                      className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-white font-serif font-bold text-lg py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl animate-pulse-glow"
                      size="lg"
                    >
                      {isTraining ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Training Models... ({trainingProgress}%)
                        </>
                      ) : (
                        <>
                          <Play className="mr-3 h-6 w-6" />
                          Start Training ({selectedAlgorithms.length} algorithms)
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-sm text-slate-500 dark:text-slate-400 space-y-2 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div className="font-serif font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Training Process:
                    </div>
                    <p>• Dataset will be split: 90% training, 5% validation, 5% test</p>
                    <p>• Grid Search will optimize hyperparameters using cross-validation</p>
                    <p>• McNemar test will compare conventional vs boosting algorithms</p>
                    <p>• SHAP analysis will provide feature importance explanations</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-8 border-0 bg-red-50 dark:bg-red-900/20 shadow-lg">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-serif font-bold">Error</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {!predictionMode && trainingComplete && (results || comparisonResults) && (
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Comparison Results Display */}
            {comparisonResults && (
              <div className="space-y-8">
                {/* SMOTE Comparison Header */}
                <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-2xl">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl font-serif font-black">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      SMOTE Comparison Analysis
                    </CardTitle>
                    <CardDescription className="text-base font-sans">
                      Comprehensive comparison of algorithm performance with and without SMOTE balancing
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Side-by-side Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Without SMOTE Results */}
                  <Card className="border-2 border-red-200 dark:border-red-800 animate-slide-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl font-serif font-bold text-red-700 dark:text-red-300">
                        <X className="h-5 w-5" />
                        Without SMOTE
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(getAlgorithmResults(comparisonResults.without_smote)).map(([id, result]) => (
                          <div key={id} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-serif font-semibold">{result?.name || "Unknown"}</h4>
                              <Badge variant="outline" className="border-red-300 text-red-700">
                                {result?.type || "Unknown"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                Accuracy:{" "}
                                <span className="font-semibold">
                                  {(result?.metrics?.accuracy * 100 || 0).toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                F1-Score:{" "}
                                <span className="font-semibold">
                                  {(result?.metrics?.f1_score * 100 || 0).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* With SMOTE Results */}
                  <Card
                    className="border-2 border-green-200 dark:border-green-800 animate-slide-in"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl font-serif font-bold text-green-700 dark:text-green-300">
                        <Check className="h-5 w-5" />
                        With SMOTE
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(getAlgorithmResults(comparisonResults.with_smote)).map(([id, result]) => (
                          <div key={id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-serif font-semibold">{result?.name || "Unknown"}</h4>
                              <Badge variant="outline" className="border-green-300 text-green-700">
                                {result?.type || "Unknown"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                Accuracy:{" "}
                                <span className="font-semibold">
                                  {(result?.metrics?.accuracy * 100 || 0).toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                F1-Score:{" "}
                                <span className="font-semibold">
                                  {(result?.metrics?.f1_score * 100 || 0).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            {/* Impact Indicators */}
                            {comparisonResults.comparison?.[id] && (
                              <div className="mt-2 flex gap-2">
                                {comparisonResults.comparison[id].improvements.accuracy > 0 ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <TrendingUp className="h-3 w-3 mr-1" />+
                                    {(comparisonResults.comparison[id].improvements.accuracy * 100).toFixed(1)}%
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                    {(comparisonResults.comparison[id].improvements.accuracy * 100).toFixed(1)}%
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Regular Results Display */}
            {results && !comparisonResults && (
              <>
                {/* Best Algorithm Card */}
                {(() => {
                  const bestAlg = getBestAlgorithm()
                  return bestAlg ? (
                    <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-2xl animate-slide-in">
                      <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-2xl font-serif font-black">
                          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl animate-pulse-glow">
                            <Trophy className="h-8 w-8 text-white" />
                          </div>
                          Best Performing Algorithm
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-3xl font-serif font-black text-green-700 dark:text-green-300">
                              {bestAlg.name}
                            </h3>
                            <p className="text-green-600 dark:text-green-400 font-sans font-medium">
                              {bestAlg.type === "conventional" ? "Conventional" : "Boosting"} Algorithm
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-serif font-black text-accent">
                              {(bestAlg.metrics.accuracy * 100).toFixed(1)}%
                            </div>
                            <p className="text-sm text-muted-foreground font-sans">Accuracy</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null
                })()}

                {/* Performance Chart */}
                <Card
                  className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xl animate-slide-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl font-serif font-black">
                      <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      Performance Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="bar" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                        <TabsTrigger value="radar">Radar Chart</TabsTrigger>
                      </TabsList>
                      <TabsContent value="bar" className="space-y-4">
                        <ChartContainer
                          config={{
                            accuracy: { label: "Accuracy", color: "hsl(var(--chart-1))" },
                            precision: { label: "Precision", color: "hsl(var(--chart-2))" },
                            recall: { label: "Recall", color: "hsl(var(--chart-3))" },
                            f1_score: { label: "F1-Score", color: "hsl(var(--chart-4))" },
                            roc_auc: { label: "ROC-AUC", color: "hsl(var(--chart-5))" },
                          }}
                          className="h-[400px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={Object.entries(getAlgorithmResults(results)).map(([id, result]) => ({
                                name: result?.name?.replace(/\s+/g, "\n") || "Unknown",
                                accuracy: result?.metrics?.accuracy || 0,
                                precision: result?.metrics?.precision || 0,
                                recall: result?.metrics?.recall || 0,
                                f1_score: result?.metrics?.f1_score || 0,
                                roc_auc: result?.metrics?.roc_auc || 0,
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="accuracy" fill="var(--color-accuracy)" />
                              <Bar dataKey="precision" fill="var(--color-precision)" />
                              <Bar dataKey="recall" fill="var(--color-recall)" />
                              <Bar dataKey="f1_score" fill="var(--color-f1_score)" />
                              <Bar dataKey="roc_auc" fill="var(--color-roc_auc)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </TabsContent>
                      <TabsContent value="radar" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {Object.entries(getAlgorithmResults(results)).map(([id, result]) => (
                            <div key={id} className="flex flex-col items-center">
                              <h4 className="text-lg font-serif font-semibold mb-3 text-center">
                                {result?.name || "Unknown"}
                              </h4>
                              <ChartContainer
                                config={{
                                  value: { label: "Score", color: "hsl(var(--chart-1))" },
                                }}
                                className="h-[280px] w-full"
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart
                                    data={[
                                      { metric: "Accuracy", value: result?.metrics?.accuracy || 0 },
                                      { metric: "Precision", value: result?.metrics?.precision || 0 },
                                      { metric: "Recall", value: result?.metrics?.recall || 0 },
                                      { metric: "F1-Score", value: result?.metrics?.f1_score || 0 },
                                      { metric: "ROC-AUC", value: result?.metrics?.roc_auc || 0 },
                                    ]}
                                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                  >
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                                    <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                                    <Radar
                                      name={result?.name || "Unknown"}
                                      dataKey="value"
                                      stroke="var(--color-value)"
                                      fill="var(--color-value)"
                                      fillOpacity={0.3}
                                      strokeWidth={2}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </ChartContainer>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Detailed Results Table */}
                <Card
                  className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-2xl animate-slide-in"
                  style={{ animationDelay: "0.6s" }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl font-serif font-black">
                      <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
                        <Table className="h-6 w-6 text-white" />
                      </div>
                      Detailed Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-200 dark:border-slate-600">
                            <th className="text-left p-4 font-serif font-bold">Algorithm</th>
                            <th className="text-left p-4 font-serif font-bold">Type</th>
                            <th className="text-left p-4 font-serif font-bold">Accuracy</th>
                            <th className="text-left p-4 font-serif font-bold">Precision</th>
                            <th className="text-left p-4 font-serif font-bold">Recall</th>
                            <th className="text-left p-4 font-serif font-bold">F1-Score</th>
                            <th className="text-left p-4 font-serif font-bold">ROC-AUC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(getAlgorithmResults(results)).map(([id, result]) => (
                            <tr
                              key={id}
                              className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                              <td className="p-4 font-medium">{result?.name || "Unknown"}</td>
                              <td className="p-4">
                                <Badge variant={result?.type === "conventional" ? "default" : "secondary"}>
                                  {result?.type === "conventional" ? "Conventional" : "Boosting"}
                                </Badge>
                              </td>
                              <td className="p-4">{((result?.metrics?.accuracy || 0) * 100).toFixed(2)}%</td>
                              <td className="p-4">{((result?.metrics?.precision || 0) * 100).toFixed(2)}%</td>
                              <td className="p-4">{((result?.metrics?.recall || 0) * 100).toFixed(2)}%</td>
                              <td className="p-4">{((result?.metrics?.f1_score || 0) * 100).toFixed(2)}%</td>
                              <td className="p-4">{((result?.metrics?.roc_auc || 0) * 100).toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Export Options */}
        {!predictionMode && trainingComplete && (results || comparisonResults) && (
          <div className="max-w-7xl mx-auto space-y-4 animate-fade-in">
            <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">Export Results</h2>
            <div className="flex gap-4">
              <Button
                onClick={exportJSON}
                disabled={exportLoading}
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting JSON...
                  </>
                ) : (
                  "Export as JSON"
                )}
              </Button>
              <Button
                onClick={exportCSV}
                disabled={exportLoading}
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting CSV...
                  </>
                ) : (
                  "Export as CSV"
                )}
              </Button>
              <Button
                onClick={exportAcademicReport}
                disabled={exportLoading}
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Report...
                  </>
                ) : (
                  "Generate Academic Report"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
