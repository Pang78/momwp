'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeData, AnalysisResult, DataInsight, DataColumn } from '@/lib/analysis/dataUtils';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Download, FileText, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface DataAnalyzerProps {
  // Add props if needed
}

export default function DataAnalyzer({}: DataAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setError(null);

    try {
      // Simulate progress steps for better UX
      const progressTimer = setInterval(() => {
        setAnalysisProgress((prev: number) => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return prev;
          }
          return prev + Math.floor(Math.random() * 10);
        });
      }, 500);

      const analysisResult = await analyzeData(file);
      clearInterval(progressTimer);
      setAnalysisProgress(100);
      
      setResult(analysisResult);
    } catch (err) {
      setError(`Error analyzing data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderChart = (insight: DataInsight) => {
    // For now, just render a placeholder chart based on insight type
    // In a real implementation, we'd convert insight data to proper chart format
    
    const dummyData = [
      { name: 'A', value: 400 },
      { name: 'B', value: 300 },
      { name: 'C', value: 300 },
      { name: 'D', value: 200 },
    ];
    
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
    
    switch (insight.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dummyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dummyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="x" type="number" />
              <YAxis dataKey="y" type="number" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Values" data={[
                { x: 100, y: 200 },
                { x: 120, y: 100 },
                { x: 170, y: 300 },
                { x: 140, y: 250 },
                { x: 150, y: 400 },
              ]} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <div className="p-6 text-center border rounded-md">
            <p className="text-muted-foreground">No visualization available</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Data Analyzer</h1>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV Data</CardTitle>
            <CardDescription>
              Upload your CSV file for automated analysis and insights. 
              <br/>
              <span className="text-sm text-muted-foreground mt-1">
                <strong>Note:</strong> All processing is done locally in your browser for privacy.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div 
                className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Drag &amp; drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="flex justify-between items-center">
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <a 
                    href="/sample_data.csv" 
                    download
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download sample data</span>
                  </a>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleAnalyze} 
              disabled={!file || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {isAnalyzing && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analyzing Data</CardTitle>
            <CardDescription>
              Please wait while we analyze your data...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-xs text-right text-muted-foreground">{analysisProgress}%</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Summary</CardTitle>
              <CardDescription>
                Overview of your dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Rows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{result.rowCount}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Columns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{result.columns.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{result.insights.length}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="insights">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="columns">Columns</TabsTrigger>
              {result.timeSeries && (
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="insights" className="space-y-4 mt-4">
              {result.insights.map((insight: DataInsight, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{insight.title}</CardTitle>
                      <div className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                        Importance: {insight.importance.toFixed(1)}/10
                      </div>
                    </div>
                    <CardDescription>
                      Related to: {insight.columns.join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{insight.description}</p>
                    {insight.chartType && renderChart(insight)}
                  </CardContent>
                </Card>
              ))}
              
              {result.insights.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No insights were generated for this dataset.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="columns" className="space-y-4 mt-4">
              {result.columns.map((column: DataColumn, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{column.name}</CardTitle>
                      <div className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                        {column.type}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {column.summary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {column.type === 'numeric' && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">Range</p>
                              <p>{column.summary.min?.toFixed(2)} to {column.summary.max?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Mean / Median</p>
                              <p>{column.summary.mean?.toFixed(2)} / {column.summary.median?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Standard Deviation</p>
                              <p>{column.summary.stdDev?.toFixed(2)}</p>
                            </div>
                          </>
                        )}
                        
                        {column.type === 'categorical' && column.summary.uniqueValues && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground mb-2">Top Values</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {column.summary.uniqueValues.slice(0, 6).map((value: { value: string; count: number }, i: number) => (
                                <div key={i} className="flex justify-between border rounded px-3 py-2">
                                  <span className="truncate">{value.value}</span>
                                  <span className="text-muted-foreground">{value.count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {column.type === 'datetime' && column.summary.dateRange && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Date Range</p>
                            <p>
                              {new Date(column.summary.dateRange.start).toLocaleDateString()} to {' '}
                              {new Date(column.summary.dateRange.end).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Missing Values</p>
                          <p>{column.summary.missingValues} ({column.summary.missingPercent.toFixed(1)}%)</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            {result.timeSeries && (
              <TabsContent value="forecast" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Time Series Forecast</CardTitle>
                    <CardDescription>
                      {result.timeSeries.modelType} model with MAPE of {result.timeSeries.mape.toFixed(2)}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Alert>
                        <AlertTitle>Browser-based Forecasting</AlertTitle>
                        <AlertDescription>
                          This is a simplified forecasting model running in your browser. 
                          For more accurate forecasting, consider using specialized statistical software.
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            ...Array(10).fill(0).map((_, i) => ({
                              index: i,
                              value: 100 + Math.random() * 50, // Mock historical data
                              type: 'Historical'
                            })),
                            ...result.timeSeries.forecast.map((value: number, i: number) => ({
                              index: 10 + i,
                              value,
                              type: 'Forecast'
                            }))
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="index" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8884d8" 
                            dot={{ fill: '#8884d8' }}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Forecast Values</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-5 gap-2">
                            {result.timeSeries.forecast.map((value: number, i: number) => (
                              <div key={i} className="border rounded p-2 text-center">
                                <div className="text-xs text-muted-foreground">Step {i+1}</div>
                                <div className="font-medium">{value.toFixed(2)}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
} 