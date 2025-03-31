// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Maximize2, 
  Minimize2, 
  X, 
  Copy, 
  Grid2X2, 
  Grid3X3, 
  LayoutGrid, 
  Plus 
} from 'lucide-react';
import DataExplorer from './DataExplorer';
import { DataColumn } from '@/lib/analysis/dataUtils';

// Visualization view configuration
interface ViewConfig {
  id: string;
  xAxis: string;
  yAxis: string;
  chartType: 'bar' | 'line' | 'scatter' | 'pie';
  filters: Record<string, unknown>[];
  groupBy?: string;
  sort?: { column: string; direction: 'asc' | 'desc' } | null;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  title: string;
}

interface MultiViewProps {
  data: Record<string, unknown>[];
  columns: DataColumn[];
}

export default function MultiView({ data, columns }: MultiViewProps) {
  // Layout options: 1x1, 2x1, 2x2, 3x2, etc.
  const [layout, setLayout] = useState<'1x1' | '2x1' | '2x2' | '3x2'>('2x2');
  // Expanded view (full screen for a single view)
  const [expandedView, setExpandedView] = useState<string | null>(null);
  // Array of view configurations
  const [views, setViews] = useState<ViewConfig[]>([
    { 
      id: 'view-1', 
      xAxis: columns.find(c => c.type === 'categorical' || c.type === 'datetime')?.name || columns[0]?.name || '', 
      yAxis: columns.find(c => c.type === 'numeric')?.name || columns[0]?.name || '', 
      chartType: 'bar',
      filters: [],
      groupBy: 'none',
      title: 'Chart 1'
    },
    { 
      id: 'view-2', 
      xAxis: columns.find(c => c.type === 'categorical' || c.type === 'datetime')?.name || columns[0]?.name || '', 
      yAxis: columns.find(c => c.type === 'numeric')?.name || columns[0]?.name || '', 
      chartType: 'line',
      filters: [],
      groupBy: 'none',
      title: 'Chart 2'
    },
    { 
      id: 'view-3', 
      xAxis: columns.find(c => c.type === 'categorical' || c.type === 'datetime')?.name || columns[0]?.name || '', 
      yAxis: columns.find(c => c.type === 'numeric')?.name || columns[0]?.name || '', 
      chartType: 'pie',
      filters: [],
      groupBy: 'none',
      title: 'Chart 3'
    },
    { 
      id: 'view-4', 
      xAxis: columns.find(c => c.type === 'categorical' || c.type === 'datetime')?.name || columns[0]?.name || '', 
      yAxis: columns.find(c => c.type === 'numeric')?.name || columns[0]?.name || '', 
      chartType: 'scatter',
      filters: [],
      groupBy: 'none',
      title: 'Chart 4'
    }
  ]);

  // Add a new view
  const addView = () => {
    const newView: ViewConfig = {
      id: `view-${Date.now()}`,
      xAxis: columns.find(c => c.type === 'categorical' || c.type === 'datetime')?.name || columns[0]?.name || '',
      yAxis: columns.find(c => c.type === 'numeric')?.name || columns[0]?.name || '',
      chartType: 'bar',
      filters: [],
      groupBy: 'none',
      title: `Chart ${views.length + 1}`
    };
    
    setViews([...views, newView]);
  };

  // Remove a view
  const removeView = (id: string) => {
    setViews(views.filter(view => view.id !== id));
  };

  // Update a view configuration
  const updateView = (id: string, updates: Partial<ViewConfig>) => {
    setViews(views.map(view => 
      view.id === id ? { ...view, ...updates } : view
    ));
  };

  // Duplicate a view
  const duplicateView = (id: string) => {
    const viewToDuplicate = views.find(view => view.id === id);
    if (!viewToDuplicate) return;
    
    const newView: ViewConfig = {
      ...viewToDuplicate,
      id: `view-${Date.now()}`,
      title: `${viewToDuplicate.title} (Copy)`
    };
    
    setViews([...views, newView]);
  };

  // Get the grid class based on layout
  const getGridClass = () => {
    switch (layout) {
      case '1x1': return 'grid-cols-1';
      case '2x1': return 'grid-cols-2';
      case '2x2': return 'grid-cols-2';
      case '3x2': return 'grid-cols-3';
      default: return 'grid-cols-2';
    }
  };

  // Get views to display based on layout
  const getVisibleViewsCount = () => {
    switch (layout) {
      case '1x1': return 1;
      case '2x1': return 2;
      case '2x2': return 4;
      case '3x2': return 6;
      default: return 4;
    }
  };

  // Get visible views with stable IDs
  const visibleViews = views.slice(0, getVisibleViewsCount()).map(view => ({
    ...view,
    // Generate stable suffixes for chart elements
    chartId: `view-${view.id}-${view.chartType}`
  }));

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-6 pb-2 border-b">
        <div className="font-medium text-lg">Multi-View Data Explorer</div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLayout('1x1')}
            className={layout === '1x1' ? 'bg-primary text-primary-foreground' : ''}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Single</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLayout('2x1')}
            className={layout === '2x1' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Grid2X2 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">2 Charts</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLayout('2x2')}
            className={layout === '2x2' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">4 Charts</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addView}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add View
          </Button>
        </div>
      </div>

      {expandedView ? (
        // Expanded single view
        <Card className="w-full overflow-hidden shadow-sm border border-gray-200">
          <CardHeader className="pb-2 bg-gray-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {views.find(v => v.id === expandedView)?.title || 'Chart'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setExpandedView(null)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-4">
            <div className="h-[calc(100vh-200px)]">
              {views.find(v => v.id === expandedView) && (
                <DataExplorer 
                  data={data}
                  columns={columns}
                  initialConfig={{
                    ...views.find(v => v.id === expandedView) as ViewConfig,
                    // Add unique identifier to config to avoid key collisions
                    _uniqueId: `expanded-${expandedView}`
                  }}
                  onConfigChange={(config) => {
                    updateView(expandedView, config);
                  }}
                  showControls={true}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Grid view with multiple charts
        <div className={`grid ${getGridClass()} gap-6`}>
          {visibleViews.map((view) => (
            <Card key={view.id} className="w-full overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
              <CardHeader className="pb-2 bg-gray-50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{view.title}</CardTitle>
                  <div className="flex">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => duplicateView(view.id)}
                      title="Duplicate"
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setExpandedView(view.id)}
                      title="Expand"
                      className="h-8 w-8"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeView(view.id)}
                      title="Remove"
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                <div className="h-80 w-full">
                  <DataExplorer 
                    data={data}
                    columns={columns}
                    initialConfig={{
                      ...view,
                      // Add unique identifier to config to avoid key collisions
                      _uniqueId: `grid-${view.id}-${view.chartId}`
                    }}
                    onConfigChange={(config) => {
                      updateView(view.id, config);
                    }}
                    showControls={false}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 