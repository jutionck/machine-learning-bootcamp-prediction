'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/predictor/AppSidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useModel } from '@/lib/context/ModelContext';
import PredictionPanel from '@/components/predictor/PredictionPanel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calculator } from 'lucide-react';

export default function PredictionPage() {
  const { results, comparisonResults, selectedAlgorithms } = useModel();
  
  // Local state for the prediction form
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
  const [errors, setErrors] = useState<string[]>([]);

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

  const hasTrainedModels = !!(results || comparisonResults);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">ML Predictor</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Prediction Mode</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Calculator className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Prediction Mode</h1>
                  <p className="text-muted-foreground mt-1 text-sm md:text-base">
                     Predict the success of new bootcamp applicants using trained models.
                  </p>
                </div>
              </div>
            {/* Error display */}
             {errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-lg">
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {!hasTrainedModels ? (
               <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                 <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <svg className="w-12 h-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                 </div>
                 <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-bold">No Trained Models Found</h3>
                    <p className="text-muted-foreground">
                        You need to train models in the Training Mode with a dataset before you can start predicting.
                    </p>
                 </div>
                 <Button asChild>
                    <Link href="/">
                        Go to Training Mode
                    </Link>
                 </Button>
               </div>
            ) : (
                <PredictionPanel
                    predictionData={predictionData}
                    setPredictionData={setPredictionData}
                    handlePrediction={handlePrediction}
                    isPredicting={isPredicting}
                    results={results}
                    comparisonResults={comparisonResults}
                    goToTraining={() => window.location.href = '/'} 
                    resetPredictionForm={resetPredictionForm}
                    predictionResults={predictionResults}
                />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
