'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileText, BarChart3, Settings, Loader2, Play } from 'lucide-react';
import { algorithms } from '@/lib/constants';

type Props = {
  datasetPreview: any[];
  datasetValid: boolean;
  selectedAlgorithms: string[];
  onToggleAlgorithm: (id: string) => void;
  onSelectAll: (type: 'conventional' | 'boosting' | 'all') => void;
  useSmote: boolean;
  comparisonMode: boolean;
  isTraining: boolean;
  trainingProgress: number;
  onUseSmoteChange: (v: boolean) => void;
  onComparisonModeChange: (v: boolean) => void;
  onStart: () => void;
};

export default function DatasetConfigCard({
  datasetPreview,
  datasetValid,
  selectedAlgorithms,
  onToggleAlgorithm,
  onSelectAll,
  useSmote,
  comparisonMode,
  isTraining,
  trainingProgress,
  onUseSmoteChange,
  onComparisonModeChange,
  onStart,
}: Props) {
  const selectedCount = selectedAlgorithms.length;
  return (
    <Card className='transition-all duration-300 hover:shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-3 text-xl font-serif'>
          <div className='p-2 bg-primary rounded-lg'>
            <FileText className='h-5 w-5 text-white' />
          </div>
          Dataset Preview & Configuration
        </CardTitle>
        <CardDescription className='text-slate-600 dark:text-slate-300'>
          Review your dataset, choose algorithms, and configure training in one
          place
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-8'>
        {/* Dataset Preview */}
        {datasetPreview.length > 0 ? (
          <div>
            <div className='overflow-x-auto'>
              <table className='w-full text-xs border-collapse'>
                <thead>
                  <tr className='border-b'>
                    {Object.keys(datasetPreview[0] || {}).map((header) => (
                      <th
                        key={header}
                        className='text-left p-2 font-semibold bg-gray-50 dark:bg-gray-800'
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasetPreview.map((row, idx) => (
                    <tr
                      key={idx}
                      className='border-b hover:bg-gray-50 dark:hover:bg-gray-800'
                    >
                      {Object.values(row).map((value: any, cellIdx) => (
                        <td key={cellIdx} className='p-2'>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='mt-3 text-xs text-gray-500'>
              Showing first {datasetPreview.length} rows •
              {datasetValid ? (
                <span className='text-green-600 ml-1'>
                  Dataset format is valid
                </span>
              ) : (
                <span className='text-yellow-600 ml-1'>
                  Please fix validation issues above
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className='text-sm text-slate-500'>
            No dataset preview available
          </div>
        )}

        {/* Algorithm Selection */}
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary rounded-lg'>
              <BarChart3 className='h-5 w-5 text-white' />
            </div>
            <h3 className='text-lg font-serif font-bold'>
              Algorithm Selection
            </h3>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onSelectAll('all')}
              className='transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white border-2 font-serif'
            >
              Select All
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onSelectAll('conventional')}
              className='transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-white border-2 font-serif'
            >
              All Conventional
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onSelectAll('boosting')}
              className='transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-white border-2 font-serif'
            >
              All Boosting
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='p-4 bg-slate-50 dark:bg-slate-700 rounded-xl'>
              <h4 className='font-serif font-bold text-lg text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2'>
                <div className='w-3 h-3 bg-primary rounded-full'></div>
                Conventional Algorithms
              </h4>
              <div className='space-y-3'>
                {algorithms
                  .filter((alg) => alg.type === 'conventional')
                  .map((algorithm) => (
                    <div
                      key={algorithm.id}
                      className='flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 hover:shadow-md'
                    >
                      <Checkbox
                        id={algorithm.id}
                        checked={selectedAlgorithms.includes(algorithm.id)}
                        onCheckedChange={() => onToggleAlgorithm(algorithm.id)}
                        className='data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                      />
                      <Label
                        htmlFor={algorithm.id}
                        className='font-serif cursor-pointer flex-1'
                      >
                        {algorithm.name}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>

            <div className='p-4 bg-slate-50 dark:bg-slate-700 rounded-xl'>
              <h4 className='font-serif font-bold text-lg text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2'>
                <div className='w-3 h-3 bg-accent rounded-full'></div>
                Boosting Algorithms
              </h4>
              <div className='space-y-3'>
                {algorithms
                  .filter((alg) => alg.type === 'boosting')
                  .map((algorithm) => (
                    <div
                      key={algorithm.id}
                      className='flex items-center space-x-3 p-3 rounded-lg hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 hover:shadow-md'
                    >
                      <Checkbox
                        id={algorithm.id}
                        checked={selectedAlgorithms.includes(algorithm.id)}
                        onCheckedChange={() => onToggleAlgorithm(algorithm.id)}
                        className='data-[state=checked]:bg-accent data-[state=checked]:border-accent'
                      />
                      <Label
                        htmlFor={algorithm.id}
                        className='font-serif cursor-pointer flex-1'
                      >
                        {algorithm.name}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl'>
            <div className='font-serif text-slate-700 dark:text-slate-300'>
              <span className='font-bold text-lg'>{selectedCount}</span>{' '}
              algorithm{selectedCount !== 1 ? 's' : ''} selected
            </div>
            {selectedCount > 0 && (
              <Badge className='bg-primary text-white animate-pulse font-serif'>
                Ready to train
              </Badge>
            )}
          </div>
        </div>

        {/* Training Config */}
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary rounded-lg'>
              <Settings className='h-5 w-5 text-white' />
            </div>
            <h3 className='text-lg font-serif font-bold'>
              Training Configuration
            </h3>
          </div>

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

          <div className='pt-2'>
            <Button
              onClick={onStart}
              disabled={isTraining || selectedCount === 0 || !datasetValid}
              className='w-full bg-primary hover:bg-primary/90 text-white font-serif font-bold text-lg py-4 rounded-2xl shadow-2xl transition-all duration-300'
              size='lg'
            >
              {isTraining ? (
                <>
                  <Loader2 className='mr-3 h-6 w-6 animate-spin' />
                  Training Models... ({trainingProgress.toFixed(0)}%)
                </>
              ) : (
                <>
                  <Play className='mr-3 h-6 w-6' />
                  Start Training ({selectedCount} algorithms)
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
