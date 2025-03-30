'use client';

import Papa from 'papaparse';
import * as ss from 'simple-statistics';
import { Matrix } from 'ml-matrix';
import regression from 'regression';
import * as jstat from 'jstat';
import { SavitzkyGolay } from 'ml-savitzky-golay';

// Types for our data analysis
export interface DataColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'unknown';
  values: any[];
  summary?: ColumnSummary;
}

export interface ColumnSummary {
  // For numeric columns
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  // For categorical columns
  uniqueValues?: { value: string; count: number }[];
  // For datetime columns
  dateRange?: { start: Date; end: Date };
  // For all columns
  missingValues: number;
  missingPercent: number;
}

export interface DataInsight {
  type: 'correlation' | 'outlier' | 'trend' | 'seasonality' | 'distribution' | 'summary';
  title: string;
  description: string;
  importance: number; // 0-10 scale
  columns: string[];
  chartData?: any;
  chartType?: string;
}

export interface AnalysisResult {
  columns: DataColumn[];
  rowCount: number;
  insights: DataInsight[];
  cleanedData?: any[][];
  timeSeries?: {
    modelType: string;
    forecast: number[];
    mape: number; // Mean Absolute Percentage Error
    params?: any;
  };
}

/**
 * Parse a CSV file and return the structured data
 */
export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Detect column types based on values
 */
export const detectColumnTypes = (data: any[]): DataColumn[] => {
  if (!data.length) return [];

  const columnNames = Object.keys(data[0]);
  const columns: DataColumn[] = columnNames.map(name => {
    const values = data.map(row => row[name]);
    
    // Detect type based on non-null values
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullValues.length === 0) {
      return { name, type: 'unknown', values };
    }

    // Check if it's a date column
    const dateCount = nonNullValues.filter(v => {
      if (typeof v === 'string') {
        const parsedDate = new Date(v);
        return !isNaN(parsedDate.getTime());
      }
      return false;
    }).length;
    
    if (dateCount > nonNullValues.length * 0.8) {
      return { name, type: 'datetime', values };
    }

    // Check if it's a numeric column
    const numCount = nonNullValues.filter(v => 
      (typeof v === 'number') || 
      (typeof v === 'string' && !isNaN(Number(v)))
    ).length;
    
    if (numCount > nonNullValues.length * 0.8) {
      return { name, type: 'numeric', values };
    }

    // Default to categorical
    return { name, type: 'categorical', values };
  });

  return columns;
};

/**
 * Generate column summaries
 */
