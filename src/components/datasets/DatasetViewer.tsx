'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { useDatasetStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable from '@/components/visualizations/DataTable';
import DataChart from '@/components/visualizations/DataChart';
import { DataRecord } from '@/lib/api/datagovsg';

export const DatasetViewer = ({ onBack }: { onBack: () => void }) => {
  const { 
    selectedDataset, 
    datasetRecords, 
    recordFields,
    totalRecords,
    isLoading,
    error,
    searchDataset
  } = useDatasetStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('table');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchDataset(searchTerm);
  };
  
  const downloadCSV = () => {
    if (!datasetRecords.length || !recordFields.length) return;
    
    // Create CSV content
    const headers = recordFields.map((field: { id: string; type: string }) => field.id).join(',');
    const rows = datasetRecords.map((record: DataRecord) => 
      recordFields.map((field: { id: string; type: string }) => `"${String(record[field.id] || '')}"`).join(',')
    );
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;
    
    // Download file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedDataset?.name || 'dataset'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!selectedDataset) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">No dataset selected</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">{selectedDataset.name}</h2>
        </div>
        
        <Button variant="outline" onClick={downloadCSV}>
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p><span className="font-medium">Format:</span> {selectedDataset.format}</p>
        <p><span className="font-medium">Updated:</span> {new Date(selectedDataset.lastUpdatedAt).toLocaleDateString()}</p>
        <p><span className="font-medium">Managed by:</span> {selectedDataset.managedBy}</p>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search in dataset..."
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
      
      <div className="mt-4">
        <Tabs defaultValue="table" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-4">
            <DataTable 
              data={datasetRecords} 
              columns={recordFields} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="chart" className="mt-4">
            <DataChart 
              data={datasetRecords} 
              fields={recordFields} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      <div className="text-sm text-muted-foreground text-right">
        Showing {datasetRecords.length} of {totalRecords} records
      </div>
    </div>
  );
};

export default DatasetViewer; 