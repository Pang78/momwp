'use client';

import * as React from "react";
import { useRouter } from 'next/navigation';

// Import Icons
import {
  ArrowLeftIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  ChartPieIcon,
  PlusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { ChartBarSquareIcon } from '@heroicons/react/24/solid';

// Import UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdvancedOptions } from '@/components/ui/advanced-options';
import { WizardChart, ChartType, ChartTemplate } from '@/components/visualizations/WizardChart';
import { ChartTemplateSelector } from '@/components/visualizations/ChartTemplateSelector';
import { ChartExport } from '@/components/visualizations/ChartExport';
import { GuidedTutorial, TutorialStep } from '@/components/ui/guided-tutorial';

// Types
import { DataColumn } from '@/lib/analysis/dataUtils';

// Define step type
type WizardStep = 'select-data' | 'choose-chart' | 'configure' | 'preview';
type ColorScheme = 'default' | 'pastel' | 'vibrant' | 'monochrome';

// Component props
interface DataExplorerWizardProps {
  data: Record<string, unknown>[];
  columns: DataColumn[];
  title?: string;
  description?: string;
  onBack?: () => void;
}

export default function DataExplorerWizard({
  data,
  columns,
  title = "Data Explorer",
  description = "Visualize and explore your data",
  onBack
}: DataExplorerWizardProps) {
  const router = useRouter();
  
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
  const chartRef = React.useRef<HTMLDivElement>(null);
  
  // Handle navigating back
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
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
  
  // Tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Select Your Data",
      content: (
        <div className="space-y-2">
          <p className="text-sm">Start by selecting which columns from your dataset you want to visualize.</p>
          <p className="text-sm">Choose columns that are relevant to your analysis goals.</p>
        </div>
      ),
      targetSelector: ".data-column-list",
      position: "right"
    },
    {
      title: "Choose a Chart Type",
      content: (
        <div className="space-y-2">
          <p className="text-sm">Select the type of chart that best represents your data.</p>
          <p className="text-sm">Different chart types are suited for different kinds of data relationships.</p>
        </div>
      ),
      targetSelector: ".chart-type-selection",
      position: "bottom"
    },
    {
      title: "Select a Template",
      content: (
        <div className="space-y-2">
          <p className="text-sm">Chart templates provide pre-configured settings for common visualization needs.</p>
          <p className="text-sm">Choose a template that matches your analytical goals.</p>
        </div>
      ),
      targetSelector: ".chart-template-section",
      position: "left"
    },
    {
      title: "Configure Axes",
      content: (
        <div className="space-y-2">
          <p className="text-sm">Select which columns to use for your X and Y axes.</p>
          <p className="text-sm">The X-axis typically shows categories, while the Y-axis shows values.</p>
        </div>
      ),
      targetSelector: ".axis-configuration",
      position: "right"
    },
    {
      title: "Export and Share",
      content: (
        <div className="space-y-2">
          <p className="text-sm">When you've finished creating your visualization, you can export it as an image or share it.</p>
          <p className="text-sm">You can also export the underlying data for further analysis.</p>
        </div>
      ),
      targetSelector: ".export-options",
      position: "top"
    }
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
  
  // Determine if secondary axis is needed based on template
  const needsSecondaryAxis = chartTemplate === 'comparison' || (chartType === 'radar' && chartTemplate !== 'basic');
  
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
  
  // The chart type options
  const chartTypeOptions = [
    {
      id: 'bar' as ChartType,
      title: 'Bar Chart',
      description: 'Compare values across categories',
      icon: <ChartBarIcon className="h-12 w-12 text-muted-foreground" />
    },
    {
      id: 'line' as ChartType,
      title: 'Line Chart',
      description: 'Show trends over a continuous period',
      icon: <ChartBarSquareIcon className="h-12 w-12 text-muted-foreground" />
    },
    {
      id: 'pie' as ChartType,
      title: 'Pie Chart',
      description: 'Show proportion and distribution',
      icon: <ChartPieIcon className="h-12 w-12 text-muted-foreground" />
    },
    {
      id: 'scatter' as ChartType,
      title: 'Scatter Plot',
      description: 'Show correlation between variables',
      icon: <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">⋯</div>
    },
    {
      id: 'area' as ChartType,
      title: 'Area Chart',
      description: 'Emphasize volume underneath a line',
      icon: <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">▲</div>
    },
    {
      id: 'radar' as ChartType,
      title: 'Radar Chart',
      description: 'Compare multiple variables relative to a center',
      icon: <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">◇</div>
    },
    {
      id: 'composed' as ChartType,
      title: 'Composed Chart',
      description: 'Combine multiple chart types',
      icon: <div className="h-12 w-12 flex items-center justify-center text-muted-foreground">⊞</div>
    }
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">{title}</h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTutorial(true)}
          className="ml-auto"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Show Tutorial
        </Button>
      </div>
      
      {/* Tutorial */}
      {showTutorial && (
        <GuidedTutorial
          steps={tutorialSteps}
          isOpen={showTutorial}
          onOpenChange={(open) => setShowTutorial(open)}
        />
      )}
      
      {renderProgressSteps()}
      
      <div className="mb-8">
        {currentStep === 'select-data' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs">1</span>
                Select the columns you want to explore
              </h3>
              <p className="text-xs text-muted-foreground">
                Choose which data columns to include in your visualization. You can always change this later.
              </p>
            </div>
            
            <div className="border rounded-md divide-y data-column-list">
              {columns.map(column => (
                <div 
                  key={column.name} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  onClick={() => toggleColumnSelection(column.name)}
                >
                  <div>
                    <div className="font-medium text-sm">{column.name}</div>
                    <div className="text-xs text-muted-foreground">Type: {column.type}</div>
                  </div>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                    selectedColumns.includes(column.name) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border'
                  }`}>
                    {selectedColumns.includes(column.name) && (
                      <CheckIcon className="h-3 w-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentStep === 'choose-chart' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs">2</span>
                Choose the type of chart
              </h3>
              <p className="text-xs text-muted-foreground">
                Select the visualization that best represents your data
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 chart-type-selection">
              {chartTypeOptions.map(option => (
                <div 
                  key={option.id}
                  className={`border rounded-md p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-primary transition-colors ${chartType === option.id ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => {
                    setChartType(option.id);
                    // Reset template when changing chart type
                    setChartTemplate('basic');
                  }}
                >
                  {option.icon}
                  <div>
                    <h4 className="text-sm font-medium">{option.title}</h4>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentStep === 'configure' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs">3</span>
                Configure your chart
              </h3>
              <p className="text-xs text-muted-foreground">
                Set up your chart axes and customize how your visualization looks
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chart-title" className="text-sm">Chart Title</Label>
                    <Input
                      id="chart-title"
                      placeholder="Enter chart title"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="axis-configuration">
                    <Label htmlFor="x-axis" className="text-sm">X-Axis (Categories)</Label>
                    <select
                      id="x-axis"
                      value={xAxis}
                      onChange={(e) => setXAxis(e.target.value)}
                      className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50"
                    >
                      <option value="">Select column</option>
                      {selectedColumns.map(column => (
                        <option key={column} value={column}>{column}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="y-axis" className="text-sm">Y-Axis (Values)</Label>
                    <select
                      id="y-axis"
                      value={yAxis}
                      onChange={(e) => setYAxis(e.target.value)}
                      className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50"
                    >
                      <option value="">Select column</option>
                      {selectedColumns.map(column => {
                        const col = columns.find(c => c.name === column);
                        if (col && col.type === 'numeric') {
                          return <option key={column} value={column}>{column}</option>;
                        }
                        return null;
                      })}
                    </select>
                  </div>
                  
                  {needsSecondaryAxis && (
                    <div>
                      <Label htmlFor="secondary-y-axis" className="text-sm">Secondary Y-Axis</Label>
                      <select
                        id="secondary-y-axis"
                        value={secondaryYAxis}
                        onChange={(e) => setSecondaryYAxis(e.target.value)}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50"
                      >
                        <option value="">Select column</option>
                        {selectedColumns.map(column => {
                          const col = columns.find(c => c.name === column);
                          if (col && col.type === 'numeric' && column !== yAxis) {
                            return <option key={column} value={column}>{column}</option>;
                          }
                          return null;
                        })}
                      </select>
                    </div>
                  )}
                  
                  <div className="pt-2 chart-template-section">
                    <ChartTemplateSelector
                      value={chartTemplate}
                      onChange={setChartTemplate}
                      chartType={chartType}
                    />
                  </div>
                  
                  <AdvancedOptions title="Chart Options">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="color-scheme" className="text-sm">Color Scheme</Label>
                        <select
                          id="color-scheme"
                          value={colorScheme}
                          onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50"
                        >
                          <option value="default">Default</option>
                          <option value="pastel">Pastel</option>
                          <option value="vibrant">Vibrant</option>
                          <option value="monochrome">Monochrome</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
                        <input
                          type="checkbox"
                          id="show-grid"
                          checked={showGrid}
                          onChange={(e) => setShowGrid(e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-legend" className="text-sm">Show Legend</Label>
                        <input
                          type="checkbox"
                          id="show-legend"
                          checked={showLegend}
                          onChange={(e) => setShowLegend(e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-animation" className="text-sm">Enable Animation</Label>
                        <input
                          type="checkbox"
                          id="enable-animation"
                          checked={enableAnimation}
                          onChange={(e) => setEnableAnimation(e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </AdvancedOptions>
                </div>
              </div>
              
              <div className="border rounded-md h-[300px] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                {renderChartPreview()}
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 'preview' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs">4</span>
                Preview and Export
              </h3>
              <p className="text-xs text-muted-foreground">
                Review your visualization and export it for sharing
              </p>
            </div>
            
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{chartTitle || "Untitled Chart"}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <div ref={chartRef}>
                  {renderChartPreview()}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-4 export-options">
                <div className="text-sm text-muted-foreground w-full mb-2">
                  Displaying {filteredData.length} records
                </div>
                <ChartExport 
                  chartRef={chartRef}
                  chartTitle={chartTitle || "chart"}
                  chartType={chartType}
                  data={filteredData}
                  xAxis={xAxis}
                  yAxis={yAxis}
                  exportOptions={{
                    includeData: true,
                    includeCode: true
                  }}
                />
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-auto">
        <Button 
          variant="outline" 
          onClick={goToPreviousStep}
          disabled={currentStep === 'select-data'}
        >
          Previous
        </Button>
        
        <Button 
          onClick={goToNextStep} 
          disabled={!canProceed() || currentStep === 'preview'}
        >
          {currentStep === 'preview' ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
} 