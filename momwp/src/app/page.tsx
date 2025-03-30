"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileUp, TrendingUp, LineChart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <PageLayout>
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
          Data Visualization & Analysis
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          Upload, analyze, and visualize your data with powerful tools and insights.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/upload">
            <Button size="lg" className="h-11 px-8">
              Get Started
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg" className="h-11 px-8">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12" id="features">
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
              Features
            </h2>
            <p className="max-w-[85%] text-muted-foreground">
              Our platform offers comprehensive tools for your data analytics needs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <FileUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Data Upload</CardTitle>
                </div>
                <CardDescription>
                  Easy CSV upload and processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload your CSV data files and automatically process them for analysis and visualization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Visualization</CardTitle>
                </div>
                <CardDescription>
                  Interactive data visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create beautiful charts and graphs to better understand your data patterns and insights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">SARIMA Analysis</CardTitle>
                </div>
                <CardDescription>
                  Advanced time series forecasting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Apply Seasonal ARIMA models to predict future trends in your time series data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <LineChart className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Data Insights</CardTitle>
                </div>
                <CardDescription>
                  Comprehensive data analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get detailed statistical analysis and insights from your datasets.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
              Ready to analyze your data?
            </h2>
            <p className="max-w-[85%] text-muted-foreground">
              Start using our powerful data visualization and analysis tools today
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link href="/upload">
              <Button size="lg" className="h-11 px-8">
                Upload Your Data
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
