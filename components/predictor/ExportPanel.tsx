'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type Props = {
  onExportJSON: () => Promise<void> | void;
  onExportCSV: () => Promise<void> | void;
  onExportReport: () => Promise<void> | void;
  loading?: boolean;
};

export default function ExportPanel({
  onExportJSON,
  onExportCSV,
  onExportReport,
  loading = false,
}: Props) {
  return (
    <div className='mx-auto space-y-4'>
      <h2 className='text-2xl font-serif font-bold text-slate-800 dark:text-slate-200'>
        Export Results
      </h2>
      <div className='flex flex-col sm:flex-row gap-4 flex-wrap'>
        <Button
          onClick={onExportJSON}
          disabled={loading}
          className='bg-primary text-white hover:bg-primary/90 flex-1'
        >
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Exporting
              JSON...
            </>
          ) : (
            'Export as JSON'
          )}
        </Button>
        <Button
          onClick={onExportCSV}
          disabled={loading}
          className='bg-primary text-white hover:bg-primary/90 flex-1'
        >
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Exporting CSV...
            </>
          ) : (
            'Export as CSV'
          )}
        </Button>
        <Button
          onClick={onExportReport}
          disabled={loading}
          className='bg-primary text-white hover:bg-primary/90 flex-1'
        >
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Generating
              Report...
            </>
          ) : (
            'Generate Academic Report'
          )}
        </Button>
      </div>
    </div>
  );
}
