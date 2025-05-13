"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadIcon as FileUpload, UploadIcon, AlertCircle, BarChart3, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DynamicForm } from "./dynamic-form"

export function Upload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const validateFile = (file: File) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    if (!validExtensions.some(ext => file.name.endsWith(ext))) {
      setError("Please upload a valid CSV or Excel file");
      return false;
    }
    return true;
  }

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

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      setError(null);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first")
      return
    }

    const validExtensions = [".csv", ".xlsx", ".xls"];
    if (!validExtensions.some(ext => file.name.endsWith(ext))) {
      setError("Please upload a valid CSV or Excel file");
      return;
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/api/file/upload-excel", {
        method: "POST",
        body: formData,
      });    
      if (!response.ok) {
        throw new Error('Upload Failed');
      }

      const fileRowCount = await response.json();
      setResults(fileRowCount);
      alert("File uploaded successfully!");
      router.push("/dashboard")
    } catch (err) {
      setError("Error processing the file. Please ensure it's a valid CSV/Excel with the correct format.")
      console.error(err)
    } finally {
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  const handleDataAdded = () => {
    // Optionally refresh data or show success message
    alert("Data added successfully!");
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <UploadIcon className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="add-data" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Historical Data</CardTitle>
              <CardDescription>
                Upload a CSV file containing beneficiary data from 2021-2024. The file should include demographic
                information, benefit amounts, and other relevant welfare metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ease-in-out ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FileUpload className={`h-12 w-12 mb-4 transition-colors duration-200 ${
                  isDragging ? 'text-emerald-500' : 'text-gray-400'
                }`} />
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    {file ? file.name : "Drag and drop your CSV file here, or click to browse"}
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="sr-only"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    Select File
                  </label>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading || isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload and Process
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="add-data">
          <Card>
            <CardHeader>
              <CardTitle>Add New Data</CardTitle>
              <CardDescription>
                Add new data entries to the existing dataset. Fill in all required fields below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicForm onDataAdded={handleDataAdded} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
