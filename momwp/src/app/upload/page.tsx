"use client";

import { useState } from "react";
import { FileUpload } from "@/components/upload/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { Info } from "lucide-react";

export default function UploadPage() {
  const [uploadedData, setUploadedData] = useState<Record<string, string>[] | null>(null);
  const [uploadStep, setUploadStep] = useState<"upload" | "preview" | "analyze">("upload");

  const handleFileProcessed = (data: Record<string, string>[]) => {
    setUploadedData(data);
    setUploadStep("preview");
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
          <p className="text-muted-foreground">
            Upload CSV files to analyze and visualize your data
          </p>
        </div>

        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="csv">CSV Files</TabsTrigger>
            <TabsTrigger value="api" disabled>
              API Data (Coming Soon)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="csv" className="mt-6">
            {uploadStep === "upload" && (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload a CSV File</CardTitle>
                    <CardDescription>
                      Upload your data in CSV format for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload onFileProcessed={handleFileProcessed} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">CSV Format Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="ml-6 list-disc text-sm text-muted-foreground space-y-2">
                      <li>Ensure your CSV has headers in the first row</li>
                      <li>For time series data, include a date/time column</li>
                      <li>Clean your data from missing values or outliers</li>
                      <li>For best results, keep file size under 10MB</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {uploadStep === "preview" && uploadedData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Preview</CardTitle>
                    <CardDescription>
                      Preview of your uploaded data ({uploadedData.length} rows)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              {Object.keys(uploadedData[0] || {}).map((key) => (
                                <th key={key} className="whitespace-nowrap px-4 py-3 text-left font-medium">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {uploadedData.slice(0, 5).map((row, i) => (
                              <tr key={i} className="border-b">
                                {Object.values(row).map((value, j) => (
                                  <td key={j} className="whitespace-nowrap px-4 py-3">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-end p-4 gap-4">
                        <Button variant="outline" onClick={() => setUploadStep("upload")}>
                          Upload Another File
                        </Button>
                        <Button onClick={() => setUploadStep("analyze")}>
                          Analyze Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {uploadStep === "analyze" && uploadedData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Options</CardTitle>
                    <CardDescription>
                      Choose analysis method for your data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border border-primary/20 bg-primary/5 hover:border-primary/50 transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">SARIMA Analysis</CardTitle>
                          <CardDescription>
                            Time series forecasting with seasonal components
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Best for data with seasonal patterns, trends, and cyclical components.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border hover:border-muted/80 transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">Basic Statistics</CardTitle>
                          <CardDescription>
                            Descriptive statistics and correlations
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Summary statistics, distributions, and relationships between variables.
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setUploadStep("preview")}>
                        Back to Preview
                      </Button>
                      <Button>
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
} 