'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import DataExplorerWizard from '@/app/components/DataExplorerWizard';
import { DataColumn, parseCSV, detectColumnTypes } from '@/lib/analysis/dataUtils';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, ArrowUpOnSquareIcon, DocumentTextIcon, ArrowLeftIcon, ArrowsUpDownIcon, ChartBarIcon, ChartPieIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ChartBarSquareIcon } from '@heroicons/react/24/solid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdvancedOptions } from '@/components/ui/advanced-options';
import { WizardChart } from '@/components/visualizations/WizardChart';
import { ChartTemplateSelector } from '@/components/visualizations/ChartTemplateSelector';
import { ChartType, ChartTemplate } from '@/components/visualizations/WizardChart';

export default function DataExplorerWizardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = React.useState<DataColumn[]>([]);
  const [showHelp, setShowHelp] = React.useState(true);
  const [dataSource, setDataSource] = React.useState<'none' | 'csv' | 'api'>('none');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Step state
  const [currentStep, setCurrentStep] = React.useState<WizardStep>('select-data');
  
  // Data selection state
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>([]);
  
  // Chart configuration state
  const [chartType, setChartType] = React.useState<ChartType>('bar');
  const [chartTemplate, setChartTemplate] = React.useState<ChartTemplate>('basic');
  const [xAxis, setXAxis] = React.useState<string>('');
  const [yAxis, setYAxis] = React.useState<string>('');
  const [secondaryYAxis, setSecondaryYAxis] = React.useState<string>('');
  
  // Chart options state
  const [chartTitle, setChartTitle] = React.useState<string>('');
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>('default');
  const [showGrid, setShowGrid] = React.useState<boolean>(true);
  const [showLegend, setShowLegend] = React.useState<boolean>(true);
  const [enableAnimation, setEnableAnimation] = React.useState<boolean>(false);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = React.useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = React.useState<number>(0);
  
  // Handle CSV file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      // Parse CSV file
      const parsedData = await parseCSV(file);
      // Detect column types
      const detectedColumns = detectColumnTypes(parsedData);
      
      setData(parsedData);
      setColumns(detectedColumns);
      setDataSource('csv');
    } catch (error) {
      console.error('Error parsing CSV file:', error);
      alert('Failed to parse CSV file. Please ensure it is a valid CSV format.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle demo click (use sample data from API)
  const handleDemoClick = async () => {
    setIsLoading(true);
    try {
      // Fetch sample dataset from data.gov.sg
      const response = await fetch('https://data.gov.sg/api/action/datastore_search?resource_id=f1765b54-a209-4718-8d38-a39237f502b3&limit=100');
      const result = await response.json();
      
      if (result.success && result.result.records) {
        const apiData = result.result.records;
        
        // Transform the data for our application
        const transformedData = apiData.map((record: any) => {
          const item: Record<string, unknown> = {};
          // Extract all fields from the record
          Object.keys(record).forEach(key => {
            if (key !== '_id') { // Skip internal ID field
              item[key] = record[key];
            }
          });
          return item;
        });
        
        // Detect column types from the transformed data
        const detectedColumns = detectColumnTypes(transformedData);
        
        setData(transformedData);
        setColumns(detectedColumns);
        setDataSource('api');
      } else {
        throw new Error('Failed to fetch demo data');
      }
    } catch (error) {
      console.error('Error fetching demo data:', error);
      alert('Failed to load demo data. Please try again later or upload a CSV file.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle navigating back
  const handleBack = () => {
    router.push('/');
  };
  
  // Navigate between steps
  const goToNextStep = () => {
    switch (currentStep) {
      case 'select-data':
        setCurrentStep('choose-chart');
        break;
      case 'choose-chart':
        setCurrentStep('configure');
        break;
      case 'configure':
        setCurrentStep('preview');
        break;
      default:
        break;
    }
  };
  
  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'choose-chart':
        setCurrentStep('select-data');
        break;
      case 'configure':
        setCurrentStep('choose-chart');
        break;
      case 'preview':
        setCurrentStep('configure');
        break;
      default:
        break;
    }
  };
  
  // Handle column selection
  const toggleColumnSelection = (columnName: string) => {
    setSelectedColumns((prev: string[]) => {
      if (prev.includes(columnName)) {
        return prev.filter((col: string) => col !== columnName);
      } else {
        return [...prev, columnName];
      }
    });
  };
  
  // Filter columns based on selection
  const filteredData = React.useMemo(() => {
    if (selectedColumns.length === 0) return data;
    
    return data.map(item => {
      const filteredItem: Record<string, unknown> = {};
      selectedColumns.forEach((col: string) => {
        filteredItem[col] = item[col];
      });
      return filteredItem;
    });
  }, [data, selectedColumns]);
  
  // Color palettes based on selected scheme
  const colorPalette = React.useMemo(() => {
    switch (colorScheme) {
      case 'pastel':
        return ['#9BD0F5', '#FFB1B1', '#C2E0C6', '#FFD399', '#D4B8E0', '#F9CF8B'];
      case 'vibrant':
        return ['#FF5733', '#33FF57', '#3357FF', '#F5D300', '#9900F5', '#FF33C7'];
      case 'monochrome':
        return ['#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd'];
      default:
        return ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
    }
  }, [colorScheme]);
  
  // Progress indicator
  const progressSteps = [
    { id: 'select-data', label: 'Select Data' },
    { id: 'choose-chart', label: 'Choose Chart' },
    { id: 'configure', label: 'Configure' },
    { id: 'preview', label: 'Preview & Export' }
  ];
  
  // Check if we can proceed to next step
  const canProceed = () => {
    switch (currentStep) {
      case 'select-data':
        return selectedColumns.length > 0;
      case 'choose-chart':
        return !!chartType;
      case 'configure':
        return !!xAxis && !!yAxis;
      default:
        return true;
    }
  };
  
  // Render the progress steps
  const renderProgressSteps = () => {
    return (
      <div className="flex w-full mb-6">
        {progressSteps.map((step, index) => (
          <div key={step.id} className="flex-1 flex flex-col items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
              currentStep === step.id
                ? 'bg-primary text-white'
                : (
                  progressSteps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-primary/20 text-primary'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                )
            }`}>
              {index + 1}
            </div>
            <div className="text-xs mt-1 text-center">
              {step.label}
            </div>
            {index < progressSteps.length - 1 && (
              <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700 absolute mt-4 left-0 right-0"></div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render chart preview based on current settings
  const renderChartPreview = () => {
    if (!xAxis || !yAxis) {
      return (
        <div className="text-center text-muted-foreground text-sm">
          Select X and Y axis to preview your chart
        </div>
      );
    }
    
    return (
      <WizardChart
        data={filteredData}
        chartType={chartType}
        chartTemplate={chartTemplate}
        xAxisKey={xAxis}
        yAxisKey={yAxis}
        secondaryYAxisKey={secondaryYAxis}
        title={chartTitle || undefined}
        colorPalette={colorPalette}
      />
    );
  };
  
  // Handle exporting chart data
  const handleExportData = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredData)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `${chartTitle || 'chart-data'}.json`;
    link.click();
  };
  
  // The chart type options
  const chartTypeOptions = [
    {
      id: 'bar',
      title: 'Bar Chart',
      description: 'Compare values across categories',
      icon: <ChartBarIcon className="h-12 w-12 text-muted-foreground" />
    },
    {
      id: 'line',
      title: 'Line Chart',
      description: 'Show trends over a continuous period',
      icon: <ChartBarSquareIcon className="h-12 w-12 text-muted-foreground" />
    },
    {
      id: 'pie',
      title: 'Pie Chart',
      description: 'Show proportion and distribution',
      icon: <ChartPieIcon className="h-12 w-12 text-muted-foreground" />
    },
    {
      id: 'scatter',
      title: 'Scatter Plot',
      description: 'Show correlation between variables',
      icon: <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">⋯</div>
    },
    {
      id: 'area',
      title: 'Area Chart',
      description: 'Emphasize volume underneath a line',
      icon: <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">▲</div>
    },
    {
      id: 'radar',
      title: 'Radar Chart',
      description: 'Compare multiple variables relative to a center',
      icon: <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">◇</div>
    },
    {
      id: 'composed',
      title: 'Composed Chart',
      description: 'Combine multiple chart types',
      icon: <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">⊞</div>
    }
  ];
  
  // Determine if secondary axis is needed based on template
  const needsSecondaryAxis = chartTemplate === 'comparison' || (chartType === 'radar' && chartTemplate !== 'basic');
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Data Explorer Wizard</h1>
      <p className="text-muted-foreground mb-8">
        A step-by-step approach to creating data visualizations
      </p>
      
      {showHelp && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Welcome to the Data Explorer!</h2>
          <p className="mb-4">
            Create powerful visualizations through a guided, step-by-step process.
            You can import your own CSV data or use sample data from data.gov.sg.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="border bg-white dark:bg-gray-800 rounded-md p-4">
              <div className="font-semibold mb-2 flex items-center">
                <div className="bg-blue-500 text-white h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2">1</div>
                Import Your Data
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file or use sample data from data.gov.sg to get started.
              </p>
            </div>
            
            <div className="border bg-white dark:bg-gray-800 rounded-md p-4">
              <div className="font-semibold mb-2 flex items-center">
                <div className="bg-blue-500 text-white h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2">2</div>
                Create Visualizations
              </div>
              <p className="text-sm text-muted-foreground">
                Follow the wizard to select data, choose chart types, and customize your visualization.
              </p>
            </div>
            
            <div className="border bg-white dark:bg-gray-800 rounded-md p-4">
              <div className="font-semibold mb-2 flex items-center">
                <div className="bg-blue-500 text-white h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2">3</div>
                Share and Export
              </div>
              <p className="text-sm text-muted-foreground">
                Export your visualizations as images or share them with others.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              You can dismiss this help panel for now - it will be available in the help menu if you need it later.
            </p>
            <Button onClick={() => setShowHelp(false)} className="flex items-center gap-1">
              Get Started
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {dataSource === 'none' ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Import Data to Begin</h2>
          
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl">
            <div className="flex flex-col items-center p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <DocumentTextIcon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
              <p className="text-sm text-center text-muted-foreground mb-4">
                Upload your own CSV file to create visualizations with your data
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button onClick={triggerFileInput} className="w-full">
                Choose File
              </Button>
            </div>
            
            <div className="flex flex-col items-center p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <ArrowUpOnSquareIcon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Use Sample Data</h3>
              <p className="text-sm text-center text-muted-foreground mb-4">
                Use a sample dataset from data.gov.sg to explore the wizard features
              </p>
              <Button onClick={handleDemoClick} className="w-full" variant="outline">
                Load Demo Data
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <DataExplorerWizard 
          data={data} 
          columns={columns}
          title="Data Explorer"
          description="Explore and visualize your data"
        />
      )}
    </div>
  );
} 