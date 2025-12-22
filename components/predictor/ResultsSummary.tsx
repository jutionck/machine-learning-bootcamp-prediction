'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import type {
  AdvancedMetadata,
  ComparisonResults,
  StatisticalAnalysisMap,
  TrainingResultsMap,
} from '@/lib/types';
import { metricNames } from '@/lib/constants';
import { getAlgorithmResults } from '@/lib/results';

type Props = {
  results?: TrainingResultsMap | null;
  comparisonResults?: ComparisonResults | null;
  metadata?: AdvancedMetadata | null;
  statisticalAnalysis?: StatisticalAnalysisMap | null;
};

const format = (v: number) => (Number.isFinite(v) ? v.toFixed(4) : '-');

export default function ResultsSummary({
  results,
  comparisonResults,
  metadata,
  statisticalAnalysis,
}: Props) {
  const isComparison = Boolean(comparisonResults);
  const algMap = results ? getAlgorithmResults(results) : {};
  const algArray = Object.entries(algMap);
  const bestByRocAuc = algArray.length
    ? algArray.reduce((best, cur) =>
        cur[1].metrics.roc_auc > best[1].metrics.roc_auc ? cur : best
      )
    : null;

  const getWinner = (withoutRes: any, withRes: any) => {
    if (!withoutRes?.metrics || !withRes?.metrics) return null;
    // Compare mainly by ROC-AUC (Thesis Standard), then f1_score if tie
    const aucDiff = withRes.metrics.roc_auc - withoutRes.metrics.roc_auc;
    
    if (Math.abs(aucDiff) < 0.0001) {
         const f1Diff = withRes.metrics.f1_score - withoutRes.metrics.f1_score;
         if (Math.abs(f1Diff) < 0.0001) return { winner: 'tie', label: 'Tie' };
         return f1Diff > 0 
            ? { winner: 'with_smote', label: 'With SMOTE', reason: 'Higher F1' }
            : { winner: 'without_smote', label: 'Without SMOTE', reason: 'Higher F1' };
    }
    
    return aucDiff > 0
      ? { winner: 'with_smote', label: 'With SMOTE', reason: 'Higher ROC-AUC' }
      : { winner: 'without_smote', label: 'Without SMOTE', reason: 'Higher ROC-AUC' };
  };

  return (
    <div className='space-y-6'>
      {bestByRocAuc && (
        <Card className='border-0 shadow-none overflow-hidden bg-emerald-500 text-white'>
          <div className='p-5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2.5 rounded-lg bg-white/20 text-white'>
                  <Trophy className='h-5 w-5' />
                </div>
                <div>
                  <div className='text-sm text-white/80 font-semibold'>
                    Best Performing Algorithm (Thesis Standard)
                  </div>
                  <div className='text-xl font-serif font-bold text-white'>
                    {bestByRocAuc[1].name}
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-xs uppercase text-white/80'>ROC-AUC Score</div>
                <div className='text-2xl font-extrabold text-white'>
                  {(bestByRocAuc[1].metrics.roc_auc * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {algArray.length > 0 && (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle>Performance Comparison {isComparison && '(With SMOTE)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {algArray.map(([id, r]) => {
                const data = [
                  { metric: 'Accuracy', value: r.metrics.accuracy * 100 },
                  { metric: 'Precision', value: r.metrics.precision * 100 },
                  { metric: 'Recall', value: r.metrics.recall * 100 },
                  { metric: 'F1-Score', value: r.metrics.f1_score * 100 },
                  { metric: 'ROC-AUC', value: r.metrics.roc_auc * 100 },
                ];
                return (
                  <div
                    key={id}
                    className='p-3 border rounded-xl bg-white/60 dark:bg-slate-800/60'
                  >
                    <div className='text-sm font-semibold mb-2'>{r.name}</div>
                    <div className='h-48'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <RadarChart
                          data={data}
                          cx='50%'
                          cy='50%'
                          outerRadius='80%'
                        >
                          <PolarGrid />
                          <PolarAngleAxis
                            dataKey='metric'
                            tick={{ fontSize: 10 }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fontSize: 10 }}
                          />
                          <Radar
                            name={r.name}
                            dataKey='value'
                            stroke='#22c55e'
                            fill='#22c55e'
                            fillOpacity={0.35}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle>
            {isComparison ? 'Training Report' : 'Detailed Results'}
          </CardTitle>
          {metadata && (
            <CardDescription>
              Dataset {metadata.dataset_shape?.[0]} rows ×{' '}
              {metadata.dataset_shape?.[1]} cols • Train{' '}
              {metadata.train_shape?.[0]}, Val {metadata.validation_shape?.[0]},
              Test {metadata.test_shape?.[0]} • SMOTE{' '}
              {metadata.use_smote ? 'Yes' : 'No'}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {!isComparison && results && (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm border-collapse'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left p-2'>Algorithm</th>
                    <th className='text-left p-2'>Type</th>
                    {Object.keys(metricNames).map((k) => (
                      <th key={k} className='text-left p-2'>
                        {metricNames[k as keyof typeof metricNames]}
                      </th>
                    ))}
                    <th className='text-left p-2'>Stability (CV F1)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(getAlgorithmResults(results)).map((r) => (
                    <tr key={r.name} className='border-b'>
                      <td className='p-2 whitespace-nowrap'>{r.name}</td>
                      <td className='p-2 whitespace-nowrap capitalize'>
                        {r.type}
                      </td>
                      <td className='p-2'>{format(r.metrics.accuracy)}</td>
                      <td className='p-2'>{format(r.metrics.precision)}</td>
                      <td className='p-2'>{format(r.metrics.recall)}</td>
                      <td className='p-2'>{format(r.metrics.f1_score)}</td>
                      <td className='p-2'>{format(r.metrics.roc_auc)}</td>
                      <td className='p-2 font-mono text-xs'>
                        {r.cv_stats 
                          ? `${(r.cv_stats.mean_f1 * 100).toFixed(1)}% (±${(r.cv_stats.std_f1 * 100).toFixed(1)}%)`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isComparison && comparisonResults && (
            <div className='space-y-8'>
              <div className='overflow-x-auto'>
                <h4 className='font-serif font-bold text-lg mb-4 flex items-center gap-2'>
                   <Trophy className="h-5 w-5 text-yellow-500" />
                   Head-to-Head Comparison
                </h4>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Algorithm</TableHead>
                        <TableHead>Without SMOTE</TableHead>
                        <TableHead>With SMOTE</TableHead>
                        <TableHead>Winner</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.keys(comparisonResults.without_smote).map(id => {
                        const wOut = comparisonResults.without_smote[id];
                        const wIn = comparisonResults.with_smote[id];
                        if (!wOut || !wIn || !wOut.metrics || !wIn.metrics) return null;
                        const win = getWinner(wOut, wIn);
                        
                        return (
                          <TableRow key={id}>
                            <TableCell className="font-medium">{wOut.name}</TableCell>
                            <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                                {format(wOut.metrics.accuracy)}
                            </TableCell>
                            <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                                {format(wIn.metrics.accuracy)}
                            </TableCell>
                            <TableCell>
                                {win?.winner === 'tie' && (
                                    <Badge variant="outline" className="gap-1.5 text-slate-500">
                                        <Minus className="h-3.5 w-3.5" />
                                        Draw
                                    </Badge>
                                )}
                                {win?.winner === 'with_smote' && (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1.5">
                                        <ArrowRight className="h-3.5 w-3.5" />
                                        With SMOTE
                                    </Badge>
                                )}
                                {win?.winner === 'without_smote' && (
                                    <Badge variant="secondary" className="gap-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                        <ArrowRight className="h-3.5 w-3.5" />
                                        Without SMOTE
                                    </Badge>
                                )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className='overflow-x-auto'>
                <h4 className='font-semibold mb-2'>Without SMOTE</h4>
                <table className='w-full text-sm border-collapse'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left p-2'>Algorithm</th>
                      <th className='text-left p-2'>Type</th>
                      {Object.keys(metricNames).map((k) => (
                        <th key={k} className='text-left p-2'>
                          {metricNames[k as keyof typeof metricNames]}
                        </th>
                      ))}
                      <th className='text-left p-2'>Stability (CV F1)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(comparisonResults.without_smote).map(
                      ([id, r]) =>
                        r?.metrics ? (
                          <tr key={`no-${id}`} className='border-b'>
                            <td className='p-2 whitespace-nowrap'>{r.name}</td>
                            <td className='p-2 whitespace-nowrap capitalize'>
                              {r.type}
                            </td>
                            <td className='p-2'>
                              {format(r.metrics.accuracy)}
                            </td>
                            <td className='p-2'>
                              {format(r.metrics.precision)}
                            </td>
                            <td className='p-2'>{format(r.metrics.recall)}</td>
                            <td className='p-2'>
                              {format(r.metrics.f1_score)}
                            </td>
                            <td className='p-2'>{format(r.metrics.roc_auc)}</td>
                            <td className='p-2 font-mono text-xs'>
                                {r.cv_stats 
                                ? `${(r.cv_stats.mean_f1 * 100).toFixed(1)}% (±${(r.cv_stats.std_f1 * 100).toFixed(1)}%)`
                                : '-'}
                            </td>
                          </tr>
                        ) : null
                    )}
                  </tbody>
                </table>
              </div>

              <div className='overflow-x-auto'>
                <h4 className='font-semibold mb-2'>With SMOTE</h4>
                <table className='w-full text-sm border-collapse'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left p-2'>Algorithm</th>
                      <th className='text-left p-2'>Type</th>
                      {Object.keys(metricNames).map((k) => (
                        <th key={k} className='text-left p-2'>
                          {metricNames[k as keyof typeof metricNames]}
                        </th>
                      ))}
                      <th className='text-left p-2'>Stability (CV F1)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(comparisonResults.with_smote).map(
                      ([id, r]) =>
                        r?.metrics ? (
                          <tr key={`sm-${id}`} className='border-b'>
                            <td className='p-2 whitespace-nowrap'>{r.name}</td>
                            <td className='p-2 whitespace-nowrap capitalize'>
                              {r.type}
                            </td>
                            <td className='p-2'>
                              {format(r.metrics.accuracy)}
                            </td>
                            <td className='p-2'>
                              {format(r.metrics.precision)}
                            </td>
                            <td className='p-2'>{format(r.metrics.recall)}</td>
                            <td className='p-2'>
                              {format(r.metrics.f1_score)}
                            </td>
                            <td className='p-2'>{format(r.metrics.roc_auc)}</td>
                            <td className='p-2 font-mono text-xs'>
                                {r.cv_stats 
                                ? `${(r.cv_stats.mean_f1 * 100).toFixed(1)}% (±${(r.cv_stats.std_f1 * 100).toFixed(1)}%)`
                                : '-'}
                            </td>
                          </tr>
                        ) : null
                    )}
                  </tbody>
                </table>
              </div>

              {comparisonResults.comparison && (
                <div className='overflow-x-auto'>
                  <h4 className='font-semibold mb-2'>
                    Improvements (With SMOTE - Without SMOTE)
                  </h4>
                  <table className='w-full text-sm border-collapse'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left p-2'>Algorithm</th>
                        {Object.keys(metricNames).map((k) => (
                          <th key={k} className='text-left p-2'>
                            {metricNames[k as keyof typeof metricNames]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(comparisonResults.comparison).map(
                        ([id, cmp]) => (
                          <tr key={`imp-${id}`} className='border-b'>
                            <td className='p-2 whitespace-nowrap'>
                              {cmp.name}
                            </td>
                            <td className='p-2'>
                              {format(cmp.improvements.accuracy)}
                            </td>
                            <td className='p-2'>
                              {format(cmp.improvements.precision)}
                            </td>
                            <td className='p-2'>
                              {format(cmp.improvements.recall)}
                            </td>
                            <td className='p-2'>
                              {format(cmp.improvements.f1_score)}
                            </td>
                            <td className='p-2'>
                              {format(cmp.improvements.roc_auc)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {statisticalAnalysis && Object.keys(statisticalAnalysis).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistical Analysis (McNemar)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm border-collapse'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left p-2'>Comparison</th>
                    <th className='text-left p-2'>Statistic</th>
                    <th className='text-left p-2'>p-value</th>
                    <th className='text-left p-2'>Significant</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statisticalAnalysis).map(([k, v]) => (
                    <tr key={k} className='border-b'>
                      <td className='p-2 whitespace-nowrap'>
                        {v.conventional_algorithm} vs {v.boosting_algorithm}
                      </td>
                      <td className='p-2'>
                        {format(v.mcnemar_test.statistic)}
                      </td>
                      <td className='p-2'>{format(v.mcnemar_test.p_value)}</td>
                      <td className='p-2'>
                        {v.mcnemar_test.significant ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
