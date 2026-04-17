'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Model } from '@/lib/featherless';

interface ModelContextType {
  models: Model[];
  isLoading: boolean;
  error: string | null;
  getModelById: (id: string) => Model | undefined;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        setModels(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  const getModelById = (id: string) => {
    return models.find((m) => m.id === id);
  };

  return (
    <ModelContext.Provider value={{ models, isLoading, error, getModelById }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModels() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModels must be used within a ModelProvider');
  }
  return context;
}
