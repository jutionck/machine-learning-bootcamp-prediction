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
    experience: string;
    logical_test_score: string;
    tech_interview_score: string;
  };
  setPredictionData: React.Dispatch<
    React.SetStateAction<{
      age: string;
      gender: string;
      grades: string;
      majoring: string;
      experience: string;
      logical_test_score: string;
      tech_interview_score: string;
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
                    <Label htmlFor='grades' className="text-sm font-semibold text-slate-700 dark:text-slate-200">Education Level</Label>
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
                    <Label htmlFor='experience' className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Programming Experience
                    </Label>
                    <select
                        id='experience'
                        className='w-full px-3 py-2 border border-input rounded-md bg-background hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200'
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
                    <Label htmlFor='tech_interview_score' className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Tech Interview Score (0-100)
                    </Label>
                    <Input
                        id='tech_interview_score'
                        type='number'
                        placeholder='0-100'
                        value={predictionData.tech_interview_score}
                        onChange={(e) =>
                        setPredictionData((prev) => ({
                            ...prev,
                            tech_interview_score: e.target.value,
                        }))
                        }
                        className="focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
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
              <div className="rounded-md border bg-card">
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
                                {/* We can infer models from the first result */}
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
              // Single Result (Cards)
              <>
                <h3 className='text-2xl font-serif font-bold text-center text-slate-800 dark:text-slate-100'>
                    Prediction Results
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {Array.isArray(predictionResults.predictions) && predictionResults.predictions.map((pred: any, idx: number) => (
                    <Card
                        key={idx}
                        className={`transform transition-all duration-500 hover:scale-105 hover:shadow-xl border-l-4 ${
                        pred.prediction === 'pass'
                            ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                            : 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/10'
                        }`}
                    >
                        <CardHeader>
                        <CardTitle className='text-lg flex items-center justify-between'>
                            <span>{pred.algorithm}</span>
                            {pred.prediction === 'pass' ? (
                            <CheckCircle className='h-6 w-6 text-emerald-500' />
                            ) : (
                            <XCircle className='h-6 w-6 text-rose-500' />
                            )}
                        </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                            <span className='text-muted-foreground'>Result</span>
                            <span
                                className={`font-bold px-3 py-1 rounded-full text-sm ${
                                pred.prediction === 'pass'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                                }`}
                            >
                                {pred.prediction.toUpperCase()}
                            </span>
                            </div>
                            <div className='flex justify-between items-center'>
                            <span className='text-muted-foreground'>Probability</span>
                            <span className='font-mono font-medium'>
                                {(pred.probability * 100).toFixed(1)}%
                            </span>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
              </>
          )}
        </div>
      )}
    </div>
  );
}
