'use client';

import type React from 'react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Minus,
  ArrowUp,
  ArrowDown,
  Target,
  AlertTriangle,
  Brain,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { algorithms, metricNames } from '@/lib/constants';
import type {
  AdvancedMetadata,
  ComparisonResults,
  StatisticalAnalysisMap,
  TrainingResultsMap,
} from '@/lib/types';
import UploadPanel from '@/components/predictor/UploadPanel';
import ExportPanel from '@/components/predictor/ExportPanel';
import ResultsSummary from '@/components/predictor/ResultsSummary';
import DatasetConfigCard from '@/components/predictor/DatasetConfigCard';
import { getAlgorithmResults as extractAlgoResults } from '@/lib/results';

type AdvancedTrainingResults = TrainingResultsMap;
type StatisticalAnalysis = StatisticalAnalysisMap;

export default function MLBootcampPredictor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
  const [useSmote, setUseSmote] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [results, setResults] = useState<AdvancedTrainingResults | null>(null);
  const [metadata, setMetadata] = useState<AdvancedMetadata | null>(null);
  const [statisticalAnalysis, setStatisticalAnalysis] =
    useState<StatisticalAnalysis | null>(null);

  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonResults, setComparisonResults] =
    useState<ComparisonResults | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  const [datasetPreview, setDatasetPreview] = useState<any[]>([]);
  const [datasetValid, setDatasetValid] = useState(false);

  const [predictionMode, setPredictionMode] = useState(false);
  const [predictionData, setPredictionData] = useState({
    age: '',
    gender: '',
    grades: '',
    majoring: '',
    experience: '',
    logical_test_score: '',
    tech_interview_score: '',
  });
  const [predictionResults, setPredictionResults] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Quick switch to Training Mode and focus the upload section
  const goToTraining = () => {
    setPredictionMode(false);
    setErrors([]);
    // Smooth scroll to upload section if present
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        document.getElementById('upload-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 0);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setErrors([]);
    setDatasetPreview([]);
    setDatasetValid(false);

    if (!file) return;

    if (file.type !== 'text/csv') {
      setErrors(['Please upload a CSV file']);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(['File size must be less than 10MB']);
      return;
    }

    setSelectedFile(file);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        setDatasetValid(false);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const sampleRows = lines.slice(1, 6).map((line) =>
        line.split(',').reduce((obj, val, idx) => {
          obj[headers[idx]] = val.trim();
          return obj;
        }, {} as any)
      );

      setDatasetPreview(sampleRows);

      // Validate required columns
      const requiredColumns = [
        'age',
        'gender',
        'grades',
        'majoring',
        'experience',
        'logical_test_score',
        'tech_interview_grades',
        'class',
      ];
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col)
      );

      const newValidationErrors: string[] = [];

      if (missingColumns.length > 0) {
        newValidationErrors.push(
          `Missing required columns: ${missingColumns.join(', ')}`
        );
      }

      sampleRows.forEach((row, idx) => {
        const logicalScore = Number.parseFloat(row.logical_test_score);
        if (isNaN(logicalScore) || logicalScore < 0 || logicalScore > 100) {
          newValidationErrors.push(
            `Row ${idx + 2}: Logical test score must be 0-100 (found: ${
              row.logical_test_score
            })`
          );
        }

        const techScore = Number.parseFloat(row.tech_interview_grades);
        if (isNaN(techScore) || techScore < 0 || techScore > 100) {
          newValidationErrors.push(
            `Row ${idx + 2}: Tech interview score must be 0-100 (found: ${
              row.tech_interview_grades
            })`
          );
        }

        if (row.gender && !['L', 'P'].includes(row.gender.toUpperCase())) {
          newValidationErrors.push(
            `Row ${idx + 2}: Gender must be 'L' or 'P' (found: ${row.gender})`
          );
        }

        if (row.majoring && !['IT', 'Non IT'].includes(row.majoring)) {
          newValidationErrors.push(
            `Row ${idx + 2}: Majoring must be 'IT' or 'Non IT' (found: ${
              row.majoring
            })`
          );
        }

        if (
          row.experience &&
          !['yes', 'no'].includes(row.experience.toLowerCase())
        ) {
          newValidationErrors.push(
            `Row ${idx + 2}: Experience must be 'yes' or 'no' (found: ${
              row.experience
            })`
          );
        }

        // Check class values
        if (
          row.class &&
          !['pass', 'failed'].includes(row.class.toLowerCase())
        ) {
          newValidationErrors.push(
            `Row ${idx + 2}: Class must be 'pass' or 'failed' (found: ${
              row.class
            })`
          );
        }
      });

      setDatasetValid(newValidationErrors.length === 0);
    } catch (error) {
      setDatasetValid(false);
    }
  };

  const handleAlgorithmToggle = (algorithmId: string) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithmId)
        ? prev.filter((id) => id !== algorithmId)
        : [...prev, algorithmId]
    );
  };

  const handleSelectAll = (type: 'conventional' | 'boosting' | 'all') => {
    if (type === 'all') {
      setSelectedAlgorithms(algorithms.map((alg) => alg.id));
    } else {
      const typeAlgorithms = algorithms
        .filter((alg) => alg.type === type)
        .map((alg) => alg.id);
      setSelectedAlgorithms((prev) => [
        ...new Set([...prev, ...typeAlgorithms]),
      ]);
    }
  };

  const handlePrediction = async () => {
    const hasTrainedModels = results || comparisonResults;
    if (!hasTrainedModels) {
      setErrors(['Please train models first before making predictions']);
      return;
    }

    const requiredFields = [
      'age',
      'gender',
      'grades',
      'majoring',
      'experience',
      'logical_test_score',
      'tech_interview_score',
    ];
    const missingFields = requiredFields.filter(
      (field) => !predictionData[field as keyof typeof predictionData]
    );
    if (missingFields.length > 0) {
      setErrors([
        `Please fill in all required fields: ${missingFields.join(', ')}`,
      ]);
      return;
    }

    setIsPredicting(true);
    setErrors([]);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_data: predictionData,
          trained_models: selectedAlgorithms,
        }),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }

      const data = await response.json();
      setPredictionResults(data);
    } catch (error) {
      console.error('Prediction error:', error);
      setErrors([error instanceof Error ? error.message : 'Prediction failed']);
    } finally {
      setIsPredicting(false);
    }
  };
  const handleTraining = async () => {
    if (!selectedFile || selectedAlgorithms.length === 0) {
      setErrors(['Please upload a dataset and select at least one algorithm']);
      return;
    }

    setIsTraining(true);
    setTrainingComplete(false);
    setResults(null);
    setMetadata(null);
    setStatisticalAnalysis(null);
    setErrors([]);
    setTrainingProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('algorithms', JSON.stringify(selectedAlgorithms));
      formData.append('use_smote', useSmote.toString());
      formData.append('advanced_mode', 'true');
      formData.append('comparison_mode', comparisonMode.toString());

      const progressInterval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 1000);

      const response = await fetch('/api/train', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setTrainingProgress(100);

      if (!response.ok) {
        throw new Error(`Training failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.comparison_mode) {
        setComparisonResults({
          without_smote: data.without_smote,
          with_smote: data.with_smote,
          comparison: data.comparison,
        });
        setStatisticalAnalysis(data.statistical_analysis);
        setMetadata(data.with_smote.metadata);
        setTrainingComplete(true);
      } else {
        const {
          metadata: resultMetadata,
          statistical_analysis,
          ...algorithmResults
        } = data;

        setResults(algorithmResults);
        setMetadata(resultMetadata);
        setStatisticalAnalysis(statistical_analysis);
        setTrainingComplete(true);
      }
    } catch (error) {
      console.error('Training error:', error);
      setErrors([error instanceof Error ? error.message : 'Training failed']);
    } finally {
      setIsTraining(false);
      setTrainingProgress(0);
    }
  };

  const exportJSON = async () => {
    setExportLoading(true);
    try {
      const exportData = comparisonResults
        ? { comparison_results: comparisonResults, export_type: 'comparison' }
        : { results, metadata, export_type: 'single_training' };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ml_results_${
        comparisonResults ? 'comparison' : useSmote ? 'with_smote' : 'no_smote'
      }_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  const exportCSV = async () => {
    setExportLoading(true);
    try {
      let csvContent = '';

      if (comparisonResults) {
        csvContent = [
          [
            'Algorithm',
            'Type',
            'SMOTE',
            'Accuracy',
            'Precision',
            'Recall',
            'F1-Score',
            'ROC-AUC',
          ].join(','),
          ...Object.entries(comparisonResults.without_smote || {})
            .flatMap(([id, result]) => [
              result?.metrics
                ? [
                    result.name,
                    result.type,
                    'No',
                    ...Object.values(result.metrics).map((v) => v.toFixed(4)),
                  ].join(',')
                : '',
              comparisonResults.with_smote?.[id]?.metrics
                ? [
                    comparisonResults.with_smote[id].name,
                    comparisonResults.with_smote[id].type,
                    'Yes',
                    ...Object.values(
                      comparisonResults.with_smote[id].metrics
                    ).map((v) => v.toFixed(4)),
                  ].join(',')
                : '',
            ])
            .filter((row) => row),
        ].join('\n');
      } else if (results) {
        csvContent = [
          [
            'Algorithm',
            'Type',
            'Accuracy',
            'Precision',
            'Recall',
            'F1-Score',
            'ROC-AUC',
          ].join(','),
          ...Object.entries(extractAlgoResults(results))
            .map(([id, result]) =>
              result?.metrics
                ? [
                    result.name,
                    result.type,
                    ...Object.values(result.metrics).map((v) => v.toFixed(4)),
                  ].join(',')
                : ''
            )
            .filter((row) => row),
        ].join('\n');
      }

      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ml_results_${
        comparisonResults ? 'comparison' : useSmote ? 'with_smote' : 'no_smote'
      }_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  const exportAcademicReport = async () => {
    setExportLoading(true);
    try {
      const reportData = {
        title: 'Machine Learning Bootcamp Prediction Analysis',
        date: new Date().toLocaleDateString(),
        dataset: selectedFile?.name || 'Unknown Dataset',
        algorithms_tested: selectedAlgorithms.length,
        smote_applied: comparisonResults
          ? 'Both approaches tested'
          : useSmote
          ? 'Yes'
          : 'No',
        results: comparisonResults || results,
        metadata: metadata,
        summary: comparisonResults
          ? 'Comprehensive comparison of algorithm performance with and without SMOTE balancing technique.'
          : `Training results for ${selectedAlgorithms.length} machine learning algorithms on bootcamp prediction dataset.`,
        methodology: {
          algorithms: selectedAlgorithms
            .map((id) => algorithms.find((a) => a.id === id)?.name)
            .filter(Boolean),
          metrics: Object.values(metricNames),
          data_preprocessing:
            useSmote || comparisonResults
              ? 'SMOTE applied for class balancing'
              : 'Standard preprocessing',
          evaluation: 'Train-test split with stratified sampling',
        },
      };

      const reportStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([reportStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `academic_report_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  // Removed unused getTopFeatures helper

  const resetPredictionForm = () => {
    setPredictionData({
      age: '',
      gender: '',
      grades: '',
      majoring: '',
      experience: '',
      logical_test_score: '',
      tech_interview_score: '',
    });
    setPredictionResults(null);
    setErrors([]);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
      <div className='container mx-auto px-4 py-8 space-y-8'>
        <div className='text-center space-y-6 animate-fade-in'>
          <div className='inline-flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl backdrop-blur-sm border border-primary/20'>
            <div className='p-3 bg-gradient-to-r from-primary to-accent rounded-xl animate-pulse-glow'>
              <Brain className='h-8 w-8 text-white' />
            </div>
            <div className='text-left'>
              <h1 className='text-4xl font-serif font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
                Unlock Insights: Your ML Research Hub
              </h1>
              <p className='text-lg text-muted-foreground font-sans'>
                Transforming Data into Knowledge
              </p>
            </div>
          </div>
        </div>

        <div className='flex justify-center mb-12'>
          <div className='bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700'>
            <button
              onClick={() => {
                setPredictionMode(false);
                setErrors([]);
              }}
              className={`px-8 py-3 rounded-xl font-serif font-semibold transition-all duration-300 ${
                !predictionMode
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg transform scale-105 animate-pulse-glow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Training Mode
            </button>
            <button
              onClick={() => {
                setPredictionMode(true);
                setErrors([]);
              }}
              className={`px-8 py-3 rounded-xl font-serif font-semibold transition-all duration-300 ${
                predictionMode
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg transform scale-105 animate-pulse-glow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Prediction Mode
            </button>
          </div>
        </div>

        {predictionMode ? (
          <div className='space-y-8 animate-fade-in'>
            <div className='w-full'>
              <div className='w-full'>
                {!results && !comparisonResults && (
                  <div>
                    <Alert className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'>
                      <AlertTriangle className='h-5 w-5 text-amber-600' />
                      <AlertTitle className='text-amber-800 dark:text-amber-200'>
                        No Trained Models
                      </AlertTitle>
                      <AlertDescription className='text-amber-700 dark:text-amber-300'>
                        Please switch to Training Mode and train some models
                        first before making predictions.
                      </AlertDescription>
                    </Alert>
                    <div className='mt-4'>
                      <Button
                        onClick={goToTraining}
                        className='bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-serif font-semibold px-6 py-3 rounded-xl shadow-lg'
                      >
                        Train New Data
                      </Button>
                    </div>
                  </div>
                )}

                {(results || comparisonResults) && (
                  <Card className='mb-8 shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'>
                    <CardHeader className='pb-6'>
                      <CardTitle className='flex items-center gap-3 text-2xl font-serif'>
                        <div className='p-2 bg-gradient-to-r from-primary to-accent rounded-lg'>
                          <Target className='h-6 w-6 text-white' />
                        </div>
                        Individual Participant Prediction
                      </CardTitle>
                      <CardDescription className='text-lg text-slate-600 dark:text-slate-300'>
                        Enter participant details to predict bootcamp success
                        using your trained models
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-8'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                          <Label htmlFor='age'>Age</Label>
                          <Input
                            id='age'
                            type='number'
                            placeholder='Enter age (16-60)'
                            value={predictionData.age}
                            onChange={(e) =>
                              setPredictionData((prev) => ({
                                ...prev,
                                age: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='gender'>Gender</Label>
                          <select
                            id='gender'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={predictionData.gender}
                            onChange={(e) =>
                              setPredictionData((prev) => ({
                                ...prev,
                                gender: e.target.value,
                              }))
                            }
                          >
                            <option value=''>Select gender</option>
                            <option value='L'>L (Laki-laki)</option>
                            <option value='P'>P (Perempuan)</option>
                          </select>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='grades'>Education Level</Label>
                          <select
                            id='grades'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={predictionData.grades}
                            onChange={(e) =>
                              setPredictionData((prev) => ({
                                ...prev,
                                grades: e.target.value,
                              }))
                            }
                          >
                            <option value=''>Select education level</option>
                            <option value='SMA'>SMA</option>
                            <option value='D3'>D3</option>
                            <option value='S1'>S1</option>
                            <option value='S2'>S2</option>
                          </select>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='majoring'>Major Background</Label>
                          <select
                            id='majoring'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={predictionData.majoring}
                            onChange={(e) =>
                              setPredictionData((prev) => ({
                                ...prev,
                                majoring: e.target.value,
                              }))
                            }
                          >
                            <option value=''>Select major background</option>
                            <option value='IT'>IT</option>
                            <option value='Non IT'>Non IT</option>
                          </select>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='experience'>
                            Programming Experience
                          </Label>
                          <select
                            id='experience'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={predictionData.experience}
                            onChange={(e) =>
                              setPredictionData((prev) => ({
                                ...prev,
                                experience: e.target.value,
                              }))
                            }
                          >
                            <option value=''>Select experience</option>
                            <option value='yes'>Yes</option>
                            <option value='no'>No</option>
                          </select>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='logical_test_score'>
                            Logical Test Score (0-100)
                          </Label>
                          <Input
                            id='logical_test_score'
                            type='number'
                            placeholder='Enter logical test score'
                            value={predictionData.logical_test_score}
                            onChange={(e) =>
                              setPredictionData((prev) => ({
                                ...prev,
                                logical_test_score: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='tech_interview_score'>
                            Tech Interview Score (0-100)
                          </Label>
                          <Input
                            id='tech_interview_score'
                            type='number'
                            placeholder='Enter tech interview score'
                            value={predictionData.tech_interview_score}
                            onChange={(e) =>
                              setPredictionData((prev) => ({
                                ...prev,
                                tech_interview_score: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className='flex gap-4 flex-wrap'>
                        <Button
                          onClick={handlePrediction}
                          disabled={
                            isPredicting || (!results && !comparisonResults)
                          }
                          className='flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-serif font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105'
                          size='lg'
                        >
                          {isPredicting ? (
                            <>
                              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                              Predicting...
                            </>
                          ) : (
                            <>
                              <Target className='mr-2 h-5 w-5' />
                              Predict Success
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={resetPredictionForm}
                          variant='outline'
                          className='border-2 hover:bg-slate-50 dark:hover:bg-slate-700 font-serif font-semibold py-3 rounded-xl transition-all duration-300 bg-transparent'
                          size='lg'
                        >
                          Reset Form
                        </Button>
                        <Button
                          onClick={goToTraining}
                          variant='outline'
                          className='border-2 hover:bg-slate-50 dark:hover:bg-slate-700 font-serif font-semibold py-3 rounded-xl transition-all duration-300 bg-transparent'
                          size='lg'
                        >
                          Train New Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-1' id='upload-section'>
              <UploadPanel
                selectedFile={selectedFile}
                datasetValid={datasetValid}
                datasetPreview={datasetPreview}
                comparisonMode={comparisonMode}
                useSmote={useSmote}
                onFileChange={handleFileUpload}
                onComparisonModeChange={setComparisonMode}
                onUseSmoteChange={setUseSmote}
                showInlinePreview={false}
              />
            </div>

            {datasetValid && (
              <div className='lg:col-span-2'>
                <DatasetConfigCard
                  datasetPreview={datasetPreview}
                  datasetValid={datasetValid}
                  selectedAlgorithms={selectedAlgorithms}
                  onToggleAlgorithm={handleAlgorithmToggle}
                  onSelectAll={(type) => {
                    if (type === 'all')
                      setSelectedAlgorithms(algorithms.map((a) => a.id));
                    else if (type === 'conventional')
                      setSelectedAlgorithms((prev) => [
                        ...new Set([
                          ...prev,
                          ...algorithms
                            .filter((a) => a.type === 'conventional')
                            .map((a) => a.id),
                        ]),
                      ]);
                    else
                      setSelectedAlgorithms((prev) => [
                        ...new Set([
                          ...prev,
                          ...algorithms
                            .filter((a) => a.type === 'boosting')
                            .map((a) => a.id),
                        ]),
                      ]);
                  }}
                  useSmote={useSmote}
                  comparisonMode={comparisonMode}
                  isTraining={isTraining}
                  trainingProgress={trainingProgress}
                  onUseSmoteChange={setUseSmote}
                  onComparisonModeChange={setComparisonMode}
                  onStart={handleTraining}
                />
              </div>
            )}
          </div>
        )}

        {!predictionMode &&
          trainingComplete &&
          (results || comparisonResults) && (
            <div className='space-y-6 animate-fade-in'>
              <ResultsSummary
                results={results}
                comparisonResults={comparisonResults}
                metadata={metadata}
                statisticalAnalysis={statisticalAnalysis}
              />
              <ExportPanel
                onExportJSON={exportJSON}
                onExportCSV={exportCSV}
                onExportReport={exportAcademicReport}
                loading={exportLoading}
              />
            </div>
          )}
      </div>
    </div>
  );
}
