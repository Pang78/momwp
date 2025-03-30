import axios from 'axios';

const BASE_URL = 'https://api-production.data.gov.sg/v2/public/api';
const LEGACY_URL = 'https://data.gov.sg/api/action';

// Types
export interface Dataset {
  datasetId: string;
  name: string;
  status?: string;
  format: string;
  lastUpdatedAt: string;
  managedByAgencyName?: string;
  coverageStart?: string;
  coverageEnd?: string;
  createdAt: string;
}

export interface Collection {
  collectionId: string;
  name: string;
  description: string;
  lastUpdatedAt: string;
  coverageStart?: string;
  coverageEnd?: string;
  frequency?: string;
  sources?: string[];
  managedByAgencyName?: string;
  childDatasets?: string[];
  createdAt: string;
}

export interface DatasetMetadata {
  datasetId: string;
  name: string;
  format: string;
  lastUpdatedAt: string;
  managedBy: string;
  coverageStart?: string;
  coverageEnd?: string;
  createdAt: string;
  columnMetadata?: {
    order: string[];
    map: Record<string, string>;
    metaMapping: Record<string, {
      name: string;
      columnTitle: string;
      dataType: number;
      index: string;
    }>;
  };
}

export interface DataRecord {
  [key: string]: unknown;
}

export interface DatastoreSearchResponse {
  success: boolean;
  result: {
    records: DataRecord[];
    total: number;
    fields: Array<{
      id: string;
      type: string;
    }>;
  };
}

interface ApiResponse<T> {
  code: number;
  data: T;
  errorMsg?: string;
}

// API Functions
export const api = {
  // Get all datasets with optional pagination
  async getDatasets(page = 1): Promise<{ datasets: Dataset[], pages: number }> {
    try {
      const response = await axios.get<ApiResponse<{ datasets: Dataset[], pages: number }>>(`${BASE_URL}/datasets`, {
        params: { page }
      });
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error fetching datasets:', error);
      return { datasets: [], pages: 0 };
    }
  },

  // Get dataset metadata
  async getDatasetMetadata(datasetId: string): Promise<DatasetMetadata | null> {
    try {
      const response = await axios.get<ApiResponse<DatasetMetadata>>(`${BASE_URL}/datasets/${datasetId}/metadata`);
      return response.data.data;
    } catch (error: unknown) {
      console.error(`Error fetching metadata for dataset ${datasetId}:`, error);
      return null;
    }
  },

  // Search within a dataset (datastore search)
  async searchDataset(
    datasetId: string, 
    query: string = '',
    limit: number = 100,
    offset: number = 0
  ): Promise<DatastoreSearchResponse | null> {
    try {
      const response = await axios.get<DatastoreSearchResponse>(`${LEGACY_URL}/datastore_search`, {
        params: {
          resource_id: datasetId,
          q: query || undefined,
          limit,
          offset
        }
      });
      return response.data;
    } catch (error: unknown) {
      console.error(`Error searching dataset ${datasetId}:`, error);
      return null;
    }
  },

  // Get all collections with optional pagination
  async getCollections(page = 1): Promise<{ collections: Collection[], pages: number }> {
    try {
      const response = await axios.get<ApiResponse<{ collections: Collection[], pages: number }>>(`${BASE_URL}/collections`, {
        params: { page }
      });
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error fetching collections:', error);
      return { collections: [], pages: 0 };
    }
  },

  // Get collection metadata with optional dataset metadata
  async getCollectionMetadata(
    collectionId: string, 
    withDatasetMetadata = true
  ): Promise<{ collectionMetadata: Collection, datasetMetadata: DatasetMetadata[] } | null> {
    try {
      const response = await axios.get<ApiResponse<{ collectionMetadata: Collection, datasetMetadata: DatasetMetadata[] }>>(
        `${BASE_URL}/collections/${collectionId}/metadata`,
        { params: { withDatasetMetadata } }
      );
      return response.data.data;
    } catch (error: unknown) {
      console.error(`Error fetching metadata for collection ${collectionId}:`, error);
      return null;
    }
  }
};

export default api; 