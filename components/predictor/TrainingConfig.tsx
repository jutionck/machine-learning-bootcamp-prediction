'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Settings } from 'lucide-react';

type Props = {
  useSmote: boolean;
  comparisonMode: boolean;
  isTraining: boolean;
  trainingProgress: number;
  selectedCount: number;
  onUseSmoteChange: (v: boolean) => void;
  onComparisonModeChange: (v: boolean) => void;
  onStart: () => void;
};

export default function TrainingConfig({
  useSmote,
  comparisonMode,
  isTraining,
  trainingProgress,
  selectedCount,
  onUseSmoteChange,
  onComparisonModeChange,
  onStart,
}: Props) {
  return (
    <Card className='transition-all duration-300 hover:shadow-2xl border-0 bg-white dark:bg-slate-800 backdrop-blur-sm'>
      <CardHeader className='pb-6'>
        <CardTitle className='flex items-center gap-3 text-xl font-serif'>
          <div className='p-2 bg-primary rounded-lg'>
            <Settings className='h-5 w-5 text-white' />
          </div>
          Training Configuration
        </CardTitle>
        <CardDescription className='text-slate-600 dark:text-slate-300'>
          Configure training parameters and start the training process
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg'>
          <Switch
            id='smote'
            checked={useSmote}
            onCheckedChange={onUseSmoteChange}
            className='data-[state=checked]:bg-primary'
          />
          <Label htmlFor='smote' className='font-serif font-medium'>
            Apply SMOTE (Synthetic Minority Oversampling Technique)
          </Label>
        </div>

        <div className='flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg'>
          <Switch
            id='comparison'
            checked={comparisonMode}
            onCheckedChange={onComparisonModeChange}
            className='data-[state=checked]:bg-primary'
          />
          <Label htmlFor='comparison' className='font-serif font-medium'>
            Comparison Mode (Train with and without SMOTE)
          </Label>
        </div>

        <div className='pt-6 border-t border-slate-200 dark:border-slate-600'>
          <Button
            onClick={onStart}
            disabled={isTraining || selectedCount === 0}
            className='w-full bg-primary hover:bg-primary/90 text-white font-serif font-bold text-lg py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl animate-pulse-glow'
            size='lg'
          >
            {isTraining ? (
              <>
                <Loader2 className='mr-3 h-6 w-6 animate-spin' />
                Training Models... ({trainingProgress}%)
              </>
            ) : (
              <>
                <Play className='mr-3 h-6 w-6' />
                Start Training ({selectedCount} algorithms)
              </>
            )}
          </Button>
        </div>

        <div className='text-sm text-slate-500 dark:text-slate-400 space-y-2 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl'>
          <div className='font-serif font-semibold text-slate-700 dark:text-slate-300 mb-2'>
            Training Process:
          </div>
          <p>• Dataset will be split: 90% training, 5% validation, 5% test</p>
          <p>
            • Grid Search will optimize hyperparameters using cross-validation
          </p>
          <p>• McNemar test will compare conventional vs boosting algorithms</p>
          <p>• SHAP analysis will provide feature importance explanations</p>
        </div>
      </CardContent>
    </Card>
  );
}
