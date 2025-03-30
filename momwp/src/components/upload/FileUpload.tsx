'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileProcessed: (data: Record<string, string>[]) => void;
  maxSize?: number; // in MB
  className?: string;
  acceptedFileTypes?: string[];
}

export function FileUpload({
  onFileProcessed,
  maxSize = 10, // 10MB default
  className,
  acceptedFileTypes = [".csv"],
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileType = file.name.substring(file.name.lastIndexOf("."));
    if (!acceptedFileTypes.includes(fileType.toLowerCase())) {
      setError(
        `Invalid file type. Please upload one of the following: ${acceptedFileTypes.join(
          ", "
        )}`
      );
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the ${maxSize}MB limit.`);
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate processing progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 100);

      // Read the file as text
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // Process CSV data
      const rows = text.split("\n");
      const headers = rows[0].split(",");
      const data = rows.slice(1).map((row) => {
        const values = row.split(",");
        return headers.reduce((obj: Record<string, string>, header, index) => {
          obj[header.trim()] = values[index]?.trim() || "";
          return obj;
        }, {});
      });

      // Clear the interval if it's still running
      clearInterval(interval);
      setProgress(100);
      setIsComplete(true);
      setIsProcessing(false);

      // Pass the processed data to the parent component
      onFileProcessed(data);
    } catch (error) {
      setError("Failed to process the file. Please try again.");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile);
        processFile(droppedFile);
      }
    },
    [acceptedFileTypes, maxSize]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile);
        processFile(selectedFile);
      }
    },
    [acceptedFileTypes, maxSize]
  );

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setFile(null);
    setError(null);
    setProgress(0);
    setIsComplete(false);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "w-full rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border bg-background",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes.join(",")}
        className="hidden"
      />

      {!file && !isProcessing && (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload
              className="h-8 w-8 text-primary"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium">Upload a CSV File</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop a CSV file here, or click to browse
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Maximum file size: {maxSize}MB
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            className="mt-2"
          >
            Select File
          </Button>
        </div>
      )}

      {file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetUpload}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Processing file...</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {isComplete && (
            <div className="flex items-center space-x-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                File processed successfully
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
} 