export const generateColumnSummaries = (columns: DataColumn[]): DataColumn[] => {
  return columns.map(column => {
    const values = column.values;
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const missingValues = values.length - nonNullValues.length;
    
    const summary: ColumnSummary = {
      missingValues,
      missingPercent: (missingValues / values.length) * 100
    };

    if (column.type === 'numeric') {
      // Convert string numbers to actual numbers
      const numValues = nonNullValues.map(v => typeof v === 'string' ? Number(v) : v);
      summary.min = ss.min(numValues as number[]);
      summary.max = ss.max(numValues as number[]);
      summary.mean = ss.mean(numValues as number[]);
      summary.median = ss.median(numValues as number[]);
      summary.stdDev = ss.standardDeviation(numValues as number[]);
    } 
    else if (column.type === 'categorical') {
      // Count occurrences of each value
      const counts: Record<string, number> = {};
      nonNullValues.forEach(v => {
        const key = String(v);
        counts[key] = (counts[key] || 0) + 1;
      });
      
      summary.uniqueValues = Object.entries(counts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    }
    else if (column.type === 'datetime') {
      // Convert to dates and find range
      const dates = nonNullValues
        .map(v => new Date(v))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (dates.length > 0) {
        summary.dateRange = {
          start: dates[0],
          end: dates[dates.length - 1]
        };
      }
    }

    return { ...column, summary };
  });
};

/**
 * Clean data by handling missing values, outliers, etc.
 */
export const cleanData = (columns: DataColumn[]): { columns: DataColumn[], cleanedData: any[][] } => {
  // Remove rows with too many missing values (>50%)
  const rowCount = columns[0].values.length;
  const validRows = new Array(rowCount).fill(true);
  
  // Mark rows with too many missing values
  for (let i = 0; i < rowCount; i++) {
    let missingCount = 0;
    columns.forEach(col => {
      if (col.values[i] === null || col.values[i] === undefined || col.values[i] === '') {
        missingCount++;
      }
    });
    
    if (missingCount > columns.length * 0.5) {
      validRows[i] = false;
    }
  }
  
  // Filter out invalid rows and handle missing values in remaining rows
  const cleanedColumns = columns.map(col => {
    const newValues = col.values
      .filter((_, i) => validRows[i])
      .map((val, i) => {
        if (val === null || val === undefined || val === '') {
          // Impute missing values
          if (col.type === 'numeric' && col.summary?.mean !== undefined) {
            return col.summary.mean;
          } else if (col.type === 'categorical' && col.summary?.uniqueValues?.length) {
            // Use most common value
            return col.summary.uniqueValues[0].value;
          }
          return val; // Keep as is for other types
        }
        return val;
      });
    
    return { ...col, values: newValues };
  });
  
  // Convert to 2D array for easier processing
  const cleanedData = Array(cleanedColumns[0].values.length).fill(0).map((_, rowIndex) => {
    return cleanedColumns.map(col => col.values[rowIndex]);
  });
  
  return { columns: cleanedColumns, cleanedData };
};

/**
 * Generate basic insights from data
 */
export const generateInsights = (columns: DataColumn[]): DataInsight[] => {
  const insights: DataInsight[] = [];
  
  // Generate general summary insight
  insights.push({
    type: 'summary',
    title: 'Dataset Overview',
    description: `This dataset contains ${columns[0].values.length} rows and ${columns.length} columns.`,
    importance: 10,
    columns: columns.map(c => c.name)
  });
  
  // Generate insights for numeric columns
  const numericColumns = columns.filter(col => col.type === 'numeric');
  
  // Find correlations between numeric columns
  if (numericColumns.length >= 2) {
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        // Calculate correlation only for rows where both values exist
        const pairs = col1.values.map((v, idx) => [v, col2.values[idx]])
          .filter(pair => pair[0] !== null && pair[1] !== null);
        
        if (pairs.length > 5) { // Only if we have enough data points
          const x = pairs.map(p => p[0]) as number[];
          const y = pairs.map(p => p[1]) as number[];
          
          try {
            const correlation = ss.sampleCorrelation(x, y);
            
            if (!isNaN(correlation) && Math.abs(correlation) > 0.5) {
              insights.push({
                type: 'correlation',
                title: `Strong ${correlation > 0 ? 'positive' : 'negative'} correlation detected`,
                description: `${col1.name} and ${col2.name} have a correlation of ${correlation.toFixed(2)}.`,
                importance: Math.abs(correlation) * 8,
                columns: [col1.name, col2.name],
                chartType: 'scatter'
              });
            }
          } catch (e) {
            console.error(`Error calculating correlation between ${col1.name} and ${col2.name}:`, e);
          }
        }
      }
    }
  }
  
  // Check for outliers in numeric columns
  numericColumns.forEach(col => {
    if (col.summary?.stdDev && col.summary?.mean) {
      const outliers = col.values.filter(v => 
        v !== null && 
        Math.abs(v - col.summary!.mean!) > 3 * col.summary!.stdDev!
      );
      
      if (outliers.length > 0) {
        const outlierPercent = (outliers.length / col.values.length) * 100;
        
        insights.push({
          type: 'outlier',
          title: `Outliers detected in ${col.name}`,
          description: `${outliers.length} outliers (${outlierPercent.toFixed(1)}% of values) were found in ${col.name}.`,
          importance: Math.min(outlierPercent, 10),
          columns: [col.name],
          chartType: 'boxplot'
        });
      }
    }
  });
  
  // Check for time series data and seasonality
  const dateColumns = columns.filter(col => col.type === 'datetime');
  
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    dateColumns.forEach(dateCol => {
      numericColumns.forEach(numCol => {
        // Convert to valid date-value pairs
        const dateValues = dateCol.values.map((d, i) => {
          const date = new Date(d);
          const value = numCol.values[i];
          if (!isNaN(date.getTime()) && value !== null) {
            return { date, value };
          }
          return null;
        }).filter(item => item !== null) as { date: Date; value: number }[];
        
        if (dateValues.length > 10) { // Enough data points for time series analysis
          // Sort by date
          dateValues.sort((a, b) => a.date.getTime() - b.date.getTime());
          
          // Check for trend using simple linear regression
          const data = dateValues.map((item, i) => [i, item.value]);
          const result = regression.linear(data as [number, number][]);
          const slope = result.equation[0];
          
          if (Math.abs(slope) > 0.01) {
            insights.push({
              type: 'trend',
              title: `${slope > 0 ? 'Upward' : 'Downward'} trend detected`,
              description: `${numCol.name} shows a ${slope > 0 ? 'rising' : 'falling'} trend over time.`,
              importance: Math.min(Math.abs(slope) * 100, 9),
              columns: [dateCol.name, numCol.name],
              chartType: 'line'
            });
          }
        }
      });
    });
  }
  
  // Check distribution of categorical columns
  const catColumns = columns.filter(col => col.type === 'categorical');
  
  catColumns.forEach(col => {
    if (col.summary?.uniqueValues) {
      const uniqueCount = col.summary.uniqueValues.length;
      const totalCount = col.values.length;
      
      if (uniqueCount < totalCount * 0.1 && uniqueCount > 1 && uniqueCount < 15) {
        // We have a good categorical column with reasonable distribution
        const topCategories = col.summary.uniqueValues.slice(0, 5);
        const topCategoriesPercent = topCategories.reduce((sum, item) => sum + item.count, 0) / totalCount * 100;
        
        insights.push({
          type: 'distribution',
          title: `Distribution analysis for ${col.name}`,
          description: `The top ${topCategories.length} values account for ${topCategoriesPercent.toFixed(1)}% of all values.`,
          importance: 6,
          columns: [col.name],
          chartType: 'bar'
        });
      }
    }
  });
  
  return insights.sort((a, b) => b.importance - a.importance);
};

