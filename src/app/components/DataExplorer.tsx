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
  ArrowsPointingOutIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  SparklesIcon
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

// Add the chart template type
type ChartTemplate = 'basic' | 'stacked' | 'percentage' | 'comparison';

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

// Add the GuidePanel component after the imports and before the DataExplorer component
interface GuidePanelProps {
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
  data: any[];
  error: string | null;
  onApplySuggestion: (suggestion: { xAxis?: string; yAxis?: string; chartType?: ChartType }) => void;
  columnOptions: ColumnOption[];
}

const GuidePanel: React.FC<GuidePanelProps> = ({ 
  chartType, 
  xAxis, 
  yAxis, 
  data, 
  error, 
  onApplySuggestion,
  columnOptions
}) => {
  // Check common issues
  const hasNumericXAxis = React.useMemo(() => {
    const col = columnOptions.find(c => c.name === xAxis);
    return col?.type === 'numeric';
  }, [xAxis, columnOptions]);

  const hasNumericYAxis = React.useMemo(() => {
    const col = columnOptions.find(c => c.name === yAxis);
    return col?.type === 'numeric';
  }, [yAxis, columnOptions]);

  const hasCategoricalXAxis = React.useMemo(() => {
    const col = columnOptions.find(c => c.name === xAxis);
    return col?.type === 'categorical';
  }, [xAxis, columnOptions]);

  const hasManyCategories = React.useMemo(() => {
    if (!data.length) return false;
    const uniqueValues = new Set(data.map(item => item[xAxis]));
    return uniqueValues.size > 20;
  }, [data, xAxis]);

  // Generate suggestions
  const suggestions = React.useMemo(() => {
    const result = [];

    // If there's an error, add a suggestion
    if (error) {
      result.push({
        title: 'Error Detected',
        description: error,
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
        action: null
      });
    }

    // Chart type suggestions
    if (chartType === 'pie' && data.length > 15) {
      result.push({
        title: 'Too Many Categories',
        description: 'Pie charts work best with fewer than 15 categories. Consider switching to a bar chart.',
        icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
        action: () => onApplySuggestion({ chartType: 'bar' })
      });
    }

    if (chartType === 'scatter' && (!hasNumericXAxis || !hasNumericYAxis)) {
      result.push({
        title: 'Scatter Plot Needs Numeric Axes',
        description: 'Scatter plots require numeric values for both X and Y axes.',
        icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
        action: () => {
          const numericColumns = columnOptions.filter(c => c.type === 'numeric');
          if (numericColumns.length >= 2) {
            onApplySuggestion({ 
              xAxis: numericColumns[0].name, 
              yAxis: numericColumns[1].name 
            });
          } else if (numericColumns.length === 1) {
            onApplySuggestion({ 
              chartType: 'bar',
              xAxis: columnOptions[0].name !== numericColumns[0].name ? columnOptions[0].name : (columnOptions[1]?.name || columnOptions[0].name),
              yAxis: numericColumns[0].name
            });
          }
        }
      });
    }

    if (hasManyCategories && (chartType === 'bar' || chartType === 'line')) {
      result.push({
        title: 'Many Categories Detected',
        description: 'Your chart has many categories, which may make it hard to read. Consider filtering or aggregating data.',
        icon: <SparklesIcon className="h-5 w-5 text-yellow-500" />,
        action: null
      });
    }

    if (!hasNumericYAxis && chartType !== 'pie') {
      const numericColumn = columnOptions.find(c => c.type === 'numeric');
      if (numericColumn) {
        result.push({
          title: 'Non-Numeric Y-Axis',
          description: `Charts typically need numeric data for the Y-axis. Switch to ${numericColumn.name}?`,
          icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
          action: () => onApplySuggestion({ yAxis: numericColumn.name })
        });
      }
    }

    if (chartType === 'line' && !hasCategoricalXAxis && !hasNumericXAxis) {
      const categoricalColumn = columnOptions.find(c => c.type === 'categorical');
      if (categoricalColumn) {
        result.push({
          title: 'Line Chart X-Axis',
          description: 'Line charts work best with categorical or datetime X-axis values that show progression.',
          icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
          action: () => onApplySuggestion({ xAxis: categoricalColumn.name })
        });
      }
    }

    return result;
  }, [chartType, xAxis, yAxis, data, error, columnOptions, hasNumericXAxis, hasNumericYAxis, hasCategoricalXAxis, hasManyCategories, onApplySuggestion]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md p-4 space-y-3 bg-blue-50 dark:bg-blue-900/20">
      <h4 className="font-medium flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-blue-500" />
        Chart Suggestions
      </h4>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start gap-2">
            {suggestion.icon}
            <div className="flex-1">
              <p className="text-sm font-medium">{suggestion.title}</p>
              <p className="text-xs text-muted-foreground">{suggestion.description}</p>
            </div>
            {suggestion.action && (
              <button 
                onClick={suggestion.action}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
              >
                Apply
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

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
  
  // New validation state
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  const [showGuidePanel, setShowGuidePanel] = React.useState<boolean>(true);
  
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
        
        const numericValues = group
          .map(item => Number(item[yAxis]))
          .filter(val => !isNaN(val));
          
        if (numericValues.length === 0) {
          value = 0;
        } else {
          switch (aggregation) {
            case 'sum':
              value = numericValues.reduce((sum, val) => sum + val, 0);
              break;
            case 'avg':
              value = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
              break;
            case 'count':
              value = numericValues.length;
              break;
            case 'min':
              value = Math.min(...numericValues);
              break;
            case 'max':
              value = Math.max(...numericValues);
              break;
            case 'median': {
              const sorted = [...numericValues].sort((a, b) => a - b);
              const mid = Math.floor(sorted.length / 2);
              value = sorted.length % 2 === 0 
                ? (sorted[mid - 1] + sorted[mid]) / 2 
                : sorted[mid];
              break;
            }
            default:
              value = numericValues.reduce((sum, val) => sum + val, 0);
          }
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

  // Add chart template state
  const [chartTemplate, setChartTemplate] = React.useState<ChartTemplate>('basic');
  
  // Toggle guide panel
  const toggleGuidePanel = React.useCallback(() => {
    setShowGuidePanel(prev => !prev);
  }, []);

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
    
    try {
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
                        tickFormatter={(value) => typeof value === 'string' && value.length > 15 ? `${value.substring(0, 15)}...` : value}
                      />
                      <YAxis 
                        tick={{ fill: '#666', fontSize: 12 }}
                        tickLine={{ stroke: '#ccc' }}
                        axisLine={{ stroke: '#ccc' }}
                        tickFormatter={formatTooltipValue}
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
                      {/* Support different bar chart templates */}
                      {groupBy && groupBy !== 'none' ? (
                        // Stacked bars for grouped data
                        Object.keys(chartData[0] || {})
                          .filter(key => key !== xAxis && key !== '_original')
                          .map((key, index) => (
                            <Bar 
                              key={`bar-${key}`}
                              dataKey={key} 
                              name={key}
                              stackId="a"
                              fill={COLOR_SCHEMES[activeColorScheme][index % COLOR_SCHEMES[activeColorScheme].length]} 
                              isAnimationActive={chartSettings.enableAnimation}
                            />
                          ))
                      ) : (
                        // Single bar for ungrouped data
                        <Bar 
                          dataKey={yAxis} 
                          name={yAxis}
                          fill={COLOR_SCHEMES[activeColorScheme][0]} 
                          isAnimationActive={chartSettings.enableAnimation}
                        />
                      )}
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
    } catch (err) {
      console.error('Chart rendering error:', err);
      
      // Handle the specific "child cannot have more than 2 values" error
      if (err instanceof Error && err.message.includes('children with the same key')) {
        setError("Chart rendering error: Duplicate keys detected in data. Try a different aggregation or grouping.");
      } else if (err instanceof Error && err.message.includes('children')) {
        setError("Chart rendering error: Issue with chart components. Try a different chart type or data selection.");
      } else {
        setError(`Chart rendering error: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      return (
        <div className="w-full h-[400px] border rounded-md p-4 bg-white dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center h-full gap-2 text-destructive">
            <ExclamationTriangleIcon className="h-8 w-8" />
            <p className="font-medium">Chart Rendering Failed</p>
            <p className="text-sm text-muted-foreground">{error || "An unknown error occurred while rendering the chart"}</p>
            <div className="mt-3 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => {
                  setChartType('bar');
                  setError(null);
                }}
              >
                Try Bar Chart
              </Button>
            </div>
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

  // Validate chart data and configuration
  const validateChartData = React.useCallback(() => {
    const errors: string[] = [];
    
    if (!xAxis || !yAxis) {
      return errors; // Skip validation if axes aren't selected yet
    }
    
    // Check if data is available
    if (chartType === 'pie' ? pieData.length === 0 : chartData.length === 0) {
      errors.push("No data available for the selected axes and filters");
      return errors;
    }
    
    // Validate based on chart type
    const xAxisColumn = columns.find(col => col.name === xAxis);
    const yAxisColumn = columns.find(col => col.name === yAxis);
    
    if (!xAxisColumn || !yAxisColumn) {
      errors.push("Selected axis columns not found in dataset");
      return errors;
    }
    
    switch (chartType) {
      case 'scatter':
        if (xAxisColumn.type !== 'numeric') {
          errors.push("Scatter plots require numeric X-axis data");
        }
        if (yAxisColumn.type !== 'numeric') {
          errors.push("Scatter plots require numeric Y-axis data");
        }
        break;
        
      case 'pie':
        if (pieData.length > 15) {
          errors.push("Pie chart has too many segments (>15), which may make it hard to read");
        }
        break;
        
      case 'line':
        // For line charts, we ideally want a sequential X-axis
        if (xAxisColumn.type !== 'datetime' && xAxisColumn.type !== 'numeric' && xAxisColumn.type !== 'categorical') {
          errors.push("Line charts work best with datetime or ordered categorical X-axis");
        }
        if (yAxisColumn.type !== 'numeric') {
          errors.push("Line charts require numeric Y-axis data");
        }
        break;
        
      case 'bar':
        if (yAxisColumn.type !== 'numeric') {
          errors.push("Bar charts typically need numeric Y-axis data");
        }
        
        // Check if there are too many categories
        if (chartData.length > 50) {
          errors.push("Bar chart has too many categories (>50), which may impact readability");
        }
        break;
    }
    
    return errors;
  }, [chartType, xAxis, yAxis, columns, chartData, pieData]);
  
  // Apply a chart suggestion
  const applyChartSuggestion = React.useCallback((suggestion: { xAxis?: string; yAxis?: string; chartType?: ChartType }) => {
    if (suggestion.xAxis) {
      setXAxis(suggestion.xAxis);
    }
    
    if (suggestion.yAxis) {
      setYAxis(suggestion.yAxis);
    }
    
    if (suggestion.chartType) {
      setChartType(suggestion.chartType);
    }
    
    // Clear errors after applying suggestion
    setError(null);
  }, []);
  
  // Update validation whenever relevant dependencies change
  React.useEffect(() => {
    if (xAxis && yAxis) {
      const errors = validateChartData();
      setValidationErrors(errors);
    }
  }, [xAxis, yAxis, chartType, validateChartData, chartData, pieData]);

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
              {/* Add guide panel toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleGuidePanel}
                      className="flex items-center gap-1"
                    >
                      {showGuidePanel ? (
                        <>
                          <XMarkIcon className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:inline-block">Hide Guide</span>
                        </>
                      ) : (
                        <>
                          <QuestionMarkCircleIcon className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:inline-block">Show Guide</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showGuidePanel ? 'Hide Chart Guide' : 'Show Chart Guide'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
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

                <div className="space-y-2">
                  <Label>Chart Template</Label>
                  <Select 
                    value={chartTemplate} 
                    onValueChange={(value: string) => setChartTemplate(value as ChartTemplate)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      {chartType !== 'pie' && (
                        <>
                          <SelectItem value="stacked">Stacked</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="comparison">Comparison</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
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

                {/* Enhanced aggregation section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Aggregation</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5">
                            <InformationCircleIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="w-80">
                          <p className="text-xs mb-2">Aggregation methods determine how data is combined:</p>
                          <ul className="text-xs list-disc pl-4 space-y-1">
                            <li><span className="font-medium">Sum:</span> Adds all values together</li>
                            <li><span className="font-medium">Average:</span> Calculates the mean of all values</li>
                            <li><span className="font-medium">Count:</span> Returns the number of data points</li>
                            <li><span className="font-medium">Minimum:</span> Returns the smallest value</li>
                            <li><span className="font-medium">Maximum:</span> Returns the largest value</li>
                            <li><span className="font-medium">Median:</span> Returns the middle value</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select 
                    value={aggregation} 
                    onValueChange={(val: string) => setAggregation(val as AggregationType)}
                    disabled={!groupBy || groupBy === 'none'}
                  >
                    <SelectTrigger className={!groupBy || groupBy === 'none' ? 'opacity-50' : ''}>
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
                  {(!groupBy || groupBy === 'none') && (
                    <p className="text-xs text-muted-foreground">Select a Group By option to enable aggregation</p>
                  )}
                </div>

                {groupBy && groupBy !== 'none' && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md mt-2">
                    <p className="text-xs flex items-center gap-1.5">
                      <SparklesIcon className="h-3.5 w-3.5 text-blue-500" />
                      <span>
                        <span className="font-medium">Active:</span> Grouping by <span className="font-medium">{groupBy}</span> with <span className="font-medium">{aggregation}</span> aggregation
                      </span>
                    </p>
                  </div>
                )}

                <Separator />

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
            <div className={`md:col-span-${showGuidePanel ? '6' : (showControls ? '9' : '12')} w-full`}>
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="data">Data Table</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chart" className="w-full">
                  <div className="w-full">
                    {(groupBy && groupBy !== 'none') && (
                      <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm flex items-center gap-2">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                        <span>
                          Showing <span className="font-semibold">{aggregation}</span> of <span className="font-semibold">{yAxis}</span> grouped by <span className="font-semibold">{groupBy}</span>
                        </span>
                      </div>
                    )}
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
            
            {/* Guide panel - only show if enabled and there are suggestions */}
            {showGuidePanel && (
              <div className="md:col-span-3 w-full">
                <GuidePanel
                  chartType={chartType}
                  xAxis={xAxis}
                  yAxis={yAxis}
                  data={sortedData}
                  error={error}
                  onApplySuggestion={applyChartSuggestion}
                  columnOptions={columnOptions}
                />
                
                {/* Aggregation Stats Panel - show when grouping is active */}
                {groupBy && groupBy !== 'none' && (
                  <div className="mt-4 border rounded-md p-4 bg-blue-50/40 dark:bg-blue-900/20">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                      Aggregation Statistics
                    </h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Method:</span>
                        <span className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">
                          {aggregation.charAt(0).toUpperCase() + aggregation.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Groups:</span>
                        <span>{Object.keys(chartData.reduce((acc, item) => {
                          const key = String(item[groupBy]);
                          acc[key] = true;
                          return acc;
                        }, {} as Record<string, boolean>)).length}</span>
                      </div>
                      
                      {(() => {
                        // Calculate additional statistics based on the Y axis values
                        const numericValues = sortedData
                          .map(item => Number(item[yAxis]))
                          .filter(val => !isNaN(val));
                          
                        if (numericValues.length === 0) return null;
                        
                        const sum = numericValues.reduce((acc, val) => acc + val, 0);
                        const avg = sum / numericValues.length;
                        const min = Math.min(...numericValues);
                        const max = Math.max(...numericValues);
                        const sorted = [...numericValues].sort((a, b) => a - b);
                        const median = sorted.length % 2 === 0 
                          ? (sorted[Math.floor(sorted.length / 2) - 1] + sorted[Math.floor(sorted.length / 2)]) / 2 
                          : sorted[Math.floor(sorted.length / 2)];
                          
                        const formatValue = (val: number) => {
                          if (Math.abs(val) >= 1000000) {
                            return `${(val / 1000000).toFixed(2)}M`;
                          } else if (Math.abs(val) >= 1000) {
                            return `${(val / 1000).toFixed(2)}K`;
                          } else if (Number.isInteger(val)) {
                            return val.toString();
                          } else {
                            return val.toFixed(2);
                          }
                        };
                        
                        return (
                          <>
                            <div className="my-1 border-t dark:border-gray-700" />
                            
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Raw Data Count:</span>
                              <span>{numericValues.length.toLocaleString()}</span>
                            </div>
                            
                            {/* Show different statistics based on the aggregation method */}
                            {aggregation === 'sum' && (
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Total Sum:</span>
                                <span>{formatValue(sum)}</span>
                              </div>
                            )}
                            
                            {aggregation === 'avg' && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Mean:</span>
                                  <span>{formatValue(avg)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Standard Deviation:</span>
                                  <span>{formatValue(
                                    Math.sqrt(
                                      numericValues.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / numericValues.length
                                    )
                                  )}</span>
                                </div>
                              </>
                            )}
                            
                            {aggregation === 'min' && (
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Minimum:</span>
                                <span>{formatValue(min)}</span>
                              </div>
                            )}
                            
                            {aggregation === 'max' && (
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Maximum:</span>
                                <span>{formatValue(max)}</span>
                              </div>
                            )}
                            
                            {aggregation === 'median' && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Median:</span>
                                  <span>{formatValue(median)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Quartile 1 (25%):</span>
                                  <span>{formatValue(sorted[Math.floor(sorted.length * 0.25)])}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Quartile 3 (75%):</span>
                                  <span>{formatValue(sorted[Math.floor(sorted.length * 0.75)])}</span>
                                </div>
                              </>
                            )}
                            
                            <div className="my-1 border-t dark:border-gray-700" />
                            
                            {/* Always show these regardless of aggregation method */}
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Range:</span>
                              <span>{formatValue(max - min)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Data Quality:</span>
                              <span className="text-green-600 dark:text-green-400">
                                {(numericValues.length / sortedData.length * 100).toFixed(1)}% valid
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Chart rendering help */}
                <div className="mt-4 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <InformationCircleIcon className="h-4 w-4 text-primary" />
                    Chart Debug Info
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <p>
                      <span className="font-medium">Chart Type:</span> {chartType}
                    </p>
                    <p>
                      <span className="font-medium">X-Axis:</span> {xAxis} ({columns.find(c => c.name === xAxis)?.type || 'unknown'})
                    </p>
                    <p>
                      <span className="font-medium">Y-Axis:</span> {yAxis} ({columns.find(c => c.name === yAxis)?.type || 'unknown'})
                    </p>
                    {groupBy && groupBy !== 'none' && (
                      <p>
                        <span className="font-medium">Aggregation:</span> {aggregation} of {yAxis} by {groupBy}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Data Points:</span> {chartData.length || pieData.length || 0}
                    </p>
                    {validationErrors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-amber-600 dark:text-amber-400">Validation Issues:</p>
                        <ul className="list-disc list-inside text-muted-foreground">
                          {validationErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <button
                      onClick={() => setShowGuidePanel(false)}
                      className="w-full text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 py-1 px-2 rounded flex items-center justify-center gap-1"
                    >
                      <XMarkIcon className="h-3 w-3" />
                      Hide Guide Panel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 