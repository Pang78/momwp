'use client';

// Add ts-nocheck at the top to skip errors with recharts components
// @ts-nocheck

import React from 'react';
import { useRouter } from 'next/navigation';

// Import Heroicons with proper React 19 compatibility
import {
  ArrowLeftIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { ChartBarSquareIcon } from '@heroicons/react/24/solid';

// Import the UI components
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

// @ts-expect-error - Recharts types are properly available at runtime
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ReferenceArea,
  Brush
} from 'recharts';
// Import these components directly and handle them separately in the component
// TypeScript will ignore missing exports with typeof, but we'll manage their usage
// in the rendered JSX carefully
// const ReferenceArea = 'ReferenceArea' as any;
// const Brush = 'Brush' as any;
// const ScatterChart = 'ScatterChart' as any;
// const Scatter = 'Scatter' as any;

// Import from lib (should be defined in your project)
import { DataColumn } from '@/lib/analysis/dataUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

// Define derived type for options for clarity
type ColumnOption = { name: string; type: DataColumn['type'] };

// Chart types
type ChartType = 'bar' | 'line' | 'scatter' | 'pie';
type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith' | 'endsWith' | 'notEquals';
type SortDirection = 'asc' | 'desc';
type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';

// Define the component props
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
    aggregation?: AggregationType;
    pageSize?: number;
    page?: number;
    _uniqueId?: string; // Unique identifier to prevent key collisions
  };
  onConfigChange?: (config: Record<string, unknown>) => void;
  showControls?: boolean;
  onBack?: () => void;
  title?: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadingStrategy?: 'eager' | 'lazy'; // Default to eager loading
}

// Define the filter interface
interface Filter {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string | number;
  value2?: string | number; // For 'between' operator
  active: boolean; // To toggle filter on/off without removing it
}

// Define sort interface
interface Sort {
  column: string;
  direction: SortDirection;
}

// Chart settings interface
interface ChartSettings {
  showGrid: boolean;
  showLegend: boolean;
  enableZoom: boolean;
  enableAnimation: boolean;
  colorScheme: 'default' | 'pastel' | 'vibrant' | 'monochrome';
}

// Page info for pagination
interface PageInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

// Zoom state for chart zooming
interface ZoomState {
  refAreaLeft: string;
  refAreaRight: string;
  left: string | number;
  right: string | number;
}

// Color schemes for charts
const COLOR_SCHEMES = {
  default: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1'],
  pastel: ['#a7c4f5', '#f5a7a7', '#a7f5c8', '#f5d7a7', '#d7a7f5', '#f5a7d7', '#a7e8f5', '#f5c1a7', '#b9a7f5'],
  vibrant: ['#0355ff', '#ff0303', '#03ff39', '#ffa203', '#8303ff', '#ff03c8', '#03d8ff', '#ff6003', '#5303ff'],
  monochrome: ['#0e0e0e', '#2e2e2e', '#4e4e4e', '#6e6e6e', '#8e8e8e', '#aeaeae', '#cecece', '#eeeeee']
};

// Use for typing the color scheme keys
type ColorScheme = keyof typeof COLOR_SCHEMES;

