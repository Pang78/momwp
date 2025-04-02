'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Download,
  Share, 
  FileText,
  Code
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartExportProps {
  chartRef: React.RefObject<HTMLDivElement>;
  chartTitle: string;
  chartType: string;
  data: Record<string, unknown>[];
  xAxis: string;
  yAxis: string;
  exportOptions?: {
    includeData?: boolean;
    includeCode?: boolean;
  };
}

export function ChartExport({
  chartRef,
  chartTitle,
  chartType,
  data,
  xAxis,
  yAxis,
  exportOptions = { includeData: true, includeCode: true }
}: ChartExportProps) {
  const exportAsImage = async () => {
    if (!chartRef.current) return;
    
    try {
      // Dynamically import html2canvas for client-side rendering
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${chartTitle || 'chart'}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting chart as image:', error);
      alert('Failed to export chart as image. Please try again.');
    }
  };

  const exportAsCSV = () => {
    try {
      // Convert data to CSV format
      const headers = Object.keys(data[0] || {});
      const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => 
          headers.map(header => {
            // Handle values that need escaping (commas, quotes)
            const value = row[header];
            const valueStr = String(value ?? '');
            return valueStr.includes(',') || valueStr.includes('"') 
              ? `"${valueStr.replace(/"/g, '""')}"` 
              : valueStr;
          }).join(',')
        )
      ];
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${chartTitle || 'data'}-${new Date().toISOString().slice(0, 10)}.csv`);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data as CSV:', error);
      alert('Failed to export data as CSV. Please try again.');
    }
  };

  const shareChart = async () => {
    if (!chartRef.current) return;
    
    try {
      // Dynamically import html2canvas for client-side rendering
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
      });
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/png');
      });
      
      // Use Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: chartTitle || 'Chart',
            text: `Check out this ${chartType} chart of ${yAxis} by ${xAxis}`,
            files: [new File([blob], `${chartTitle || 'chart'}.png`, { type: 'image/png' })]
          });
          return;
        } catch (error) {
          console.warn('Web Share API failed, falling back to clipboard', error);
        }
      }
      
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        alert('Chart copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy chart to clipboard:', error);
        alert('Failed to share chart. Please try exporting and sharing manually.');
      }
    } catch (error) {
      console.error('Error sharing chart:', error);
      alert('Failed to share chart. Please try exporting and sharing manually.');
    }
  };

  const getCodeSnippet = () => {
    // Generate a React code snippet with recharts based on the current chart configuration
    const codeLines = [
      "import React from 'react';",
      "import { " + 
        chartType.charAt(0).toUpperCase() + chartType.slice(1) + "Chart, " + 
        chartType.charAt(0).toUpperCase() + chartType.slice(1) + ", " + 
        "XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';",
      "",
      "const data = " + JSON.stringify(data.slice(0, 5), null, 2) + ";",
      "// ... more data items",
      "",
      "export function MyChart() {",
      "  return (",
      "    <div style={{ width: '100%', height: 400 }}>",
      "      <ResponsiveContainer>",
      "        <" + chartType.charAt(0).toUpperCase() + chartType.slice(1) + "Chart data={data}>",
      "          <CartesianGrid strokeDasharray=\"3 3\" />",
      "          <XAxis dataKey=\"" + xAxis + "\" />",
      "          <YAxis />",
      "          <Tooltip />",
      "          <Legend />",
      "          <" + chartType.charAt(0).toUpperCase() + chartType.slice(1) + " dataKey=\"" + yAxis + "\" fill=\"#8884d8\" />",
      "        </" + chartType.charAt(0).toUpperCase() + chartType.slice(1) + "Chart>",
      "      </ResponsiveContainer>",
      "    </div>",
      "  );",
      "}",
    ];
    
    return codeLines.join('\n');
  };

  const copyCodeSnippet = () => {
    try {
      navigator.clipboard.writeText(getCodeSnippet());
      alert('Code snippet copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy code snippet:', error);
      alert('Failed to copy code snippet. Please try again.');
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">Export Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={exportAsImage}
            className="flex items-center gap-2 justify-center"
          >
            <Download className="h-4 w-4" />
            <span>Save as Image</span>
          </Button>
          
          {exportOptions.includeData && (
            <Button 
              variant="outline" 
              onClick={exportAsCSV}
              className="flex items-center gap-2 justify-center"
            >
              <FileText className="h-4 w-4" />
              <span>Export Data (CSV)</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={shareChart}
            className="flex items-center gap-2 justify-center"
          >
            <Share className="h-4 w-4" />
            <span>Share Chart</span>
          </Button>
          
          {exportOptions.includeCode && (
            <Button 
              variant="outline" 
              onClick={copyCodeSnippet}
              className="flex items-center gap-2 justify-center"
            >
              <Code className="h-4 w-4" />
              <span>Copy Code</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 