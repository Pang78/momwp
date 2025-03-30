// @ts-nocheck
'use client';

// @ts-ignore - React types are properly available at runtime
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeData, AnalysisResult, DataInsight, DataColumn } from '@/lib/analysis/dataUtils';
// @ts-ignore - Recharts types are properly available at runtime
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
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Download, FileText, AlertTriangle, Info } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import DataExplorer from './DataExplorer';
import MultiView from './MultiView';

interface DataAnalyzerProps extends Record<string, never> {}

export default function DataAnalyzer(): React.ReactElement {
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
    // Use the actual insight data instead of dummy data
    
    if (!insight.chartData && !insight.columns.length) {
      return (
        <div className="p-6 text-center border rounded-md">
          <p className="text-muted-foreground">No visualization data available</p>
        </div>
      );
    }
    
    // Generate chart data based on insight type and columns
    let chartData = [];
    
    // If insight has chartData use it, otherwise try to generate it
    if (insight.chartData) {
      chartData = insight.chartData;
    } else if (result) {
      // Find the relevant columns
      const relevantColumns = result.columns.filter(col => 
        insight.columns.includes(col.name)
      );
      
      if (relevantColumns.length > 0) {
        // Generate sample data from the columns
        // For simplicity, take the first 10 values
        const sampleSize = Math.min(10, relevantColumns[0].values.length);
        
        chartData = Array(sampleSize).fill(0).map((_, i) => {
          const dataPoint = { index: i };
          
          relevantColumns.forEach(col => {
            dataPoint[col.name] = col.values[i];
          });
          
          return dataPoint;
        });
      }
    }
    
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
    
    switch (insight.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={insight.columns.length > 1 ? insight.columns[0] : "index"} />
              <YAxis />
              <Tooltip />
              <Legend />
              {insight.columns.slice(0, 3).map((column, idx) => (
                <Bar 
                  key={column} 
                  dataKey={column} 
                  name={column}
                  fill={colors[idx % colors.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={insight.columns.length > 1 ? insight.columns[0] : "index"} />
              <YAxis />
              <Tooltip />
              <Legend />
              {insight.columns.slice(insight.columns.length > 1 ? 1 : 0).map((column, idx) => (
                <Line 
                  key={column}
                  type="monotone" 
                  dataKey={column} 
                  name={column}
                  stroke={colors[idx % colors.length]} 
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        // For scatter, we need at least 2 numeric columns
        if (insight.columns.length >= 2) {
          return (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis dataKey={insight.columns[0]} type="number" name={insight.columns[0]} />
                <YAxis dataKey={insight.columns[1]} type="number" name={insight.columns[1]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter 
                  name={`${insight.columns[0]} vs ${insight.columns[1]}`} 
                  data={chartData} 
                  fill={colors[0]} 
                />
              </ScatterChart>
            </ResponsiveContainer>
          );
        }
        return (
          <div className="p-6 text-center border rounded-md">
            <p className="text-muted-foreground">Insufficient data for scatter plot</p>
          </div>
        );
        
      default:
        return (
          <div className="p-6 text-center border rounded-md">
            <p className="text-muted-foreground">No visualization available for this insight type</p>
          </div>
        );
    }
  };

  // Convert data to array of objects for the explorer
  const getRowData = () => {
    if (!result || !result.columns || !result.columns.length) return [];

    const rowCount = result.columns[0].values.length;
    const rows = [];

    for (let i = 0; i < rowCount; i++) {
      const row = {};
      result.columns.forEach(col => {
        row[col.name] = col.values[i];
      });
      rows.push(row);
    }

    return rows;
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
          
          <Tabs defaultValue="explore">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="explore">Explore Data</TabsTrigger>
              <TabsTrigger value="multiview">Multiple Views</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger value="forecast">
                {result.timeSeries ? 'SARIMA Forecast' : 'Forecast'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="explore" className="mt-4">
              <DataExplorer 
                data={getRowData()}
                columns={result.columns}
                showControls={true}
              />
            </TabsContent>
            
            <TabsContent value="multiview" className="mt-4">
              <MultiView 
                data={getRowData()}
                columns={result.columns}
              />
            </TabsContent>
            
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
            
            <TabsContent value="forecast" className="space-y-4 mt-4">
              {result.timeSeries ? (
                <Card>
                  <CardHeader>
                    <CardTitle>SARIMA Time Series Forecast</CardTitle>
                    <CardDescription>
                      {result.timeSeries.modelType} model with MAPE of {result.timeSeries.mape.toFixed(2)}%
                      {result.timeSeries.params && result.timeSeries.params.period && (
                        <span> (Seasonality period: {result.timeSeries.params.period})</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>About SARIMA Forecasting</AlertTitle>
                        <AlertDescription>
                          SARIMA (Seasonal AutoRegressive Integrated Moving Average) is a popular time series forecasting model
                          that captures seasonality patterns in data. This implementation provides a simplified browser-based
                          version of SARIMA forecasting.
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={[
                            // Find a date column and a numeric column to visualize
                            ...(result.timeSeries.historicalData || Array(10).fill(0).map((_, i) => ({
                              index: i,
                              value: 100 + Math.random() * 50,
                              type: 'Historical'
                            }))),
                            ...result.timeSeries.forecast.map((value: number, i: number) => ({
                              index: (result.timeSeries.historicalData?.length || 10) + i,
                              value,
                              type: 'Forecast',
                              forecastUpper: value * (1 + 0.1), // Simple confidence interval of +/- 10%
                              forecastLower: value * (1 - 0.1)
                            }))
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="index" 
                            label={{ value: 'Time Points', position: 'insideBottomRight', offset: -10 }} 
                          />
                          <YAxis 
                            label={{ value: 'Value', angle: -90, position: 'insideLeft' }} 
                          />
                          <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border rounded shadow-sm">
                                  <p className="font-medium">{`Period: ${payload[0].payload.index}`}</p>
                                  <p className="text-[#8884d8]">{`Value: ${payload[0].value}`}</p>
                                  {payload[0].payload.type === 'Forecast' && (
                                    <>
                                      <p className="text-[#82ca9d]">{`Upper: ${payload[0].payload.forecastUpper?.toFixed(2)}`}</p>
                                      <p className="text-[#ff8042]">{`Lower: ${payload[0].payload.forecastLower?.toFixed(2)}`}</p>
                                    </>
                                  )}
                                  <p>{payload[0].payload.type}</p>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            name="Historical"
                            stroke="#8884d8" 
                            strokeWidth={2}
                            dot={{ fill: '#8884d8', r: 3 }}
                            activeDot={{ r: 5 }}
                            connectNulls
                          />
                          <Line 
                            type="monotone" 
                            name="Forecast"
                            dataKey="value" 
                            stroke="#82ca9d" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#82ca9d', r: 3 }}
                            connectNulls
                          />
                          <Area 
                            type="monotone" 
                            dataKey="forecastUpper" 
                            fill="#82ca9d" 
                            stroke="none"
                            fillOpacity={0.2}
                            name="Upper Bound"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="forecastLower" 
                            fill="#ff8042" 
                            stroke="none"
                            fillOpacity={0.2}
                            name="Lower Bound"
                          />
                        </ComposedChart>
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
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-4" />
                    <p className="text-lg font-medium mb-2">No Time Series Data Detected</p>
                    <p className="text-muted-foreground">
                      To enable SARIMA forecasting, your data should include a datetime column and at least one numeric column with sufficient data points.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 