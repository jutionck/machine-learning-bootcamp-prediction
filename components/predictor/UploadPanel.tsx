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

import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { datasetAttributes } from '@/lib/constants';

type Props = {
  selectedFile: File | null;
  datasetValid: boolean;
  datasetPreview: any[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showInlinePreview?: boolean;
  validationErrors?: string[];
};

export default function UploadPanel(props: Props) {
  const {
    selectedFile,
    datasetValid,
    datasetPreview,
    onFileChange,
    showInlinePreview = true,
    validationErrors = [],
  } = props;

  return (
    <>
      <Card className='transition-all duration-300 hover:shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'>
        <CardHeader className='pb-6'>
          <CardTitle className='flex items-center gap-3 text-xl font-serif'>
            <div className='p-2 bg-primary rounded-lg'>
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
            <div className="group relative mt-2">
              <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50 transition-all duration-300 cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-3 bg-primary/10 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    CSV file (max. 10MB)
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={onFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
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

                {!datasetValid && validationErrors && validationErrors.length > 0 && (
                  <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs ml-2">
                      <div className="font-semibold mb-1">Validation Errors:</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {validationErrors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                        {validationErrors.length > 5 && (
                          <li>...and {validationErrors.length - 5} more errors</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

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
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs'>
              {datasetAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  className='flex flex-col space-y-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700'
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{attr.name}</span>
                    <Badge variant='outline' className='text-[10px] h-4 px-1'>
                      {attr.type}
                    </Badge>
                  </div>
                  <span className='text-gray-600 dark:text-gray-400 text-[10px] line-clamp-1' title={attr.description}>
                    {attr.description}
                  </span>
                  {'values' in (attr as any) &&
                    Array.isArray((attr as any).values) && (
                      <span className='text-blue-600 dark:text-blue-400 text-[10px] line-clamp-1' title={(attr as any).values.join(', ')}>
                         Values: {(attr as any).values.join(', ')}
                      </span>
                    )}
                  {'min' in (attr as any) && 'max' in (attr as any) && (
                    <span className='text-green-600 dark:text-green-400 text-[10px]'>
                      Range: {(attr as any).min}-{(attr as any).max}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>


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
