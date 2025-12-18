"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TrainingResultsMap, ComparisonResults, AdvancedMetadata, StatisticalAnalysisMap } from '@/lib/types';

interface ModelContextType {
  results: TrainingResultsMap | null;
  comparisonResults: ComparisonResults | null;
  metadata: AdvancedMetadata | null;
  statisticalAnalysis: StatisticalAnalysisMap | null;
  selectedAlgorithms: string[];
  setResults: (results: TrainingResultsMap | null) => void;
  setComparisonResults: (results: ComparisonResults | null) => void;
  setMetadata: (metadata: AdvancedMetadata | null) => void;
  setStatisticalAnalysis: (analysis: StatisticalAnalysisMap | null) => void;
  setSelectedAlgorithms: (algos: string[]) => void;
  resetModel: () => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<TrainingResultsMap | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);
  const [metadata, setMetadata] = useState<AdvancedMetadata | null>(null);
  const [statisticalAnalysis, setStatisticalAnalysis] = useState<StatisticalAnalysisMap | null>(null);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);

  const resetModel = () => {
    setResults(null);
    setComparisonResults(null);
    setMetadata(null);
    setStatisticalAnalysis(null);
    setSelectedAlgorithms([]);
  };

  return (
    <ModelContext.Provider
      value={{
        results,
        comparisonResults,
        metadata,
        statisticalAnalysis,
        selectedAlgorithms,
        setResults,
        setComparisonResults,
        setMetadata,
        setStatisticalAnalysis,
        setSelectedAlgorithms,
        resetModel,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}
