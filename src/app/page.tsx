'use client';

import { useState } from 'react';
import { useDatasetStore } from '@/lib/store';
import DatasetSearch from '@/components/datasets/DatasetSearch';
import DatasetViewer from '@/components/datasets/DatasetViewer';

export default function Home() {
  const { selectedDataset } = useDatasetStore();
  const [showSearch, setShowSearch] = useState(!selectedDataset);

  const handleBack = () => {
    setShowSearch(true);
  };

  // When a dataset is selected, hide the search interface
  if (selectedDataset && showSearch) {
    setShowSearch(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Data.gov.sg Explorer</h1>
          <p className="text-gray-500">
            Search, visualize, and explore datasets from data.gov.sg
          </p>
        </header>

        {showSearch ? (
          <DatasetSearch />
        ) : (
          <DatasetViewer onBack={handleBack} />
        )}
      </div>
    </main>
  );
} 