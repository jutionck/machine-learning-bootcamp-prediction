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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { algorithms } from '@/lib/constants';

type Props = {
  selectedAlgorithms: string[];
  onToggle: (id: string) => void;
  onSelectAll: (type: 'conventional' | 'boosting' | 'all') => void;
};

export default function AlgorithmSelector({
  selectedAlgorithms,
  onToggle,
  onSelectAll,
}: Props) {
  return (
    <Card className='transition-all duration-300 hover:shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'>
      <CardHeader className='pb-6'>
        <CardTitle className='flex items-center gap-3 text-xl font-serif'>
          <div className='p-2 bg-gradient-to-r from-primary to-accent rounded-lg'>
            <BarChart3 className='h-5 w-5 text-white' />
          </div>
          Algorithm Selection
        </CardTitle>
        <CardDescription className='text-slate-600 dark:text-slate-300'>
          Choose which algorithms to train and evaluate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
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
                        onCheckedChange={() => onToggle(algorithm.id)}
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
                        onCheckedChange={() => onToggle(algorithm.id)}
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

          <div className='flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl'>
            <div className='font-serif text-slate-700 dark:text-slate-300'>
              <span className='font-bold text-lg'>
                {selectedAlgorithms.length}
              </span>{' '}
              algorithm{selectedAlgorithms.length !== 1 ? 's' : ''} selected
            </div>
            {selectedAlgorithms.length > 0 && (
              <Badge className='bg-gradient-to-r from-primary to-accent text-white animate-pulse font-serif'>
                Ready to train
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
