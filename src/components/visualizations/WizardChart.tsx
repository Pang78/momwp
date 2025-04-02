'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Define the chart types and templates
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar' | 'composed';
export type ChartTemplate = 'basic' | 'stacked' | 'comparison' | 'time-series' | 'distribution' | 'correlation' | 'radar';

// Define the component props
interface WizardChartProps {
  data: any[];
  chartType: ChartType;
  chartTemplate: ChartTemplate;
  xAxisKey: string;
  yAxisKey: string;
  secondaryYAxisKey?: string;
  title?: string;
  colorPalette?: string[];
}

// Create a dynamic import for recharts
const RechartsModule = dynamic(() => import('./WizardChartContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 w-full">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  )
});

export function WizardChart(props: WizardChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState<boolean>(false);

  // Export chart as image
  const handleExport = async () => {
    if (chartRef.current) {
      try {
        setIsExporting(true);
        // Dynamically import html2canvas and file-saver on client side only
        const html2canvas = (await import('html2canvas')).default;
        const { saveAs } = await import('file-saver');
        
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: null,
          scale: 2, // Higher quality export
          logging: false,
          allowTaint: true,
          useCORS: true
        });
        
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `${props.title || 'chart'}-${new Date().toISOString().slice(0, 10)}.png`);
          }
          setIsExporting(false);
        }, 'image/png', 1.0);
      } catch (error) {
        console.error('Error exporting chart:', error);
        alert('Failed to export chart. Please try again.');
        setIsExporting(false);
      }
    }
  };

  return (
    <div className="relative border rounded-lg p-4 bg-white dark:bg-gray-950">
      {props.title && (
        <h3 className="text-lg font-medium mb-4 text-center">{props.title}</h3>
      )}
      
      <div ref={chartRef} className="w-full">
        <RechartsModule {...props} />
      </div>
      
      <div className="absolute top-2 right-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1"
        >
          {isExporting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="sr-only md:not-sr-only">Exporting...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span className="sr-only md:not-sr-only">Export</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 