'use client';

import DataAnalyzer from '@/app/components/DataAnalyzer';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AnalyzePage() {
  const router = useRouter();

  const goToHomePage = () => {
    console.log('Navigating to home from Analyze page');
    try {
      router.push('/');
    } catch (e) {
      console.error('Router navigation failed, using window.location', e);
      window.location.href = '/';
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8 lg:p-12 pt-20">
      <div className="mb-8 max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={goToHomePage} 
          className="mb-4 flex items-center"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
        
        <h1 className="text-4xl font-bold mb-4">Data Analysis Tool</h1>
        <p className="text-xl text-gray-600 mb-6">
          Upload CSV data for AI-powered analysis, including statistical insights, correlations, and forecasting.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">Automated Insights</h3>
            <p className="text-sm text-gray-600">Discover patterns, correlations, and outliers in your data automatically.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">Time Series Forecasting</h3>
            <p className="text-sm text-gray-600">Predict future values with simplified SARIMA-inspired algorithms.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">Data Visualization</h3>
            <p className="text-sm text-gray-600">View your data with interactive charts and graphical representations.</p>
          </div>
        </div>
      </div>
      <DataAnalyzer />
    </main>
  );
} 