'use client';

import React from 'react';
import {
  BookOpen,
  Upload,
  BarChart3,
  Target,
  Play
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from "@/components/ui/breadcrumb"

export default function GuidePage() {
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
                  <BreadcrumbPage>User Guide</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Guide</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                   Master the workflow for training models and predicting student success.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Overview</CardTitle>
                <CardDescription>
                  Choose a mode below to learn about the specific steps involved.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="training" className="w-full">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-8 h-auto">
                    <TabsTrigger value="training">Training Mode</TabsTrigger>
                    <TabsTrigger value="prediction">Prediction Mode</TabsTrigger>
                  </TabsList>

                  <TabsContent value="training" className="space-y-6">
                    <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
                        <div className="p-3 h-fit bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">1. Upload Data</h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Start by uploading a CSV file containing historical student data. The dataset ensures the model learns from real patterns. 
                            <br/><span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">Required columns: age, gender, education, major, experience</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
                        <div className="p-3 h-fit bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">2. Configure & Train</h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Select the machine learning algorithms you wish to compare. You can choose from conventional models (like Logistic Regression) or advanced boosting (like XGBoost). 
                            Enable <strong>Comparison Mode</strong> to see the impact of SMOTE (Synthetic Minority Over-sampling Technique) on your results.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
                        <div className="p-3 h-fit bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">3. Analyze Results</h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            After training, view the comprehensive report. The system highlights the <strong>Winner</strong> model based on Accuracy and F1-Score. You can export these results to JSON or CSV for your thesis or usage in Prediction Mode.
                          </p>
                        </div>
                      </div>
                  </TabsContent>

                  <TabsContent value="prediction" className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-lg flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                          Prerequisite: Models must be trained in Training Mode first.
                        </p>
                      </div>

                      <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
                        <div className="p-3 h-fit bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                          <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">1. Input Candidate Profile</h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Enter the details of a new student applicant. Ensure all fields (Logical Score, Tech Interview, etc.) are filled accurately to get the best prediction.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md">
                        <div className="p-3 h-fit bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                          <Play className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">2. Get Prediction</h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            The system will utilize the best performing trained models to predict the likelihood of the candidate passing the bootcamp.
                          </p>
                        </div>
                      </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