/**
 * Simplified SARIMA-inspired forecasting using JavaScript
 * 
 * This is a very simplified approach since full SARIMA requires complex calculations
 * that are typically done in specialized statistical libraries.
 * 
 * Limitations:
 * - Uses exponential smoothing with seasonal adjustments
 * - Less accurate than proper SARIMA from Python statsmodels
 * - Limited to simpler patterns
 */
export const performTimeSeries = (
  data: number[], 
  period: number = 7, // Default period (e.g., 7 for weekly seasonality)
  forecastSteps: number = 10
): { forecast: number[], mape: number } => {
  if (data.length < period * 2) {
    throw new Error(`Need at least ${period * 2} data points for forecasting. Currently have ${data.length}.`);
  }

  try {
    // Smooth data to reduce noise
    const options = {
      windowSize: Math.min(9, Math.floor(data.length / 3)),
      derivative: 0,
      polynomial: 2
    };
    const smoothedData = SavitzkyGolay.savitzkyGolay(data, 1, options);
    
    // Determine seasonality
    const seasonalPatterns: number[] = [];
    for (let i = 0; i < period; i++) {
      const seasonalValues: number[] = [];
      for (let j = i; j < data.length; j += period) {
        seasonalValues.push(data[j]);
      }
      seasonalPatterns.push(ss.mean(seasonalValues));
    }
    
    // Normalize seasonal patterns
    const seasonalMean = ss.mean(seasonalPatterns);
    const seasonalFactors = seasonalPatterns.map(v => v / seasonalMean);
    
    // Deseasonalize
    const deseasonalized = data.map((v, i) => v / seasonalFactors[i % period]);
    
    // Fit linear trend on deseasonalized data
    const points = deseasonalized.map((y, x) => [x, y]);
    const trend = regression.linear(points as [number, number][]);
    
    // Generate forecast
    const forecast: number[] = [];
    for (let i = 0; i < forecastSteps; i++) {
      const x = data.length + i;
      // Get trend component
      const trendValue = trend.predict(x)[1];
      // Apply seasonal factor
      const seasonalIndex = (data.length + i) % period;
      const forecastValue = trendValue * seasonalFactors[seasonalIndex];
      forecast.push(forecastValue);
    }
    
    // Calculate MAPE on last n values as a validation
    const testSize = Math.min(forecastSteps, Math.floor(data.length * 0.2));
    const testData = data.slice(-testSize);
    let totalError = 0;
    
    for (let i = 0; i < testSize; i++) {
      const x = data.length - testSize + i;
      const predictedValue = trend.predict(x)[1] * seasonalFactors[x % period];
      const actualValue = testData[i];
      totalError += Math.abs((actualValue - predictedValue) / actualValue);
    }
    
    const mape = (totalError / testSize) * 100;
    
    return { forecast, mape };
  } catch (e) {
    console.error('Error in time series forecasting:', e);
    throw e;
  }
};

