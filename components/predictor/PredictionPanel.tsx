import React, { useState } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  FileText
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TrainingResultsMap, ComparisonResults } from '@/lib/types';

type Props = {
  predictionData: {
    age: string;
    gender: string;
    grades: string;
    majoring: string;
    logical_test_score: string;
    tech_interview_result: string;
  };
  setPredictionData: React.Dispatch<
    React.SetStateAction<{
      age: string;
      gender: string;
      grades: string;
      majoring: string;
      logical_test_score: string;
      tech_interview_result: string;
    }>
  >;
  handlePrediction: () => void;
  handleBatchPrediction?: (file: File) => void;
  isPredicting: boolean;
  results: TrainingResultsMap | null;
  comparisonResults: ComparisonResults | null;
  goToTraining: () => void;
  resetPredictionForm: () => void;
  predictionResults: any;
  hasModels?: boolean;
};

export default function PredictionPanel({
  predictionData,
  setPredictionData,
  handlePrediction,
  handleBatchPrediction,
  isPredicting,
  results,
  comparisonResults,
  goToTraining,
  resetPredictionForm,
  predictionResults,
  hasModels = false,
}: Props) {
  const hasTrainedModels = hasModels || results || comparisonResults;
  const [activeTab, setActiveTab] = useState("manual");
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };
  
  const onBatchSubmit = () => {
      if (csvFile && handleBatchPrediction) {
          handleBatchPrediction(csvFile);
      }
  }

  return (
    <div className='w-full space-y-8 animate-fade-in'>
      {!hasTrainedModels && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <Alert className='border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20'>
            <AlertTriangle className='h-5 w-5 text-amber-600 dark:text-amber-500' />
            <AlertTitle className='text-amber-800 dark:text-amber-200 font-semibold'>
              No Trained Models
            </AlertTitle>
            <AlertDescription className='text-amber-700 dark:text-amber-300'>
              Please switch to Training Mode and train some models first before
              making predictions.
            </AlertDescription>
          </Alert>
          <div className='mt-6 flex justify-center'>
            <Button
              onClick={goToTraining}
              className='bg-primary hover:bg-primary/90 text-white font-serif font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
            >
              Train New Data
            </Button>
          </div>
        </div>
      )}

      {hasTrainedModels && (
        <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="manual">Manual Input</TabsTrigger>
                <TabsTrigger value="batch">Bulk Upload (CSV)</TabsTrigger>
            </TabsList>

          <TabsContent value="manual">
            <Card className='shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden'>
                <CardContent className='pt-8 space-y-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='space-y-2.5'>
                    <Label htmlFor='age' className="text-sm font-semibold text-slate-700 dark:text-slate-200">Age</Label>
                    <Input
                        id='age'
                        type='number'
                        placeholder='16-60'
                        value={predictionData.age}
                        onChange={(e) =>
                        setPredictionData((prev) => ({
                            ...prev,
                            age: e.target.value,
                        }))
                        }
                        className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    </div>

                    <div className='space-y-2.5'>
                    <Label htmlFor='gender' className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gender</Label>
                    <select
                        id='gender'
                        className='w-full px-3 py-2 border border-input rounded-md bg-background hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200'
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

                    <div className='space-y-2.5'>
                    <Label htmlFor='grades' className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Education Level (Grades)
                    </Label>
                    <select
                        id='grades'
                        className='w-full px-3 py-2 border border-input rounded-md bg-background hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200'
                        value={predictionData.grades}
                        onChange={(e) =>
                        setPredictionData((prev) => ({
                            ...prev,
                            grades: e.target.value,
                        }))
                        }
                    >
                        <option value=''>Select education</option>
                        <option value='SMA'>SMA</option>
                        <option value='D3'>D3</option>
                        <option value='S1'>S1</option>
                        <option value='S2'>S2</option>
                    </select>
                    </div>

                    <div className='space-y-2.5'>
                    <Label htmlFor='majoring' className="text-sm font-semibold text-slate-700 dark:text-slate-200">Major Background</Label>
                    <select
                        id='majoring'
                        className='w-full px-3 py-2 border border-input rounded-md bg-background hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200'
                        value={predictionData.majoring}
                        onChange={(e) =>
                        setPredictionData((prev) => ({
                            ...prev,
                            majoring: e.target.value,
                        }))
                        }
                    >
                        <option value=''>Select major</option>
                        <option value='IT'>IT</option>
                        <option value='Non IT'>Non IT</option>
                    </select>
                    </div>

                    <div className='space-y-2.5'>
                    <Label htmlFor='logical_test_score' className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Logical Test Score (0-100)
                    </Label>
                    <Input
                        id='logical_test_score'
                        type='number'
                        placeholder='0-100'
                        value={predictionData.logical_test_score}
                        onChange={(e) =>
                        setPredictionData((prev) => ({
                            ...prev,
                            logical_test_score: e.target.value,
                        }))
                        }
                        className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    </div>

                    <div className='space-y-2.5'>
                    <Label htmlFor='tech_interview_result' className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Tech Interview Result
                    </Label>
                    <select
                        id='tech_interview_result'
                        className='w-full px-3 py-2 border border-input rounded-md bg-background hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200'
                        value={predictionData.tech_interview_result}
                        onChange={(e) =>
                        setPredictionData((prev) => ({
                            ...prev,
                            tech_interview_result: e.target.value,
                        }))
                        }
                    >
                        <option value=''>Select result</option>
                        <option value='Pass'>Pass</option>
                        <option value='Fail'>Fail</option>
                    </select>
                    </div>
                </div>

                <div className='flex gap-4 flex-wrap pt-4'>
                    <Button
                    onClick={handlePrediction}
                    disabled={isPredicting || !hasTrainedModels}
                    className='flex-1 bg-primary hover:bg-primary/90 text-white font-serif font-semibold py-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
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
                        Run Prediction
                        </>
                    )}
                    </Button>
                    <Button
                    onClick={resetPredictionForm}
                    variant='outline'
                    className='border-2 hover:bg-slate-50 dark:hover:bg-slate-700 font-serif font-semibold py-6 px-8 rounded-xl transition-all duration-300'
                    size='lg'
                    >
                    Reset
                    </Button>
                </div>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="batch">
             <Card className="shadow-xl border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                 <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
                     <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-full">
                         <Upload className="h-10 w-10 text-slate-500" />
                     </div>
                     <div className="text-center space-y-2">
                         <h3 className="text-lg font-semibold">Upload Participants CSV</h3>
                         <p className="text-sm text-muted-foreground">
                             Upload a CSV file containing participant data columns
                             (age, gender, grades, majoring, etc.)
                         </p>
                     </div>
                     <Input 
                        type="file" 
                        accept=".csv"
                        className="max-w-xs cursor-pointer"
                        onChange={onFileChange}
                     />
                     {csvFile && (
                         <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                             <FileText className="h-4 w-4" />
                             {csvFile.name}
                         </div>
                     )}
                     <Button 
                         onClick={onBatchSubmit}
                         disabled={!csvFile || isPredicting}
                         size="lg"
                         className="min-w-[200px]"
                     >
                         {isPredicting ? (
                            <>
                            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                            Processing...
                            </>
                        ) : (
                            "Start Batch Prediction"
                        )}
                     </Button>
                 </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Render Results */}
      {predictionResults && (
        <div className='space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700'>
          
          {predictionResults.batch_predictions ? (
              // Batch Results (Table)
              <div className="rounded-md border bg-card shadow-sm">
                  <div className="p-4 border-b bg-muted/50">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" /> 
                        Batch Prediction Results ({predictionResults.summary?.total_rows} rows)
                      </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                {predictionResults.batch_predictions.length > 0 && 
                                 Object.keys(predictionResults.batch_predictions[0]).sort().map(modelId => (
                                     <TableHead key={modelId} className="capitalize">{modelId}</TableHead>
                                 ))
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {predictionResults.batch_predictions.map((row: any, i: number) => (
                                <TableRow key={i}>
                                    <TableCell>{i + 1}</TableCell>
                                    {Object.keys(row).sort().map(modelId => {
                                        const res = row[modelId];
                                        if (res.error) return <TableCell key={modelId} className="text-red-500 text-xs">Error</TableCell>;
                                        return (
                                            <TableCell key={modelId}>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${res.prediction === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {res.prediction.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {(res.confidence * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
              </div>
          ) : (
              // Single Result (Deployment Prototype View)
              <div className="space-y-8">
                 {(() => {
                    // 1. Find Champion Model (AdaBoost)
                    const predictions = Array.isArray(predictionResults.predictions) ? predictionResults.predictions : [];
                    const championModel = predictions.find((p: any) => p.algorithm.toLowerCase().includes('adaboost')) || predictions[0];
                    
                    if (!championModel) return <div>No predictions available</div>;

                    // 2. Logic Tiering (Thesis Section 4.7)
                    const prob = championModel.probability; // 0.0 - 1.0 (assuming Pass Probability)
                    const isPass = championModel.prediction === 'pass';
                    // Correction: ensure probability represents 'Pass' confidence. 
                    // Usually confidence is for the predicted class. If pred is 'fail', and conf is 0.9, then Pass prob is 0.1.
                    const passProb = isPass ? prob : (1 - prob);
                    
                    let tier = "";
                    let recommendation = "";
                    let colorClass = "";
                    let bgClass = "";
                    
                    if (passProb < 0.20) {
                        tier = "Low Tier";
                        recommendation = "Disarankan Masuk Program Pre-Bootcamp (Persiapan)";
                        colorClass = "text-rose-600 dark:text-rose-400";
                        bgClass = "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900";
                    } else if (passProb > 0.60) {
                        tier = "High Tier";
                        recommendation = "Direkomendasikan Fast-Track (Prioritas Wawancara)";
                        colorClass = "text-emerald-600 dark:text-emerald-400";
                        bgClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900";
                    } else {
                        tier = "Middle Tier";
                        recommendation = "Perlu Review Manual / Wawancara Standar";
                        colorClass = "text-amber-600 dark:text-amber-400";
                        bgClass = "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900";
                    }

                    return (
                        <>
                            {/* Main Champion Card */}
                            <div className={`p-8 rounded-2xl border-2 shadow-lg ${bgClass} transition-all duration-500`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Target className={`h-6 w-6 ${colorClass}`} />
                                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                                Hasil Analisis Kelayakan
                                            </h2>
                                        </div>
                                        <p className="text-muted-foreground text-lg">
                                            Berdasarkan model <strong>{championModel.algorithm}</strong> (Champion)
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Probabilitas Sukses</div>
                                        <div className={`text-5xl font-extrabold ${colorClass}`}>
                                            {(passProb * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Kategori Kandidat</div>
                                            <div className={`text-2xl font-bold ${colorClass}`}>{tier}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Rekomendasi Sistem (SOP)</div>
                                            <div className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                {tier === 'High Tier' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                                                {tier === 'Low Tier' && <XCircle className="h-5 w-5 text-rose-500" />}
                                                {tier === 'Middle Tier' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                                                {recommendation}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Models (Collapsible or Small Grid) */}
                            {predictions.length > 1 && (
                                <div className="opacity-80">
                                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Model Pembanding Lainnya</h4>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                        {predictions.filter((p: any) => p !== championModel).map((pred: any, idx: number) => (
                                            <Card key={idx} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                <CardHeader className="py-4">
                                                    <CardTitle className='text-sm font-medium flex justify-between'>
                                                        {pred.algorithm}
                                                        <span className={pred.prediction === 'pass' ? 'text-green-600' : 'text-red-600'}>
                                                            {(pred.probability * 100).toFixed(0)}%
                                                        </span>
                                                    </CardTitle>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    );
                 })()}
              </div>
          )}
        </div>
      )}
    </div>
  );
}
