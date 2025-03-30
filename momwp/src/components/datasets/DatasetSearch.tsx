'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDatasetStore } from '@/lib/store';
import { Dataset } from '@/lib/api/datagovsg';

export const DatasetSearch = () => {
  const { 
    datasets, 
    currentPage, 
    totalPages,
    isLoading, 
    error,
    fetchDatasets,
    selectDataset
  } = useDatasetStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  
  useEffect(() => {
    fetchDatasets(1);
  }, [fetchDatasets]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDatasets(datasets);
    } else {
      const filtered = datasets.filter((dataset: Dataset) => 
        dataset.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDatasets(filtered);
    }
  }, [datasets, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is already handled by the useEffect
  };

  const handleSelectDataset = (datasetId: string) => {
    selectDataset(datasetId);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchDatasets(currentPage + 1);
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search datasets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" variant="default">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDatasets.map((dataset) => (
          <Card 
            key={dataset.datasetId} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleSelectDataset(dataset.datasetId)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium truncate">{dataset.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><span className="font-medium">Format:</span> {dataset.format}</p>
                <p><span className="font-medium">Updated:</span> {new Date(dataset.lastUpdatedAt).toLocaleDateString()}</p>
                {dataset.managedByAgencyName && (
                  <p><span className="font-medium">Agency:</span> {dataset.managedByAgencyName}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {currentPage < totalPages && !isLoading && (
        <div className="flex justify-center mt-4">
          <Button onClick={handleLoadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default DatasetSearch; 