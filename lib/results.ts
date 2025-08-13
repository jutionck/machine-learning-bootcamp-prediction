import type { AlgorithmResult } from '@/lib/types';

export function getAlgorithmResults(
  resultsData: any
): Record<string, AlgorithmResult> {
  if (!resultsData) return {};
  const algorithmResults: Record<string, AlgorithmResult> = {};
  Object.entries(resultsData).forEach(([key, value]) => {
    const v = value as any;
    if (v && typeof v === 'object' && v.name && v.metrics && v.type) {
      algorithmResults[key] = v as AlgorithmResult;
    }
  });
  return algorithmResults;
}

export function getBestAlgorithm(
  resultsData: any
): (AlgorithmResult & { id: string }) | null {
  const algorithmResults = getAlgorithmResults(resultsData);
  if (!algorithmResults || Object.keys(algorithmResults).length === 0)
    return null;

  let bestAlgorithm: (AlgorithmResult & { id: string }) | null = null;
  let bestScore = 0;

  Object.entries(algorithmResults).forEach(([id, result]) => {
    if (result?.metrics?.f1_score > bestScore) {
      bestScore = result.metrics.f1_score;
      bestAlgorithm = { id, ...result };
    }
  });

  return bestAlgorithm;
}

export function formatMetric(value: number) {
  return (value * 100).toFixed(1) + '%';
}

export function formatImprovement(value: number) {
  const sign = value >= 0 ? '+' : '';
  return sign + (value * 100).toFixed(2) + '%';
}