export default function DataExplorer({
  data,
  columns,
  initialConfig,
  onConfigChange,
  showControls = true,
  onBack,
  title = "Data Explorer",
  description = "Visualize and explore your data interactively",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadingStrategy = 'eager' // Default to eager loading
}: DataExplorerProps) {
  const router = useRouter();
  
  // Chart configuration
  const [chartType, setChartType] = React.useState<ChartType>(initialConfig?.chartType || 'bar');
  const [xAxis, setXAxis] = React.useState<string>(initialConfig?.xAxis || '');
  const [yAxis, setYAxis] = React.useState<string>(initialConfig?.yAxis || '');
  const [filters, setFilters] = React.useState<Filter[]>(initialConfig?.filters?.map(f => ({...f, active: true})) || []);
  const [sort, setSort] = React.useState<Sort | null>(initialConfig?.sort || null);
  const [groupBy, setGroupBy] = React.useState<string>(initialConfig?.groupBy || 'none');
  const [aggregation, setAggregation] = React.useState<AggregationType>(
    initialConfig?.aggregation || 'sum'
  );
  
  // UI/UX state
  const [hasInitializedAxes, setHasInitializedAxes] = React.useState(false);
  const [lastConfigChange, setLastConfigChange] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [chartSettings, setChartSettings] = React.useState<ChartSettings>({
    showGrid: true,
    showLegend: true,
    enableZoom: false,
    enableAnimation: false,
    colorScheme: 'default'
  });
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [activeColorScheme, setActiveColorScheme] = React.useState<ColorScheme>('default');
  
  // Pagination
  const [pageInfo, setPageInfo] = React.useState<PageInfo>({
    currentPage: initialConfig?.page || 1,
    pageSize: initialConfig?.pageSize || 100,
    totalPages: 1,
    totalItems: 0
  });
  
  // Zoom state for charts
  const [zoomState, setZoomState] = React.useState<ZoomState>({
    refAreaLeft: '',
    refAreaRight: '',
    left: 'dataMin',
    right: 'dataMax'
  });
  
  // Refs for optimizations
  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  // Extract column names and types - memoize to avoid recalculations
  const columnOptions = React.useMemo<ColumnOption[]>(() => {
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
      let newXAxis = xAxis;
      let newYAxis = yAxis;
      
      // Find a categorical column for X-axis
      if (!xAxis) {
        const categoricalCol = columnOptions.find((col: ColumnOption) => col.type === 'categorical' || col.type === 'datetime');
        newXAxis = categoricalCol ? categoricalCol.name : (columnOptions[0]?.name || '');
      }

      // Find a numeric column for Y-axis
      if (!yAxis) {
        const numericCol = columnOptions.find((col: ColumnOption) => col.type === 'numeric');
        newYAxis = numericCol ? numericCol.name : (columnOptions[columnOptions.length > 1 ? 1 : 0]?.name || '');
      }

      // Only update state if values have changed
      if (!xAxis && newXAxis) {
        setXAxis(newXAxis);
      }

      if (!yAxis && newYAxis) {
        setYAxis(newYAxis);
      }

      // Mark as initialized
      setHasInitializedAxes(true);
    }
  }, [columnOptions, hasInitializedAxes, xAxis, yAxis]);

  // Optimized search state
  const [isSearchIndexReady, setIsSearchIndexReady] = React.useState<boolean>(false);
  const [isInitializing, setIsInitializing] = React.useState<boolean>(true);
  
  // Initialize search optimization on mount
  React.useEffect(() => {
    if (!data || data.length === 0 || isSearchIndexReady) return;
    
    try {
      // Create optimized lookup maps for faster searching
      const searchableMaps = new Map<string, Map<string, Set<number>>>();
      
      // Pre-process data for faster searching
      columns.forEach(col => {
        const columnMap = new Map<string, Set<number>>();
        searchableMaps.set(col.name, columnMap);
        
        data.forEach((item, index) => {
          const value = item[col.name];
          if (value === null || value === undefined) return;
          
          const stringValue = String(value).toLowerCase();
          // Store full value
          if (!columnMap.has(stringValue)) {
            columnMap.set(stringValue, new Set<number>());
          }
          const valueSet = columnMap.get(stringValue);
          if (valueSet) {
            valueSet.add(index);
          }
          
          // Store word parts for partial matching
          const words = stringValue.split(/\s+/);
          words.forEach(word => {
            if (word.length < 2) return; // Skip very short words
            
            // Store word
            if (!columnMap.has(word)) {
              columnMap.set(word, new Set<number>());
            }
            const wordSet = columnMap.get(word);
            if (wordSet) {
              wordSet.add(index);
            }
            
            // Store word prefixes (for startsWith matches)
            // Only store prefixes of 3+ characters for efficiency
            if (word.length > 3) {
              for (let i = 3; i < word.length; i++) {
                const prefix = word.substring(0, i);
                if (!columnMap.has(prefix)) {
                  columnMap.set(prefix, new Set<number>());
                }
                const prefixSet = columnMap.get(prefix);
                if (prefixSet) {
                  prefixSet.add(index);
                }
              }
            }
          });
        });
      });
      
      // Store the search maps in a ref for searching
      searchMapsRef.current = searchableMaps;
      setIsSearchIndexReady(true);
      setIsInitializing(false);
      setIsLoading(false);
    } catch (err) {
      console.error("Error initializing search optimization:", err);
      setError("Failed to initialize search capabilities");
      setIsInitializing(false);
      setIsLoading(false);
    }
  }, [data, columns, isSearchIndexReady]);
  
  // Reference to hold search maps
  const searchMapsRef = React.useRef<Map<string, Map<string, Set<number>>> | null>(null);
  
  // Apply improved search
  const searchedData = React.useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') return data;
    
    try {
      setError(null);
      const term = searchTerm.toLowerCase().trim();
      
      // Use optimized search if available
      if (isSearchIndexReady && searchMapsRef.current) {
        // Find potential matches across all columns
        const matchedIndices = new Set<number>();
        
        // First look for exact matches
        columns.forEach(col => {
          const columnMap = searchMapsRef.current?.get(col.name);
          if (!columnMap) return;
          
          // Exact match
          if (columnMap.has(term)) {
            const matches = columnMap.get(term);
            if (matches) {
              matches.forEach((idx: number) => matchedIndices.add(idx));
            }
          }
        });
        
        // If no exact matches, try partial matches
        if (matchedIndices.size === 0) {
          columns.forEach(col => {
            const columnMap = searchMapsRef.current?.get(col.name);
            if (!columnMap) return;
            
            // Iterate through all keys in the column map
            columnMap.forEach((indices: Set<number>, key: string) => {
              if (key.includes(term)) {
                indices.forEach((idx: number) => matchedIndices.add(idx));
              }
            });
          });
        }
        
        // Convert matched indices back to data
        if (matchedIndices.size > 0) {
          return Array.from(matchedIndices).map(idx => data[idx]);
        }
      }
      
      // Fallback to standard search
      return data.filter((item: Record<string, unknown>) => {
        return Object.entries(item).some(([, value]) => {
          if (value === null || value === undefined) return false;
          const stringValue = String(value).toLowerCase();
          
          // Try exact match first
          if (stringValue === term) return true;
          
          // Then try contains
          if (stringValue.includes(term)) return true;
          
          // Then try word boundary matches
          const words = stringValue.split(/\s+/);
          return words.some(word => word.startsWith(term));
        });
      });
    } catch (err) {
      setError("Error applying search filter");
      console.error("Search filter error:", err);
      return data;
    }
  }, [data, searchTerm, isSearchIndexReady, columns]);

  // Apply filters with proper typing
  const filteredData = React.useMemo(() => {
    if (!searchedData || searchedData.length === 0) return [];
    
    try {
      if (filters.length === 0 || !filters.some((f: Filter) => f.active)) return searchedData;

      return searchedData.filter((item: Record<string, unknown>) => {
        // Item passes if all active filters match
        return filters.every((filter: Filter) => {
          // Skip inactive filters
          if (!filter.active) return true;
          
          const columnValue = item[filter.column];
          
          // Handle null/undefined values
          if (columnValue === null || columnValue === undefined) {
            return filter.operator === 'equals' && 
                  (filter.value === null || filter.value === '' || filter.value === undefined);
          }
          
          const stringValue = String(columnValue).toLowerCase();
          const filterValue = filter.value !== null && filter.value !== undefined 
            ? String(filter.value).toLowerCase() 
            : '';
          
          switch (filter.operator) {
            case 'equals':
              return stringValue === filterValue;
            case 'notEquals':
              return stringValue !== filterValue;
            case 'contains':
              return stringValue.includes(filterValue);
            case 'startsWith':
              return stringValue.startsWith(filterValue);
            case 'endsWith':
              return stringValue.endsWith(filterValue);
            case 'greaterThan':
              return Number(columnValue) > Number(filter.value);
            case 'lessThan':
              return Number(columnValue) < Number(filter.value);
            case 'between':
              if (filter.value2 === undefined) return true;
              return Number(columnValue) >= Number(filter.value) && 
                     Number(columnValue) <= Number(filter.value2);
            default:
              return true;
          }
        });
      });
    } catch (err) {
      setError("Error applying filters");
      console.error("Filter error:", err);
      return searchedData;
    }
  }, [searchedData, filters]);

  // Apply sorting with proper typing
  const sortedData = React.useMemo(() => {
    if (filteredData.length === 0) return [];
    
    try {
      if (!sort) return filteredData;
      
      const { column, direction } = sort;
      
      return [...filteredData].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const aValue = a[column];
        const bValue = b[column];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return direction === 'asc' ? 1 : -1;
        
        // Compare based on value type
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Default string comparison
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        return direction === 'asc' 
          ? aString.localeCompare(bString) 
          : bString.localeCompare(aString);
      });
    } catch (err) {
      setError("Error sorting data");
      console.error("Sort error:", err);
      return filteredData;
    }
  }, [filteredData, sort]);

  // Toggle sort implementation
  const toggleSort = React.useCallback((columnName: string) => {
    setSort((prevSort: Sort | null) => {
      // If already sorting by this column, toggle direction
      if (prevSort && prevSort.column === columnName) {
        return {
          column: columnName,
          direction: prevSort.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      
      // Otherwise, start with ascending
      return {
        column: columnName,
        direction: 'asc'
      };
    });
  }, []);

  // Apply pagination
  const paginatedData = React.useMemo(() => {
    if (sortedData.length === 0) return [];
    
    try {
      const start = (pageInfo.currentPage - 1) * pageInfo.pageSize;
      const end = Math.min(start + pageInfo.pageSize, sortedData.length);
      
      return sortedData.slice(start, end);
    } catch (err) {
      setError("Error applying pagination");
      console.error("Pagination error:", err);
      return sortedData.slice(0, pageInfo.pageSize);
    }
  }, [sortedData, pageInfo.currentPage, pageInfo.pageSize]);

  // Function to update pagination - not currently used but kept for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updatePagination = React.useCallback((newPageInfo: Partial<PageInfo>) => {
    setPageInfo((prev: PageInfo) => ({
      ...prev,
      ...newPageInfo
    }));
  }, []);

  // Update total pages whenever sorted data changes
  React.useEffect(() => {
    const totalItems = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageInfo.pageSize));
    
    setPageInfo(prev => ({
      ...prev,
      totalItems,
      totalPages,
      // Make sure current page is not beyond total pages
      currentPage: Math.min(prev.currentPage, totalPages)
    }));
  }, [sortedData.length, pageInfo.pageSize]);

  // Handle zoom for charts - not currently used but kept for future functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleZoom = React.useCallback(() => {
    if (!zoomState.refAreaLeft || !zoomState.refAreaRight) return;

    let left = zoomState.refAreaLeft;
    let right = zoomState.refAreaRight;

    // Swap if needed
    if (left > right) {
      [left, right] = [right, left];
    }

    // Update zoom state with new dimensions
    setZoomState({
      ...zoomState,
      left,
      right,
      refAreaLeft: '',
      refAreaRight: ''
    });
  }, [zoomState]);

  // Reset zoom
  const handleResetZoom = React.useCallback(() => {
    setZoomState({
      ...zoomState,
      left: 'dataMin',
      right: 'dataMax',
      refAreaLeft: '',
      refAreaRight: ''
    });
  }, [zoomState]);

  // Helper for formatting tooltip values
  const formatTooltipValue = React.useCallback((value: number | string) => {
    if (typeof value === 'number') {
      // Format based on the magnitude of the number
      if (Math.abs(value) >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
      } else if (Math.abs(value) >= 1000) {
        return `${(value / 1000).toFixed(2)}K`;
      } else if (Number.isInteger(value)) {
        return value.toString();
      } else {
        return value.toFixed(2);
      }
    }
    return String(value);
  }, []);

  // Apply grouping and prepare chart data
  const chartData = React.useMemo(() => {
    if (!xAxis || !yAxis || sortedData.length === 0) return [];
    
    try {
      // For simple charts without grouping
      if (!groupBy || groupBy === 'none') {
        // Use paginated data for better performance
        return paginatedData.map((item: Record<string, unknown>) => ({
          [xAxis]: item[xAxis],
          [yAxis]: item[yAxis] !== undefined && item[yAxis] !== null ? Number(item[yAxis]) : 0,
          _original: item
        }));
      }
      
      // For grouped data - use all data not just paginated for better aggregation
      const grouped: Record<string, Record<string, unknown>[]> = {};
      sortedData.forEach((item: Record<string, unknown>) => {
        const key = String(item[groupBy] || 'Unknown');
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
      });
      
      // Now aggregate each group based on the selected aggregation function
      const result = Object.entries(grouped).map(([key, group]) => {
        const resultItem: Record<string, unknown> = {
          [xAxis]: group[0][xAxis], // Use the x-axis value from the first item
          _original: group[0] // Store original data for reference
        };
        
        // Apply aggregation function to y-axis values within the group
        let value: number;
        
        switch (aggregation) {
          case 'sum':
            value = group.reduce((sum, item) => 
              sum + (Number(item[yAxis]) || 0), 0);
            break;
          case 'avg':
            value = group.reduce((sum, item) => 
              sum + (Number(item[yAxis]) || 0), 0) / group.length;
            break;
          case 'count':
            value = group.length;
            break;
          case 'min':
            value = Math.min(...group.map(item => Number(item[yAxis]) || 0));
            break;
          case 'max':
            value = Math.max(...group.map(item => Number(item[yAxis]) || 0));
            break;
          case 'median': {
            const values = group.map(item => Number(item[yAxis]) || 0).sort((a, b) => a - b);
            const mid = Math.floor(values.length / 2);
            value = values.length % 2 === 0 
              ? (values[mid - 1] + values[mid]) / 2 
              : values[mid];
            break;
          }
          default:
            value = group.reduce((sum, item) => 
              sum + (Number(item[yAxis]) || 0), 0);
        }
        
        // Store the aggregated value with the group key
        resultItem[key] = value;
        
        return resultItem;
      });
      
      return result;
    } catch (err) {
      setError("Error preparing chart data");
      console.error("Chart data preparation error:", err);
      return [];
    }
  }, [sortedData, paginatedData, xAxis, yAxis, groupBy, aggregation]);
  
  // For pie charts, prepare data differently
  const pieData = React.useMemo(() => {
    if (chartType !== 'pie' || !xAxis || !yAxis || sortedData.length === 0) return [];
    
    try {
      // Group by the xAxis and aggregate yAxis values
      const aggregated: Record<string, number> = {};
      
      // Use all data for pie chart, not just paginated data
      sortedData.forEach((item: Record<string, unknown>) => {
        const key = String(item[xAxis] || 'Unknown');
        if (!aggregated[key]) {
          aggregated[key] = 0;
        }
        aggregated[key] += Number(item[yAxis]) || 0;
      });
      
      // Convert to array for the pie chart
      return Object.entries(aggregated)
        .map(([name, value]) => ({
          name,
          value
        }))
        // Limit number of slices for better visualization
        .sort((a, b) => b.value - a.value)
        .slice(0, 15); // Show top 15 values only
    } catch (err) {
      setError("Error preparing pie chart data");
      console.error("Pie chart data error:", err);
      return [];
    }
  }, [chartType, sortedData, xAxis, yAxis]);

  // Get the active color palette - not currently used but kept for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const colorPalette = React.useMemo(() => {
    return COLOR_SCHEMES[activeColorScheme as keyof typeof COLOR_SCHEMES];
  }, [activeColorScheme]);

  // Update color scheme (renamed to avoid duplicate declaration)
  const updateColorScheme = React.useCallback((scheme: ColorScheme) => {
    setActiveColorScheme(scheme);
    setChartSettings((prev: ChartSettings) => ({
      ...prev,
      colorScheme: scheme
    }));
  }, []);

  // Navigation helper
  const navigateToHome = React.useCallback(() => {
    router.push('/');
  }, [router]);

  // Render the chart based on the selected type
  const renderChart = () => {
    if (!xAxis || !yAxis) {
      return (
        <div className="flex items-center justify-center h-[400px] border rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-2">Please select X and Y axes to visualize data</p>
            <Button variant="outline" size="sm" onClick={() => {
              if (columnOptions.length > 0) {
                setXAxis(columnOptions[0].name);
                if (columnOptions.length > 1) {
                  setYAxis(columnOptions[1].name);
                } else {
                  setYAxis(columnOptions[0].name);
                }
              }
            }}>
              Auto-select axes
            </Button>
          </div>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="w-full h-[400px] border rounded-md p-4 bg-white dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="w-full h-[400px] border rounded-md p-4 bg-white dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center h-full gap-2 text-destructive">
            <ExclamationTriangleIcon className="h-8 w-8" />
            <p className="font-medium">Error loading chart</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        </div>
      );
    }
    
    if ((chartData.length === 0 && pieData.length === 0) || 
        (chartType === 'pie' && pieData.length === 0) ||
        (chartType !== 'pie' && chartData.length === 0)) {
      return (
        <div className="flex items-center justify-center h-[400px] border rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-2">No data available with current selections</p>
            <p className="text-xs text-muted-foreground mb-4">Try changing filters or selecting different columns</p>
            {filters.length > 0 && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      );
    }
    
    // Common tooltip style for charts - not currently used but kept for future expansion
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tooltipStyle = {
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      background: '#fff',
      padding: '8px 12px',
      fontSize: '12px',
      color: '#333'
    };

    // For TS/React issues with recharts components, use ts-ignore
    switch (chartType) {
      case 'bar':
        return (
          <div className="w-full h-[400px] border rounded-md p-2 bg-white dark:bg-gray-800 relative" ref={chartContainerRef}>
            {chartSettings.enableZoom && (
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2 z-10"
                onClick={handleResetZoom}
                aria-label="Reset zoom"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </Button>
            )}
            <div className="w-full h-full">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    {chartSettings.showGrid && (
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    )}
                    <XAxis 
                      dataKey={xAxis} 
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickLine={{ stroke: '#ccc' }}
                      axisLine={{ stroke: '#ccc' }}
                    />
                    <YAxis 
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickLine={{ stroke: '#ccc' }}
                      axisLine={{ stroke: '#ccc' }}
                    />
                    <RechartsTooltip
                      formatter={(value, name) => [formatTooltipValue(value), name]}
                      contentStyle={{ 
                        borderRadius: '4px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
                      }}
                    />
                    {chartSettings.showLegend && (
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                    )}
                    <Bar 
                      dataKey={yAxis} 
                      name={yAxis}
                      fill={COLOR_SCHEMES[activeColorScheme][0]} 
                      isAnimationActive={chartSettings.enableAnimation}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        );
      
      case 'line':
        return (
          <div className="w-full h-[400px] border rounded-md p-2 bg-white dark:bg-gray-800 relative" ref={chartContainerRef}>
            {chartSettings.enableZoom && (
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2 z-10"
                onClick={handleResetZoom}
                aria-label="Reset zoom"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </Button>
            )}
            <div className="w-full h-full">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    {chartSettings.showGrid && (
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    )}
                    <XAxis 
                      dataKey={xAxis} 
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickLine={{ stroke: '#ccc' }}
                      axisLine={{ stroke: '#ccc' }}
                    />
                    <YAxis 
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickLine={{ stroke: '#ccc' }}
                      axisLine={{ stroke: '#ccc' }}
                    />
                    <RechartsTooltip
                      formatter={(value, name) => [formatTooltipValue(value), name]}
                      contentStyle={{ 
                        borderRadius: '4px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
                      }}
                    />
                    {chartSettings.showLegend && (
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                    )}
                    <Line 
                      type="monotone"
                      dataKey={yAxis} 
                      name={yAxis}
                      stroke={COLOR_SCHEMES[activeColorScheme][0]} 
                      isAnimationActive={chartSettings.enableAnimation}
                      dot={{ fill: COLOR_SCHEMES[activeColorScheme][0] }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        );
        
      case 'scatter':
        return (
          <div className="w-full h-[400px] border rounded-md p-2 bg-white dark:bg-gray-800 relative" ref={chartContainerRef}>
            {chartSettings.enableZoom && (
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute top-2 right-2 z-10"
                onClick={handleResetZoom}
                aria-label="Reset zoom"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </Button>
            )}
            <div className="w-full h-full">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    {chartSettings.showGrid && (
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    )}
                    <XAxis 
                      dataKey={xAxis} 
                      name={xAxis}
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickLine={{ stroke: '#ccc' }}
                      axisLine={{ stroke: '#ccc' }}
                      type="number"
                    />
                    <YAxis 
                      dataKey={yAxis}
                      name={yAxis}
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickLine={{ stroke: '#ccc' }}
                      axisLine={{ stroke: '#ccc' }}
                      type="number"
                    />
                    <RechartsTooltip
                      formatter={(value, name) => [formatTooltipValue(value), name]}
                      contentStyle={{ 
                        borderRadius: '4px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
                      }}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    {chartSettings.showLegend && (
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                    )}
                    <Scatter 
                      name={`${xAxis} vs ${yAxis}`}
                      data={chartData}
                      fill={COLOR_SCHEMES[activeColorScheme][0]}
                      isAnimationActive={chartSettings.enableAnimation}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        );
        
      case 'pie':
        const colors = COLOR_SCHEMES[activeColorScheme];
        return (
          <div className="w-full h-[400px] border rounded-md p-2 bg-white dark:bg-gray-800 relative" ref={chartContainerRef}>
            <div className="w-full h-full">
              {pieData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={130}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={true}
                      isAnimationActive={chartSettings.enableAnimation}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name, props) => [formatTooltipValue(value), props.payload.name]}
                      contentStyle={{ 
                        borderRadius: '4px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
                      }}
                    />
                    {chartSettings.showLegend && (
                      <Legend 
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{ fontSize: '12px', paddingLeft: '10px' }}
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-[400px] border rounded-md bg-gray-50 dark:bg-gray-800">
            <div className="text-center p-6">
              <p className="text-muted-foreground mb-2">Invalid chart type selected</p>
              <Button variant="outline" size="sm" onClick={() => setChartType('bar')}>
                Reset to Bar Chart
              </Button>
            </div>
          </div>
        );
    }
  };

  // Calculate the number of data points after filtering - not currently used
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dataPointCount = sortedData.length;
  
  // Export data to CSV
  const exportToCSV = React.useCallback(() => {
    if (sortedData.length === 0) return;
    
    try {
      // Prepare CSV header row from column names
      const headers = columns.map(col => col.name).join(',');
      
      // Prepare data rows
      const dataRows = sortedData.slice(0, 10000).map((row: Record<string, unknown>) => {
        return columns.map(col => {
          const value = row[col.name];
          // Handle special characters for CSV
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          return String(value);
        }).join(',');
      });
      
      // Combine header and rows
      const csvContent = [headers, ...dataRows].join('\n');
      
      // Create a blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `data-explorer-export-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Error exporting data");
      console.error("CSV export error:", err);
    }
  }, [sortedData, columns]);
  
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
        aggregation,
        pageSize: pageInfo.pageSize,
        page: pageInfo.currentPage
      });
    }, 150);
    
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
    pageInfo.pageSize,
    pageInfo.currentPage,
    onConfigChange, 
    lastConfigChange
  ]);

  // Helper functions for filter management
  const addFilter = React.useCallback(() => {
    if (columnOptions.length === 0) return;
    
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      column: columnOptions[0].name,
      operator: 'equals',
      value: '',
      active: true
    };
    
    setFilters((prev: Filter[]) => [...prev, newFilter]);
  }, [columnOptions]);

  const removeFilter = React.useCallback((id: string) => {
    setFilters((prevFilters: Filter[]) => prevFilters.filter((filter: Filter) => filter.id !== id));
  }, []);

  const updateFilter = React.useCallback((id: string, changes: Partial<Filter>) => {
    setFilters((prevFilters: Filter[]) => prevFilters.map((filter: Filter) =>
      filter.id === id ? { ...filter, ...changes } : filter
    ));
  }, []);

  const toggleFilterActive = React.useCallback((id: string) => {
    setFilters((prevFilters: Filter[]) => prevFilters.map((filter: Filter) =>
      filter.id === id ? { ...filter, active: !filter.active } : filter
    ));
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters([]);
    setSearchTerm('');
  }, []);

  // Helper function to get operators for filter UI
  const getOperatorOptions = React.useCallback((columnName: string) => {
    const column = columnOptions.find((col: ColumnOption) => col.name === columnName);
    if (!column) return [];
    
    if (column.type === 'numeric') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not Equals' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'lessThan', label: 'Less Than' },
        { value: 'between', label: 'Between' }
      ];
    } else if (column.type === 'categorical') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts With' },
        { value: 'endsWith', label: 'Ends With' }
      ];
    } else if (column.type === 'datetime') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'greaterThan', label: 'After' },
        { value: 'lessThan', label: 'Before' },
        { value: 'between', label: 'Between' }
      ];
    }
    
    // Default for unknown or text types
    return [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Not Equals' },
      { value: 'contains', label: 'Contains' },
      { value: 'startsWith', label: 'Starts With' },
      { value: 'endsWith', label: 'Ends With' }
    ];
  }, [columnOptions]);

  // Handle page navigation
  const handlePageChange = React.useCallback((newPage: number) => {
    if (newPage < 1 || newPage > pageInfo.totalPages) return;
    setPageInfo((prev: PageInfo) => ({
      ...prev,
      currentPage: newPage
    }));
  }, [pageInfo.totalPages]);

  // Handle page size change - not currently used but kept for potential future pagination controls
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePageSizeChange = React.useCallback((newSize: number) => {
    setPageInfo((prev: PageInfo) => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1, // Reset to first page when changing page size
      totalPages: Math.max(1, Math.ceil(sortedData.length / newSize))
    }));
  }, [sortedData.length]);

  return (
    <div className="w-full space-y-4">
      {/* Loading indicator while initializing search index */}
      {isInitializing && (
        <div className="w-full p-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Optimizing search capabilities...</p>
          </div>
        </div>
      )}
      
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* Back button with fallback */}
              {onBack ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onBack} 
                  className="mr-2"
                  aria-label="Go back"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={navigateToHome} 
                  className="mr-2"
                  aria-label="Go home"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
              )}
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                  {description}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Dataset info */}
              <div className="mr-2">
                <div className="text-xs inline-flex items-center border px-2.5 py-0.5 rounded-full">
                  {sortedData.length.toLocaleString()} records
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="whitespace-nowrap justify-center">
                  <div className="text-xs inline-flex items-center border px-2.5 py-0.5 rounded-full">
                    {sortedData.length.toLocaleString()} records total
                  </div>
                </div>
                {sortedData.length > pageInfo.pageSize && (
                  <div className="whitespace-nowrap justify-center">
                    <div className="text-xs inline-flex items-center border px-2.5 py-0.5 rounded-full">
                      Showing page {pageInfo.currentPage} of {pageInfo.totalPages}
                    </div>
                  </div>
                )}
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={exportToCSV}
                      className="flex items-center gap-1"
                    >
                      <ArrowsUpDownIcon className="h-4 w-4" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export data to CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left sidebar with controls - only show if showControls is true */}
            {showControls && (
              <div className="md:col-span-3 space-y-4 overflow-hidden">
                {/* Global search */}
                <div className="relative w-full">
                  <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search all columns..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <ToggleGroup 
                    type="single" 
                    value={chartType} 
                    onValueChange={(value: string) => value && setChartType(value as ChartType)}
                    className="justify-between"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem value="bar" aria-label="Bar Chart">
                            <ChartBarIcon className="h-4 w-4" />
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Bar Chart</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem value="line" aria-label="Line Chart">
                            <ChartBarSquareIcon className="h-4 w-4" />
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Line Chart</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem value="scatter" aria-label="Scatter Chart">
                            <ArrowsPointingOutIcon className="h-4 w-4" />
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Scatter Plot</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem value="pie" aria-label="Pie Chart">
                            <ChartPieIcon className="h-4 w-4" />
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>Pie Chart</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                      {columnOptions.map((col: ColumnOption) => (
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
                      {columnOptions.map((col: ColumnOption) => (
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
                        .filter((col: ColumnOption) => col.type === 'categorical') // Only categorical columns make sense for grouping
                        .map((col: ColumnOption) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {groupBy && groupBy !== 'none' && (
                  <div className="space-y-2">
                    <Label>Aggregation</Label>
                    <Select 
                      value={aggregation} 
                      onValueChange={(val: string) => setAggregation(val as AggregationType)}
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
                        <SelectItem value="median">Median</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Chart appearance settings */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Chart Settings</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <AdjustmentsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Customize the chart appearance</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="show-grid" 
                        checked={chartSettings.showGrid}
                        onCheckedChange={(checked: boolean) => setChartSettings((prev: ChartSettings) => ({...prev, showGrid: checked}))}
                      />
                      <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="show-legend" 
                        checked={chartSettings.showLegend}
                        onCheckedChange={(checked: boolean) => setChartSettings((prev: ChartSettings) => ({...prev, showLegend: checked}))}
                      />
                      <Label htmlFor="show-legend" className="text-sm">Show Legend</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="enable-zoom" 
                        checked={chartSettings.enableZoom}
                        onCheckedChange={(checked: boolean) => setChartSettings((prev: ChartSettings) => ({...prev, enableZoom: checked}))}
                      />
                      <Label htmlFor="enable-zoom" className="text-sm">Enable Zoom</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="enable-animation" 
                        checked={chartSettings.enableAnimation}
                        onCheckedChange={(checked: boolean) => setChartSettings((prev: ChartSettings) => ({...prev, enableAnimation: checked}))}
                      />
                      <Label htmlFor="enable-animation" className="text-sm">Animation</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-sm">Color Scheme</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-between">
                          {activeColorScheme.charAt(0).toUpperCase() + activeColorScheme.slice(1)}
                          <AdjustmentsHorizontalIcon className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Chart Colors</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.keys(COLOR_SCHEMES).map((scheme) => (
                          <DropdownMenuItem 
                            key={scheme}
                            onClick={() => updateColorScheme(scheme as ColorScheme)}
                            className={activeColorScheme === scheme ? "bg-accent" : ""}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex gap-1">
                                {(COLOR_SCHEMES[scheme as ColorScheme]).slice(0, 5).map((color, i) => (
                                  <div 
                                    key={i} 
                                    className="h-3 w-3 rounded-full" 
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <span>{scheme.charAt(0).toUpperCase() + scheme.slice(1)}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Filters</Label>
                    <div className="flex gap-1">
                      {filters.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={resetFilters}
                          className="h-8 px-2 text-xs"
                        >
                          <XMarkIcon className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addFilter}
                        className="h-8 px-2 text-xs"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add Filter
                      </Button>
                    </div>
                  </div>

                  {filters.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center p-2 border rounded-md">
                      No filters applied. Add a filter to narrow down the data.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {filters.map((filter: Filter) => (
                        <div 
                          key={filter.id} 
                          className={`space-y-2 p-2 border rounded-md transition-colors ${
                            filter.active ? 'border-gray-300 dark:border-gray-700' : 'border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`filter-active-${filter.id}`}
                                checked={filter.active}
                                onCheckedChange={() => toggleFilterActive(filter.id)}
                              />
                              <Label htmlFor={`filter-active-${filter.id}`} className="text-xs font-medium">
                                {filter.active ? 'Active' : 'Inactive'}
                              </Label>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFilter(filter.id)}
                              className="h-6 w-6 p-0"
                            >
                              <XMarkIcon className="h-3 w-3" />
                              <span className="sr-only">Remove filter</span>
                            </Button>
                          </div>
                          
                          {/* Column selector */}
                          <Select 
                            value={filter.column} 
                            onValueChange={(value: string) => updateFilter(filter.id, { column: value })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              {columnOptions.map((col: ColumnOption) => (
                                <SelectItem key={col.name} value={col.name} className="text-xs">
                                  {col.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Operator selector */}
                          <Select
                            value={filter.operator}
                            onValueChange={(value: string) => updateFilter(filter.id, { operator: value as FilterOperator })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {getOperatorOptions(filter.column).map((op: { value: string, label: string }) => (
                                <SelectItem key={op.value} value={op.value} className="text-xs">
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Value input */}
                          <Input
                            value={filter.value as string}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter(filter.id, { value: e.target.value })}
                            placeholder="Enter filter value"
                            className="h-8 text-xs"
                          />
                          
                          {/* Second value input for 'between' operator */}
                          {filter.operator === 'between' && (
                            <Input
                              value={filter.value2 as string || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter(filter.id, { value2: e.target.value })}
                              placeholder="Enter second value"
                              className="h-8 text-xs"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main chart area - adjust cols based on whether controls are shown */}
            <div className={`md:col-span-${showControls ? '9' : '12'} w-full`}>
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
                    {isLoading ? (
                      <div className="p-4 space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ) : sortedData.length === 0 ? (
                      <div className="flex items-center justify-center h-[200px]">
                        <p className="text-muted-foreground">No data matching your filters</p>
                      </div>
                    ) : (
                      <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            {columns.map((column) => (
                              <th key={column.name} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort(column.name)}>
                                  <span>{column.name}</span>
                                  {sort?.column === column.name && (
                                    <ArrowsUpDownIcon className="h-3 w-3" />
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                          {paginatedData.map((row: Record<string, unknown>, rowIndex: number) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              {columns.map((column) => (
                                <td key={`${rowIndex}-${column.name}`} className="px-3 py-2 text-xs text-gray-900 dark:text-gray-300">
                                  {formatTooltipValue(row[column.name])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  
                  {/* Pagination controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-muted-foreground">
                      Showing {(pageInfo.currentPage - 1) * pageInfo.pageSize + 1} to {Math.min(pageInfo.currentPage * pageInfo.pageSize, pageInfo.totalItems)} of {pageInfo.totalItems} records
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pageInfo.currentPage - 1)}
                        disabled={pageInfo.currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pageInfo.currentPage + 1)}
                        disabled={pageInfo.currentPage >= pageInfo.totalPages}
                      >
                        Next
                      </Button>
                    </div>
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