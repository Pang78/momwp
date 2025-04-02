'use client';

import React from 'react';
import { ChartTemplate } from './WizardChart';
import { Card } from '@/components/ui/card';

interface ChartTemplateSelectorProps {
  value: ChartTemplate;
  onChange: (template: ChartTemplate) => void;
  chartType: string;
}

interface TemplateOption {
  id: ChartTemplate;
  title: string;
  description: string;
  compatibleWith: string[];
  icon: React.ReactNode;
}

export function ChartTemplateSelector({
  value,
  onChange,
  chartType
}: ChartTemplateSelectorProps) {
  // Template options
  const templateOptions: TemplateOption[] = [
    {
      id: 'basic',
      title: 'Basic',
      description: 'Standard chart with no additional features',
      compatibleWith: ['bar', 'line', 'pie', 'scatter', 'area', 'radar'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="8" x2="9" y2="16" strokeWidth="2" />
          <line x1="15" y1="12" x2="15" y2="16" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'stacked',
      title: 'Stacked',
      description: 'Show multiple categories stacked on each other',
      compatibleWith: ['bar', 'area'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="6" y="14" width="4" height="4" fill="currentColor" opacity="0.3" />
          <rect x="6" y="10" width="4" height="4" fill="currentColor" opacity="0.6" />
          <rect x="6" y="6" width="4" height="4" fill="currentColor" opacity="0.9" />
          <rect x="14" y="14" width="4" height="4" fill="currentColor" opacity="0.3" />
          <rect x="14" y="10" width="4" height="4" fill="currentColor" opacity="0.6" />
        </svg>
      )
    },
    {
      id: 'comparison',
      title: 'Comparison',
      description: 'Compare two metrics side by side',
      compatibleWith: ['bar', 'line', 'composed'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7" y1="16" x2="7" y2="10" strokeWidth="2" />
          <line x1="12" y1="16" x2="12" y2="8" strokeWidth="2" />
          <line x1="17" y1="16" x2="17" y2="12" strokeWidth="2" />
          <path d="M6 6 L18 6" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      )
    },
    {
      id: 'time-series',
      title: 'Time Series',
      description: 'Show data over time with trend analysis',
      compatibleWith: ['line', 'area', 'composed'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M4 16 L8 12 L12 14 L20 6" strokeWidth="2" />
          <path d="M4 20 L20 20" strokeWidth="1" />
        </svg>
      )
    },
    {
      id: 'distribution',
      title: 'Distribution',
      description: 'Visualize data distribution and frequencies',
      compatibleWith: ['bar', 'area'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="6" y="14" width="2" height="4" fill="currentColor" />
          <rect x="9" y="10" width="2" height="8" fill="currentColor" />
          <rect x="12" y="8" width="2" height="10" fill="currentColor" />
          <rect x="15" y="12" width="2" height="6" fill="currentColor" />
          <rect x="18" y="15" width="2" height="3" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'correlation',
      title: 'Correlation',
      description: 'Analyze relationships between variables',
      compatibleWith: ['scatter'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
          <path d="M6 16 L18 6" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      )
    },
    {
      id: 'radar',
      title: 'Radar',
      description: 'Compare multiple variables on a radar chart',
      compatibleWith: ['radar'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <polygon points="12,7 16,10 14,15 10,15 8,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      )
    }
  ];

  // Filter templates compatible with current chart type
  const compatibleTemplates = templateOptions.filter(
    template => template.compatibleWith.includes(chartType)
  );

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium mb-2">Chart Template</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {compatibleTemplates.map((template) => (
          <Card
            key={template.id}
            className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
              value === template.id ? 'border-primary ring-1 ring-primary' : ''
            }`}
            onClick={() => onChange(template.id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`mb-2 ${value === template.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {template.icon}
              </div>
              <div className="text-sm font-medium">{template.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 