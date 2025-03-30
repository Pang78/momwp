'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataRecord } from '@/lib/api/datagovsg';

interface DataChartProps {
  data: DataRecord[];
  fields: Array<{ id: string; type: string }>;
  isLoading: boolean;
}

// Chart data type for more specific typing
interface ChartDataItem {
  [key: string]: string | number;
  count: number;
}

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#6A7FDB'];

const DataChart = ({ data, fields, isLoading }: DataChartProps) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxisField, setXAxisField] = useState('');
  const [yAxisField, setYAxisField] = useState('');

  // Initialize x and y field selections when fields become available
  useMemo(() => {
    if (fields.length > 0 && (!xAxisField || !yAxisField)) {
      // Try to find a good default for x-axis (string or date field)
      const stringField = fields.find(f => f.type === 'text')?.id || fields[0]?.id;
      setXAxisField(stringField || '');
      
      // Try to find a numeric field for y-axis
      const numericField = fields.find(f => f.type === 'numeric')?.id || fields[0]?.id;
      if (numericField !== stringField) {
        setYAxisField(numericField || '');
      } else if (fields.length > 1) {
        setYAxisField(fields[1].id);
      } else {
        setYAxisField(fields[0]?.id || '');
      }
    }
  }, [fields, xAxisField, yAxisField]);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data.length || !xAxisField || !yAxisField) return [];
    
    // Group by x-axis value and sum y-axis values
    const groupedData = data.reduce<Record<string, ChartDataItem>>((acc, item) => {
      const xValue = String(item[xAxisField] || 'Unknown');
      if (!acc[xValue]) {
        acc[xValue] = { [xAxisField]: xValue, [yAxisField]: 0, count: 0 };
      }
      
      // For numeric fields, sum them up. For others, count occurrences
      const yValue = parseFloat(String(item[yAxisField]));
      if (!isNaN(yValue)) {
        acc[xValue][yAxisField] = (acc[xValue][yAxisField] as number) + yValue;
      }
      acc[xValue].count += 1;
      
      return acc;
    }, {});
    
    // Convert back to array and limit to top 20 items
    return Object.values(groupedData)
      .sort((a, b) => (b[yAxisField] as number) - (a[yAxisField] as number))
      .slice(0, 20);
  }, [data, xAxisField, yAxisField]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">No data available for visualization</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Data Visualization</CardTitle>
        <div className="flex flex-wrap gap-4 mt-2">
          <div className="space-y-1">
            <p className="text-sm">Chart Type</p>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-sm">X-Axis</p>
            <Select value={xAxisField} onValueChange={setXAxisField}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select X-Axis" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-sm">Y-Axis</p>
            <Select value={yAxisField} onValueChange={setYAxisField}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Y-Axis" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[400px] w-full">
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisField} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={yAxisField} fill="#8884d8" />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisField} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={yAxisField} stroke="#8884d8" />
              </LineChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey={yAxisField}
                  nameKey={xAxisField}
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataChart; 