"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BeneficiaryForecast } from "@/components/beneficiary-forecast"
import { FeatureImportance } from "@/components/feature-importance"
import { RegionalDistribution } from "@/components/regional-distribution"
import { AnomalyDetection } from "@/components/anomaly-detection"
import { ModelMetrics } from "@/components/model-metrics"

interface ForecastResultsProps {
  results: {
    forecasts: any[]
    featureImportance: any[]
    regionalData: any[]
    anomalies: any[]
    metrics: {
      accuracy: number
      precision: number
      recall: number
      f1Score: number
      rmse: number
    }
  }
}

export function ForecastResults({ results }: ForecastResultsProps) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Forecast Results for 2025</CardTitle>
        <CardDescription>
          Intelligent predictions based on historical data analysis and machine learning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="forecasts">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="forecasts">Beneficiary Forecast</TabsTrigger>
            <TabsTrigger value="features">Feature Importance</TabsTrigger>
            <TabsTrigger value="regional">Regional Distribution</TabsTrigger>
            <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
            <TabsTrigger value="metrics">Model Metrics</TabsTrigger>
          </TabsList>
          <TabsContent value="forecasts" className="pt-4">
            <BeneficiaryForecast data={results.forecasts} />
          </TabsContent>
          <TabsContent value="features" className="pt-4">
            <FeatureImportance data={results.featureImportance} />
          </TabsContent>
          <TabsContent value="regional" className="pt-4">
            <RegionalDistribution data={results.regionalData} />
          </TabsContent>
          <TabsContent value="anomalies" className="pt-4">
            <AnomalyDetection data={results.anomalies} />
          </TabsContent>
          <TabsContent value="metrics" className="pt-4">
            <ModelMetrics metrics={results.metrics} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
