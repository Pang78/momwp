// @ts-nocheck
'use client';

import * as React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterChart as ScatterChartIcon,
  Download
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { DataColumn } from '@/lib/analysis/dataUtils';

interface DataExplorerProps {
  data: Record<string, unknown>[];
  columns: DataColumn[];
  initialConfig?: {
    xAxis?: string;
    yAxis?: string;
    chartType?: ChartType;
    filters?: Filter[];
    groupBy?: string;
    sort?: Sort | null;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  };
  onConfigChange?: (config: Record<string, unknown>) => void;
  showControls?: boolean;
}

type ChartType = 'bar' | 'line' | 'scatter' | 'pie';
type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
type SortDirection = 'asc' | 'desc';

interface Filter {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string | number;
  value2?: string | number; // For 'between' operator
}

interface Sort {
  column: string;
  direction: SortDirection;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', 
  '#FFBB28', '#FF8042', '#AF19FF', '#001CCE', '#19A979', '#F15C19'
];

export default function DataExplorer({ 
  data, 
  columns, 
  initialConfig, 
  onConfigChange,
  showControls = true 
}: DataExplorerProps) {
  const [chartType, setChartType] = React.useState<ChartType>(initialConfig?.chartType || 'bar');
  const [xAxis, setXAxis] = React.useState<string>(initialConfig?.xAxis || '');
  const [yAxis, setYAxis] = React.useState<string>(initialConfig?.yAxis || '');
  const [filters, setFilters] = React.useState<Filter[]>(initialConfig?.filters || []);
  const [sort, setSort] = React.useState<Sort | null>(initialConfig?.sort || null);
  const [groupBy, setGroupBy] = React.useState<string>(initialConfig?.groupBy || 'none');
  const [limit, setLimit] = React.useState<number>(100);
  const [aggregation, setAggregation] = React.useState<'sum' | 'avg' | 'count' | 'min' | 'max'>(
    initialConfig?.aggregation || 'sum'
  );
  const [hasInitializedAxes, setHasInitializedAxes] = React.useState(false);
  const [lastConfigChange, setLastConfigChange] = React.useState<number>(0);

  // Extract column names and types
  const columnOptions = React.useMemo(() => {
    return columns.map(col => ({
      name: col.name,
      type: col.type
    }));
  }, [columns]);

  // Initialize axes if not set - only run this once
  React.useEffect(() => {
    // Skip if we've already initialized or if both axes are already set
    if (hasInitializedAxes || (xAxis && yAxis)) return;

    if (columnOptions.length > 0) {
      const shouldUpdateX = !xAxis;
      const shouldUpdateY = !yAxis;
      let newXAxis = xAxis;
      let newYAxis = yAxis;
      
      // Find a categorical column for X-axis
      if (shouldUpdateX) {
        const categoricalCol = columnOptions.find(col => col.type === 'categorical' || col.type === 'datetime');
        newXAxis = categoricalCol ? categoricalCol.name : (columnOptions[0]?.name || '');
      }

      // Find a numeric column for Y-axis
      if (shouldUpdateY) {
        const numericCol = columnOptions.find(col => col.type === 'numeric');
        newYAxis = numericCol ? numericCol.name : (columnOptions[columnOptions.length > 1 ? 1 : 0]?.name || '');
      }

      // Only update state if values have changed
      if (shouldUpdateX && newXAxis) {
        setXAxis(newXAxis);
      }
      
      if (shouldUpdateY && newYAxis) {
        setYAxis(newYAxis);
      }
      
      // Mark as initialized
      setHasInitializedAxes(true);
    }
  }, [columnOptions, hasInitializedAxes, xAxis, yAxis]);

  // Apply filters
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter(item => {
      // Apply all filters
      return filters.every(filter => {
        const columnValue = item[filter.column];
        if (columnValue === undefined || columnValue === null) return false;

        switch (filter.operator) {
          case 'equals':
            return String(columnValue) === String(filter.value);
          case 'contains':
            return String(columnValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(columnValue) > Number(filter.value);
          case 'lessThan':
            return Number(columnValue) < Number(filter.value);
          case 'between':
            return Number(columnValue) >= Number(filter.value) && 
                   Number(columnValue) <= Number(filter.value2);
          default:
            return true;
        }
      });
    });
  }, [data, filters]);

  // Apply sorting
  const sortedData = React.useMemo(() => {
    if (!sort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sort.column];
      const bValue = b[sort.column];

      // Handle different types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Convert to strings for comparison
      const aString = String(aValue || '');
      const bString = String(bValue || '');
      
      return sort.direction === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    });
  }, [filteredData, sort]);

  // Apply grouping and prepare chart data
  const chartData = React.useMemo(() => {
    if (!xAxis || !yAxis || sortedData.length === 0) return [];

    // For simple charts without grouping
    if (!groupBy || groupBy === 'none') {
      // Limit the number of data points
      const limitedData = sortedData.slice(0, limit);
      
      return limitedData.map(item => ({
        [xAxis]: item[xAxis],
        [yAxis]: item[yAxis] !== undefined && item[yAxis] !== null ? Number(item[yAxis]) : 0,
        _original: item // Store original data for tooltips
      }));
    }

    // For grouped data
    const grouped: Record<string, Record<string, unknown>[]> = {};
    
    // Group the data
    sortedData.forEach(item => {
      const key = String(item[groupBy] || 'Unknown');
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    // Aggregate the data for each group
    return Object.entries(grouped).map(([groupKey, groupItems]) => {
      const xValue = groupItems[0][xAxis]; // Take the first item's xAxis value
      
      // Compute aggregated values
      const aggregated: Record<string, number> = { [xAxis]: xValue };
      
      // Add the aggregated value based on selected method
      if (aggregation === 'sum') {
        aggregated[groupKey] = groupItems.reduce((sum, item) => 
          sum + (Number(item[yAxis]) || 0), 0);
      } else if (aggregation === 'avg') {
        aggregated[groupKey] = groupItems.reduce((sum, item) => 
          sum + (Number(item[yAxis]) || 0), 0) / groupItems.length;
      } else if (aggregation === 'count') {
        aggregated[groupKey] = groupItems.length;
      } else if (aggregation === 'min') {
        aggregated[groupKey] = Math.min(...groupItems.map(item => Number(item[yAxis]) || 0));
      } else if (aggregation === 'max') {
        aggregated[groupKey] = Math.max(...groupItems.map(item => Number(item[yAxis]) || 0));
      }
      
      return aggregated;
    });
  }, [sortedData, xAxis, yAxis, groupBy, aggregation, limit]);

  // For pie charts, prepare data differently
  const pieData = React.useMemo(() => {
    if (chartType !== 'pie' || !xAxis || !yAxis || sortedData.length === 0) return [];

    // Group by the xAxis and aggregate yAxis values
    const aggregated: Record<string, number> = {};
    
    sortedData.slice(0, limit).forEach(item => {
      const key = String(item[xAxis] || 'Unknown');
      if (!aggregated[key]) {
        aggregated[key] = 0;
      }
      aggregated[key] += Number(item[yAxis]) || 0;
    });

    // Convert to array for the pie chart
    return Object.entries(aggregated).map(([name, value]) => ({
      name,
      value
    }));
  }, [chartType, sortedData, xAxis, yAxis, limit]);

  // Add a new filter
  const addFilter = () => {
    if (columnOptions.length === 0) return;
    
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      column: columnOptions[0].name,
      operator: 'equals',
      value: ''
    };
    
    setFilters([...filters, newFilter]);
  };

  // Remove a filter
  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  // Update filter
  const updateFilter = (id: string, changes: Partial<Filter>) => {
    setFilters(filters.map(filter => 
      filter.id === id ? { ...filter, ...changes } : filter
    ));
  };

  // Generate appropriate operator options based on column type
  const getOperatorOptions = (columnName: string) => {
    const column = columnOptions.find(col => col.name === columnName);
    if (!column) return [];

    if (column.type === 'numeric') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'lessThan', label: 'Less Than' },
        { value: 'between', label: 'Between' }
      ];
    } else if (column.type === 'categorical') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' }
      ];
    } else if (column.type === 'datetime') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'greaterThan', label: 'After' },
        { value: 'lessThan', label: 'Before' },
        { value: 'between', label: 'Between' }
      ];
    }

    return [
      { value: 'equals', label: 'Equals' },
      { value: 'contains', label: 'Contains' }
    ];
  };

  // Toggle sort on a column
  const toggleSort = (columnName: string) => {
    if (!sort || sort.column !== columnName) {
      setSort({ column: columnName, direction: 'asc' });
    } else {
      setSort(sort.direction === 'asc' 
        ? { column: columnName, direction: 'desc' } 
        : null);
    }
  };

  // Render the chart based on the selected type
  const renderChart = () => {
    if (!xAxis || !yAxis) {
      return (
        <div className="flex items-center justify-center h-64 border rounded-md">
          <p className="text-muted-foreground">Please select X and Y axes to visualize data</p>
        </div>
      );
    }

    if (chartData.length === 0 && pieData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 border rounded-md">
          <p className="text-muted-foreground">No data available with current selections</p>
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxis} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => `${xAxis}: ${label}`}
                />
                <Legend />
                {groupBy && groupBy !== 'none' ? (
                  // If grouped, we need separate bars for each group
                  Object.keys(chartData[0] || {})
                    .filter(key => key !== xAxis && key !== '_original')
                    .map((key, index) => (
                      <Bar 
                        key={`bar-group-${index}-${key.replace(/\W/g, '')}`}
                        dataKey={key} 
                        fill={COLORS[index % COLORS.length]} 
                        name={key}
                      />
                    ))
                ) : (
                  // Simple bar chart
                  <Bar 
                    key={`bar-simple-${yAxis.replace(/\W/g, '')}`}
                    dataKey={yAxis} 
                    fill={COLORS[0]} 
                    name={yAxis} 
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'line':
        return (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxis} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => `${xAxis}: ${label}`}
                />
                <Legend />
                {groupBy && groupBy !== 'none' ? (
                  // If grouped, we need separate lines for each group
                  Object.keys(chartData[0] || {})
                    .filter(key => key !== xAxis && key !== '_original')
                    .map((key, index) => (
                      <Line 
                        key={`line-group-${index}-${key.replace(/\W/g, '')}`}
                        type="monotone" 
                        dataKey={key} 
                        stroke={COLORS[index % COLORS.length]} 
                        name={key}
                        activeDot={{ r: 8 }}
                      />
                    ))
                ) : (
                  // Simple line chart
                  <Line 
                    key={`line-simple-${yAxis.replace(/\W/g, '')}`}
                    type="monotone" 
                    dataKey={yAxis} 
                    stroke={COLORS[0]} 
                    name={yAxis}
                    activeDot={{ r: 8 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'scatter':
        return (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey={xAxis} 
                  name={xAxis} 
                />
                <YAxis 
                  type="number" 
                  dataKey={yAxis} 
                  name={yAxis} 
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                {groupBy && groupBy !== 'none' ? (
                  // If grouped, we need separate scatter plots for each group
                  Object.keys(chartData[0] || {})
                    .filter(key => key !== xAxis && key !== '_original')
                    .map((key, index) => (
                      <Scatter 
                        key={`scatter-group-${index}-${key.replace(/\W/g, '')}`}
                        name={key} 
                        data={chartData.filter(item => item[key] !== undefined)} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))
                ) : (
                  // Simple scatter plot
                  <Scatter 
                    key={`scatter-simple-${yAxis.replace(/\W/g, '')}`}
                    name={yAxis} 
                    data={chartData} 
                    fill={COLORS[0]} 
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'pie':
        return (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Calculate the number of data points after filtering
  const dataPointCount = sortedData.length;
  
  // Export data to CSV
  const exportToCSV = () => {
    // Create CSV string
    const headers = Object.keys(sortedData[0] || {}).join(',');
    const rows = sortedData.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'exported_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Call onConfigChange when configuration changes, but throttle updates
  React.useEffect(() => {
    if (!onConfigChange || !xAxis || !yAxis) return;
    
    // Skip updates if it's been less than 300ms since the last update
    const now = Date.now();
    if (now - lastConfigChange < 300) {
      return;
    }
    
    setLastConfigChange(now);
    
    // Use a timeout to debounce frequent updates
    const timeoutId = setTimeout(() => {
      onConfigChange({
        chartType,
        xAxis,
        yAxis,
        filters,
        sort,
        groupBy,
        aggregation
      });
    }, 100);
    
    // Clean up the timeout if the effect runs again before the timeout fires
    return () => clearTimeout(timeoutId);
  }, [
    chartType, 
    xAxis, 
    yAxis, 
    filters, 
    sort, 
    groupBy, 
    aggregation, 
    onConfigChange, 
    lastConfigChange
  ]);

  return (
    <div className="w-full space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Data Explorer</CardTitle>
              <CardDescription>
                Visualize and explore your data interactively
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCSV}
              disabled={sortedData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left sidebar with controls - only show if showControls is true */}
            {showControls && (
              <div className="md:col-span-3 space-y-4 overflow-hidden">
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <ToggleGroup type="single" value={chartType} onValueChange={(value) => value && setChartType(value as ChartType)}>
                    <ToggleGroupItem value="bar" aria-label="Bar Chart">
                      <BarChart2 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="line" aria-label="Line Chart">
                      <LineChartIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="scatter" aria-label="Scatter Chart">
                      <ScatterChartIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="pie" aria-label="Pie Chart">
                      <PieChartIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>X Axis</Label>
                  <Select value={xAxis} onValueChange={setXAxis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select X axis" />
                    </SelectTrigger>
                    <SelectContent>
                      {columnOptions.map(col => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name} ({col.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Y Axis</Label>
                  <Select value={yAxis} onValueChange={setYAxis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Y axis" />
                    </SelectTrigger>
                    <SelectContent>
                      {columnOptions.map(col => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name} ({col.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Group By</Label>
                  <Select 
                    value={groupBy} 
                    onValueChange={setGroupBy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No grouping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No grouping</SelectItem>
                      {columnOptions
                        .filter(col => col.type === 'categorical') // Only categorical columns make sense for grouping
                        .map(col => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {groupBy && (
                  <div className="space-y-2">
                    <Label>Aggregation</Label>
                    <Select 
                      value={aggregation} 
                      onValueChange={(val) => setAggregation(val as 'sum' | 'avg' | 'count' | 'min' | 'max')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="avg">Average</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="min">Minimum</SelectItem>
                        <SelectItem value="max">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Filters</Label>
                    <Button variant="outline" size="sm" onClick={addFilter}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>

                  {filters.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">
                      No filters applied
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {filters.map(filter => (
                        <div key={filter.id} className="space-y-2 p-2 border rounded-md">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs">Column</Label>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFilter(filter.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <Select 
                            value={filter.column}
                            onValueChange={(value) => updateFilter(filter.id, { column: value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {columnOptions.map(col => (
                                <SelectItem key={col.name} value={col.name}>
                                  {col.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Label className="text-xs">Operator</Label>
                          <Select 
                            value={filter.operator}
                            onValueChange={(value) => updateFilter(filter.id, { 
                              operator: value as FilterOperator 
                            })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getOperatorOptions(filter.column).map(op => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Label className="text-xs">Value</Label>
                          <Input 
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, { 
                              value: e.target.value 
                            })}
                            placeholder="Value"
                            className="h-8"
                          />

                          {filter.operator === 'between' && (
                            <>
                              <Label className="text-xs">To</Label>
                              <Input 
                                value={filter.value2 || ''}
                                onChange={(e) => updateFilter(filter.id, { 
                                  value2: e.target.value 
                                })}
                                placeholder="Upper bound"
                                className="h-8"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label>Row Limit</Label>
                    <Input 
                      type="number" 
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      min={1}
                      max={10000}
                    />
                  </div>

                  <div className="pt-2">
                    <Badge variant="outline" className="whitespace-nowrap">
                      {dataPointCount} data points
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Main chart area - adjust cols based on whether controls are shown */}
            <div className={`md:col-span-${showControls ? '9' : '12'} w-full overflow-hidden`}>
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="data">Data Table</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chart" className="w-full">
                  <div className="w-full">
                    {renderChart()}
                  </div>
                </TabsContent>
                
                <TabsContent value="data" className="w-full">
                  <div className="border rounded-md overflow-auto max-h-[400px] w-full">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {columnOptions.map(col => (
                            <th key={col.name} className="p-2 text-left font-medium">
                              <div 
                                className="flex items-center gap-1 cursor-pointer" 
                                onClick={() => toggleSort(col.name)}
                              >
                                {col.name}
                                {sort?.column === col.name && (
                                  sort.direction === 'asc' 
                                    ? <ChevronUp className="h-3 w-3" /> 
                                    : <ChevronDown className="h-3 w-3" />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.slice(0, limit).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                            {columnOptions.map(col => (
                              <td key={col.name} className="p-2 border-t">
                                {row[col.name] !== undefined ? String(row[col.name]) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 