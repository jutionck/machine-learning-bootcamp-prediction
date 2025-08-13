'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { datasetAttributes } from '@/lib/constants';

type Props = {
  selectedFile: File | null;
  datasetValid: boolean;
  datasetPreview: any[];
  comparisonMode: boolean;
  useSmote: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onComparisonModeChange: (value: boolean) => void;
  onUseSmoteChange: (value: boolean) => void;
  showInlinePreview?: boolean;
};

export default function UploadPanel(props: Props) {
  const {
    selectedFile,
    datasetValid,
    datasetPreview,
    comparisonMode,
    useSmote,
    onFileChange,
    onComparisonModeChange,
    onUseSmoteChange,
    showInlinePreview = true,
  } = props;

  return (
    <>
      <Card className='transition-all duration-300 hover:shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'>
        <CardHeader className='pb-6'>
          <CardTitle className='flex items-center gap-3 text-xl font-serif'>
            <div className='p-2 bg-gradient-to-r from-primary to-accent rounded-lg'>
              <Upload className='h-5 w-5 text-white' />
            </div>
            Upload Data
          </CardTitle>
          <CardDescription className='text-slate-600 dark:text-slate-300'>
            Upload your bootcamp participant CSV dataset
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <Label htmlFor='file-upload' className='font-serif font-semibold'>
              Dataset File
            </Label>
            <Input
              id='file-upload'
              type='file'
              accept='.csv'
              onChange={onFileChange}
              className='mt-2 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary transition-colors duration-300 rounded-xl py-3'
            />
            {selectedFile && (
              <div className='mt-4 space-y-3'>
                <div className='flex items-center gap-3 text-sm p-3 bg-slate-50 dark:bg-slate-700 rounded-lg'>
                  {datasetValid ? (
                    <CheckCircle className='h-5 w-5 text-emerald-600 flex-shrink-0' />
                  ) : (
                    <AlertCircle className='h-5 w-5 text-amber-600 flex-shrink-0' />
                  )}
                  <div>
                    <div
                      className={`font-medium ${
                        datasetValid ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {selectedFile.name}
                    </div>
                    <div className='text-slate-500 text-xs'>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                {datasetValid && (
                  <Badge
                    variant='secondary'
                    className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  >
                    Dataset validated ✓
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className='space-y-3'>
            <Label className='text-sm font-semibold'>
              Required Dataset Attributes:
            </Label>
            <div className='space-y-2 text-xs'>
              {datasetAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  className='flex flex-col space-y-1 p-2 bg-gray-50 dark:bg-gray-800 rounded'
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{attr.name}</span>
                    <Badge variant='outline' className='text-xs'>
                      {attr.type}
                    </Badge>
                  </div>
                  <span className='text-gray-600 dark:text-gray-400'>
                    {attr.description}
                  </span>
                  {'values' in (attr as any) &&
                    Array.isArray((attr as any).values) && (
                      <span className='text-blue-600 dark:text-blue-400'>
                        Values: {(attr as any).values.join(', ')}
                      </span>
                    )}
                  {'min' in (attr as any) && 'max' in (attr as any) && (
                    <span className='text-green-600 dark:text-green-400'>
                      Range: {(attr as any).min}-{(attr as any).max}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className='flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg'>
            <Switch
              id='comparison-toggle'
              checked={comparisonMode}
              onCheckedChange={onComparisonModeChange}
              className='data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent'
            />
            <Label
              htmlFor='comparison-toggle'
              className='font-serif font-medium'
            >
              SMOTE Comparison Mode
            </Label>
          </div>

          {!comparisonMode && (
            <div className='flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg'>
              <Switch
                id='smote-toggle'
                checked={useSmote}
                onCheckedChange={onUseSmoteChange}
                className='data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent'
              />
              <Label htmlFor='smote-toggle' className='font-serif font-medium'>
                Apply SMOTE (Synthetic Minority Oversampling)
              </Label>
            </div>
          )}

          {comparisonMode && (
            <Alert className='border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'>
              <AlertDescription className='text-xs text-blue-700 dark:text-blue-300'>
                Comparison mode will train all algorithms both with and without
                SMOTE for detailed analysis
              </AlertDescription>
            </Alert>
          )}

          {!comparisonMode && useSmote && (
            <Alert className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'>
              <AlertDescription className='text-xs text-green-700 dark:text-green-300'>
                SMOTE will be applied to balance the dataset before training
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showInlinePreview && datasetPreview.length > 0 && (
        <Card className='transition-all duration-200 hover:shadow-lg lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Dataset Preview
            </CardTitle>
            <CardDescription>
              Sample rows from your uploaded dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </>
  );
}
