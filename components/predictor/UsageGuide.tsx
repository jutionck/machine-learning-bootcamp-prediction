'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Upload, BarChart3, Target, Play } from 'lucide-react';

export default function UsageGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 font-serif">
          <BookOpen className="h-4 w-4" />
          Usage Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            How to Use Bootcamp Prediction
          </DialogTitle>
          <DialogDescription>
            A step-by-step guide to training models and predicting student success.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="training" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="training">Training Mode</TabsTrigger>
            <TabsTrigger value="prediction">Prediction Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="p-2 h-fit bg-primary/10 rounded-lg">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">1. Upload Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file containing historical student data. The dataset must include fields for age, gender, grades, major, logical test score, and technical interview result.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="p-2 h-fit bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">2. Select Algorithms</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose which machine learning algorithms you want to train. You can select individual algorithms or groups (Conventional vs. Boosting).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="p-2 h-fit bg-primary/10 rounded-lg">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">3. Train & Evaluate</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Start Training" to build models. The system will evaluate each model's accuracy, precision, and recall. Use "Comparison Mode" to see how SMOTE (oversampling) affects performance.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prediction" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-lg mb-4">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  Note: You must train models in Training Mode before you can use Prediction Mode.
                </p>
              </div>

              <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="p-2 h-fit bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">1. Input Candidate Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the candidate's demographic and test score information into the form. All fields are required for an accurate prediction.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="p-2 h-fit bg-primary/10 rounded-lg">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">2. Run Prediction</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Run Prediction" to see the results. The system will use all trained models to predict whether the candidate is likely to pass or fail, along with a probability score.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
