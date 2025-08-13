'use client';
import React from 'react';

type Props = {
  data: any[];
  valid: boolean;
  className?: string;
};

export default function DatasetPreview({ data, valid, className }: Props) {
  if (!data || data.length === 0) return null;
  const headers = Object.keys(data[0] || {});
  return (
    <div className={className}>
      <div className='overflow-x-auto'>
        <table className='w-full text-xs border-collapse'>
          <thead>
            <tr className='border-b'>
              {headers.map((header) => (
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
            {data.map((row, idx) => (
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
        Showing first {data.length} rows •
        {valid ? (
          <span className='text-green-600 ml-1'>Dataset format is valid</span>
        ) : (
          <span className='text-yellow-600 ml-1'>
            Please fix validation issues above
          </span>
        )}
      </div>
    </div>
  );
}