/**
 * Run all analysis steps on a dataset
 */
export const analyzeData = async (file: File): Promise<AnalysisResult> => {
  try {
    // 1. Parse the CSV
    const parsedData = await parseCSV(file);
    
    // 2. Detect column types
    let columns = detectColumnTypes(parsedData);
    
    // 3. Generate column summaries
    columns = generateColumnSummaries(columns);
    
    // 4. Clean the data
    const { columns: cleanedColumns, cleanedData } = cleanData(columns);
    
    // 5. Generate insights
    const insights = generateInsights(cleanedColumns);
    
    // 6. Check for time series and run forecast if found
    let timeSeries = undefined;
    
    // Look for date column and numeric column pairs
    const dateColumns = cleanedColumns.filter(col => col.type === 'datetime');
    const numericColumns = cleanedColumns.filter(col => col.type === 'numeric');
    
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      const dateCol = dateColumns[0];
      const numCol = numericColumns[0];
      
      // Convert to valid date-value pairs
      const dateValues = dateCol.values
        .map((d, i) => {
          const date = new Date(d);
          const value = numCol.values[i];
          if (!isNaN(date.getTime()) && value !== null) {
            return { date, value };
          }
          return null;
        })
        .filter(item => item !== null) as { date: Date; value: number }[];
      
      if (dateValues.length > 20) { // Need enough data for forecasting
        // Sort by date
        dateValues.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Extract values as time series
        const timeSeriesData = dateValues.map(item => item.value);
        
        // Try to detect seasonality
        // Simplistic approach: try common periods (7=weekly, 12=monthly, 4=quarterly)
        const commonPeriods = [7, 12, 4, 30];
        let bestPeriod = 7; // Default to weekly
        
        if (timeSeriesData.length >= 2 * Math.max(...commonPeriods)) {
          bestPeriod = commonPeriods.reduce((best, period) => {
            // Simple seasonality check
            const correlations: number[] = [];
            for (let i = 0; i < period; i++) {
              const subset1: number[] = [];
              const subset2: number[] = [];
              
              for (let j = i; j < timeSeriesData.length - period; j += period) {
                subset1.push(timeSeriesData[j]);
                subset2.push(timeSeriesData[j + period]);
              }
              
              if (subset1.length > 5 && subset2.length > 5) {
                try {
                  correlations.push(ss.sampleCorrelation(subset1, subset2));
                } catch (e) {
                  correlations.push(0);
                }
              }
            }
            
            const avgCorrelation = correlations.reduce((sum, c) => sum + (isNaN(c) ? 0 : c), 0) / 
                                 correlations.filter(c => !isNaN(c)).length;
            
            return avgCorrelation > best.correlation ? { period, correlation: avgCorrelation } : best;
          }, { period: bestPeriod, correlation: 0 }).period;
        }
        
        // Run forecasting
        const { forecast, mape } = performTimeSeries(timeSeriesData, bestPeriod, 10);
        
        timeSeries = {
          modelType: 'Simplified SARIMA',
          forecast,
          mape,
          params: { period: bestPeriod }
        };
      }
    }
    
    return {
      columns: cleanedColumns,
      rowCount: cleanedColumns[0].values.length,
      insights,
      cleanedData,
      timeSeries
    };
  } catch (error) {
    console.error('Error analyzing data:', error);
    throw error;
  }
}; 