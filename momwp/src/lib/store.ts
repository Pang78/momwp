'use client';

import { create } from 'zustand';
// Use a type-only import to avoid circular dependencies
import type { Dataset, DatasetMetadata, DataRecord, Collection } from './api/datagovsg';
// Then import the actual API
import api from './api/datagovsg';

interface DatasetState {
  // Datasets
  datasets: Dataset[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  
  // Selected dataset
  selectedDataset: DatasetMetadata | null;
  datasetRecords: DataRecord[];
  totalRecords: number;
  recordFields: Array<{ id: string; type: string }>;
  
  // Collections
  collections: Collection[];
  
  // Actions
  fetchDatasets: (page?: number) => Promise<void>;
  selectDataset: (datasetId: string) => Promise<void>;
  searchDataset: (query?: string, limit?: number, offset?: number) => Promise<void>;
  fetchCollections: (page?: number) => Promise<void>;
}

export const useDatasetStore = create<DatasetState>((set, get) => ({
  // Datasets
  datasets: [],
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
  
  // Selected dataset
  selectedDataset: null,
  datasetRecords: [],
  totalRecords: 0,
  recordFields: [],
  
  // Collections
  collections: [],
  
  // Actions
  fetchDatasets: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.getDatasets(page);
      set({ 
        datasets: result.datasets, 
        totalPages: result.pages,
        currentPage: page,
        isLoading: false 
      });
    } catch (err: unknown) {
      console.error('Failed to fetch datasets:', err);
      set({ 
        error: 'Failed to fetch datasets', 
        isLoading: false 
      });
    }
  },
  
  selectDataset: async (datasetId: string) => {
    set({ isLoading: true, error: null });
    try {
      const metadata = await api.getDatasetMetadata(datasetId);
      if (metadata) {
        set({ selectedDataset: metadata });
        // Load initial data from the dataset
        await get().searchDataset('', 100, 0);
      } else {
        set({ error: 'Failed to fetch dataset metadata', isLoading: false });
      }
    } catch (err: unknown) {
      console.error('Failed to select dataset:', err);
      set({ error: 'Failed to select dataset', isLoading: false });
    }
  },
  
  searchDataset: async (query = '', limit = 100, offset = 0) => {
    const { selectedDataset } = get();
    if (!selectedDataset) return;
    
    set({ isLoading: true, error: null });
    try {
      const datasetId = selectedDataset.datasetId;
      const result = await api.searchDataset(datasetId, query, limit, offset);
      
      if (result && result.success) {
        set({
          datasetRecords: result.result.records,
          totalRecords: result.result.total,
          recordFields: result.result.fields,
          isLoading: false
        });
      } else {
        set({
          error: 'Failed to search dataset',
          isLoading: false
        });
      }
    } catch (err: unknown) {
      console.error('Error searching dataset:', err);
      set({
        error: 'Error searching dataset',
        isLoading: false
      });
    }
  },
  
  fetchCollections: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.getCollections(page);
      set({ 
        collections: result.collections,
        isLoading: false 
      });
    } catch (err: unknown) {
      console.error('Failed to fetch collections:', err);
      set({ 
        error: 'Failed to fetch collections', 
        isLoading: false 
      });
    }
  },
})); 