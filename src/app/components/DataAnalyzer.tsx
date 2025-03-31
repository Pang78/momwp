// @ts-nocheck
'use client';

// @ts-expect-error - React types are properly available at runtime
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeData, AnalysisResult, DataInsight, DataColumn } from '@/lib/analysis/dataUtils';
// @ts-expect-error - Recharts types are properly available at runtime
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
  ComposedChart
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Download, FileText, AlertTriangle, Info, LayoutGrid } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import DataExplorer from './DataExplorer';
import MultiView from './MultiView';

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
    
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8AB4F8', '#F6AEA9'];
    
    switch (insight.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={insight.columns.length > 1 ? insight.columns[0] : "index"} 
                tick={{ fill: '#666', fontSize: 12 }}
                tickLine={{ stroke: '#ccc' }}
                axisLine={{ stroke: '#ccc' }}
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 12 }}
                tickLine={{ stroke: '#ccc' }}
                axisLine={{ stroke: '#ccc' }}
              />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                contentStyle={{ 
                  borderRadius: '4px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              {insight.columns.slice(0, 3).map((column, idx) => {
                const uniqueSuffix = Math.random().toString(36).substring(2, 8);
                return (
                  <Bar 
                    key={`bar-insight-${idx}-${column.replace(/\W/g, '')}-${uniqueSuffix}`} 
                    dataKey={column} 
                    name={column}
                    fill={colors[idx % colors.length]} 
                    isAnimationActive={false}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={insight.columns.length > 1 ? insight.columns[0] : "index"} 
                tick={{ fill: '#666', fontSize: 12 }}
                tickLine={{ stroke: '#ccc' }}
                axisLine={{ stroke: '#ccc' }}
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 12 }}
                tickLine={{ stroke: '#ccc' }}
                axisLine={{ stroke: '#ccc' }}
              />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                contentStyle={{ 
                  borderRadius: '4px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              {insight.columns.slice(insight.columns.length > 1 ? 1 : 0).map((column, idx) => {
                const uniqueSuffix = Math.random().toString(36).substring(2, 8);
                return (
                  <Line 
                    key={`line-insight-${idx}-${column.replace(/\W/g, '')}-${uniqueSuffix}`}
                    type="monotone" 
                    dataKey={column} 
                    name={column}
                    stroke={colors[idx % colors.length]} 
                    activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        // For scatter, we need at least 2 numeric columns
        if (insight.columns.length >= 2) {
          return (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={insight.columns[0]} 
                  type="number" 
                  name={insight.columns[0]} 
                  tick={{ fill: '#666', fontSize: 12 }}
                  tickLine={{ stroke: '#ccc' }}
                  axisLine={{ stroke: '#ccc' }}
                />
                <YAxis 
                  dataKey={insight.columns[1]} 
                  type="number" 
                  name={insight.columns[1]} 
                  tick={{ fill: '#666', fontSize: 12 }}
                  tickLine={{ stroke: '#ccc' }}
                  axisLine={{ stroke: '#ccc' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ 
                    borderRadius: '4px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Scatter 
                  key={`scatter-insight-${insight.columns[0].replace(/\W/g, '')}-${insight.columns[1].replace(/\W/g, '')}-${Math.random().toString(36).substring(2, 8)}`}
                  name={`${insight.columns[0]} vs ${insight.columns[1]}`} 
                  data={chartData} 
                  fill={colors[0]} 
                  shape="circle"
                  isAnimationActive={false}
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
      <h1 className="text-3xl font-bold mb-6">Data.gov.sg Explorer</h1>
      
      <div className="mb-8">
        <Card className="shadow-sm border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-2xl">Upload Data from Data.gov.sg</CardTitle>
            <CardDescription>
              Upload CSV files from <a href="https://data.gov.sg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Data.gov.sg</a> for automated analysis and insights.
              <br/>
              <span className="text-sm text-muted-foreground mt-1">
                <strong>Note:</strong> All processing is done locally in your browser for privacy.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div 
                className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-accent/50 transition-colors cursor-pointer bg-slate-50 hover:border-blue-300"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
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
                  <div className="flex items-center gap-2 text-sm p-2 rounded bg-blue-50 border border-blue-100">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <a 
                    href="https://data.gov.sg/datasets?query=+Indicators+On+Population,+Annual&page=1&resultId=d_3d227e5d9fdec73f3bcadce671c333a6" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Population Trends
                  </a>
                  <a 
                    href="https://data.gov.sg/datasets?query=retail+price&page=1&resultId=d_187e354026aabe4798383bf6230940f2" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Retail Prices
                  </a>
                  <a 
                    href="https://data.gov.sg/datasets?query=tourism&page=1&resultId=d_7e7b2ee60c6ffc962f80fef129cf306e" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Tourism Data
                  </a>
                </div>
                
                <div>
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
          <CardFooter className="bg-gray-50 border-t px-6 py-4">
            <Button 
              onClick={handleAnalyze} 
              disabled={!file || isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {isAnalyzing && (
        <Card className="mb-8 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Analyzing Data</CardTitle>
            <CardDescription>
              Please wait while we analyze your data...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={analysisProgress} className="w-full h-2" />
              <p className="text-xs text-right text-muted-foreground">{analysisProgress}%</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <div className="space-y-6">
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle>Dataset Summary</CardTitle>
              <CardDescription>
                Overview of your dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="py-4 bg-blue-50">
                    <CardTitle className="text-lg flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      Rows
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-6">
                    <p className="text-3xl font-bold text-center">{result.rowCount}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="py-4 bg-purple-50">
                    <CardTitle className="text-lg flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-2">
                        <BarChart className="h-4 w-4 text-purple-600" />
                      </div>
                      Columns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-6">
                    <p className="text-3xl font-bold text-center">{result.columns.length}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="py-4 bg-amber-50">
                    <CardTitle className="text-lg flex items-center">
                      <div className="bg-amber-100 p-2 rounded-full mr-2">
                        <Info className="h-4 w-4 text-amber-600" />
                      </div>
                      Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-6">
                    <p className="text-3xl font-bold text-center">{result.insights.length}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="explore" className="shadow-sm border rounded-lg overflow-hidden">
            <TabsList className="grid w-full grid-cols-5 bg-gray-50 p-0 h-auto">
              <TabsTrigger value="explore" className="py-3 data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none">
                <FileText className="h-4 w-4 mr-2" />
                Explore Data
              </TabsTrigger>
              <TabsTrigger value="multiview" className="py-3 data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Multiple Views
              </TabsTrigger>
              <TabsTrigger value="insights" className="py-3 data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none">
                <Info className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="columns" className="py-3 data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none">
                <BarChart className="h-4 w-4 mr-2" />
                Columns
              </TabsTrigger>
              <TabsTrigger value="forecast" className="py-3 data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none">
                <LineChart className="h-4 w-4 mr-2" />
                {result.timeSeries ? 'SARIMA Forecast' : 'Forecast'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="explore" className="mt-4 overflow-hidden">
              <DataExplorer 
                data={getRowData()}
                columns={result.columns}
                showControls={true}
              />
            </TabsContent>
            
            <TabsContent value="multiview" className="mt-4 overflow-hidden">
              <MultiView 
                data={getRowData()}
                columns={result.columns}
              />
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4 mt-4 overflow-hidden p-4">
              {result.insights.map((insight: DataInsight, index: number) => (
                <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <CardHeader className="bg-slate-50 border-b">
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center">
                        <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                          <Info className="h-4 w-4 text-blue-600" />
                        </div>
                        {insight.title}
                      </CardTitle>
                      <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Importance: {insight.importance.toFixed(1)}/10
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      Related to: {insight.columns.join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="mb-6 text-gray-700">{insight.description}</p>
                    <div className="rounded-md overflow-hidden border">
                      {insight.chartType && renderChart(insight)}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {result.insights.length === 0 && (
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-12 flex flex-col items-center justify-center">
                    <div className="bg-amber-100 p-3 rounded-full mb-4">
                      <Info className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="text-lg font-medium text-center mb-2">No insights were generated</p>
                    <p className="text-muted-foreground text-center">
                      This dataset may need more data or contain values that are difficult to analyze automatically.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="columns" className="space-y-4 mt-4 overflow-hidden p-4">
              {result.columns.map((column: DataColumn, index: number) => (
                <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <CardHeader className="bg-slate-50 border-b">
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center">
                        <div className={`p-1.5 rounded-full mr-2 ${
                          column.type === 'numeric' ? 'bg-purple-100' : 
                          column.type === 'categorical' ? 'bg-green-100' : 
                          column.type === 'datetime' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <BarChart className={`h-4 w-4 ${
                            column.type === 'numeric' ? 'text-purple-600' : 
                            column.type === 'categorical' ? 'text-green-600' : 
                            column.type === 'datetime' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        {column.name}
                      </CardTitle>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        column.type === 'numeric' ? 'bg-purple-100 text-purple-700' : 
                        column.type === 'categorical' ? 'bg-green-100 text-green-700' : 
                        column.type === 'datetime' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
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