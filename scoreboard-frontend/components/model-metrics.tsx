"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ModelMetricsProps {
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
    rmse: number
  }
}

export function ModelMetrics({ metrics }: ModelMetricsProps) {
  // Sample data for demonstration
  const sampleMetrics = {
    accuracy: 0.87,
    precision: 0.83,
    recall: 0.79,
    f1Score: 0.81,
    rmse: 42.5,
  }

  const trainingData = [
    { epoch: 1, loss: 0.82, accuracy: 0.65 },
    { epoch: 2, loss: 0.56, accuracy: 0.72 },
    { epoch: 3, loss: 0.41, accuracy: 0.78 },
    { epoch: 4, loss: 0.32, accuracy: 0.81 },
    { epoch: 5, loss: 0.25, accuracy: 0.84 },
    { epoch: 6, loss: 0.21, accuracy: 0.85 },
    { epoch: 7, loss: 0.18, accuracy: 0.86 },
    { epoch: 8, loss: 0.16, accuracy: 0.87 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators for the forecasting model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className="text-sm font-medium">{(sampleMetrics.accuracy * 100).toFixed(1)}%</span>
                </div>
                <Progress value={sampleMetrics.accuracy * 100} className="h-2" />
                <p className="text-xs text-gray-500">Percentage of correct predictions across all categories</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Precision</span>
                  <span className="text-sm font-medium">{(sampleMetrics.precision * 100).toFixed(1)}%</span>
                </div>
                <Progress value={sampleMetrics.precision * 100} className="h-2" />
                <p className="text-xs text-gray-500">Ratio of true positives to all positive predictions</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recall</span>
                  <span className="text-sm font-medium">{(sampleMetrics.recall * 100).toFixed(1)}%</span>
                </div>
                <Progress value={sampleMetrics.recall * 100} className="h-2" />
                <p className="text-xs text-gray-500">Ratio of true positives to all actual positives</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">F1 Score</span>
                  <span className="text-sm font-medium">{(sampleMetrics.f1Score * 100).toFixed(1)}%</span>
                </div>
                <Progress value={sampleMetrics.f1Score * 100} className="h-2" />
                <p className="text-xs text-gray-500">Harmonic mean of precision and recall</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">RMSE</span>
                  <span className="text-sm font-medium">{sampleMetrics.rmse.toFixed(1)}</span>
                </div>
                <Progress value={(1 - sampleMetrics.rmse / 100) * 100} max={100} className="h-2" />
                <p className="text-xs text-gray-500">Root Mean Square Error (lower is better)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Performance</CardTitle>
            <CardDescription>Model training history showing loss and accuracy over epochs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trainingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#ef4444" name="Training Loss" />
                  <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Explanation</CardTitle>
          <CardDescription>Technical details about the forecasting model</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="architecture">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>
            <TabsContent value="architecture" className="space-y-4 pt-4">
              <p className="text-sm text-gray-600">
                The forecasting system uses an ensemble of machine learning models:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                <li>
                  <span className="font-medium">Time Series Forecasting:</span> ARIMA and Prophet models for trend
                  analysis
                </li>
                <li>
                  <span className="font-medium">Classification:</span> Random Forest and Gradient Boosting for
                  categorical predictions
                </li>
                <li>
                  <span className="font-medium">Regression:</span> XGBoost for numerical predictions of beneficiary
                  counts
                </li>
                <li>
                  <span className="font-medium">Anomaly Detection:</span> Isolation Forest algorithm to identify unusual
                  patterns
                </li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                The models are combined using a weighted voting mechanism that prioritizes models with better historical
                performance for specific regions and beneficiary categories.
              </p>
            </TabsContent>
            <TabsContent value="parameters" className="space-y-4 pt-4">
              <p className="text-sm text-gray-600">Key hyperparameters used in the model training:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                <li>Learning Rate: 0.01</li>
                <li>Max Tree Depth: 8</li>
                <li>Number of Estimators: 200</li>
                <li>Regularization Alpha: 0.5</li>
                <li>Batch Size: 64</li>
                <li>Training Epochs: 100 (with early stopping)</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                These parameters were optimized using Bayesian optimization to find the best configuration for the
                welfare forecasting task.
              </p>
            </TabsContent>
            <TabsContent value="validation" className="space-y-4 pt-4">
              <p className="text-sm text-gray-600">The model was validated using:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                <li>
                  <span className="font-medium">K-Fold Cross-Validation:</span> 5-fold cross-validation to ensure
                  robustness
                </li>
                <li>
                  <span className="font-medium">Backtesting:</span> Historical data from 2020 was used to predict
                  2021-2024, and compared with actual values
                </li>
                <li>
                  <span className="font-medium">Sensitivity Analysis:</span> Testing model performance with varying
                  input parameters
                </li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                The model achieved an average accuracy of 87% on the validation set, with an RMSE of 42.5 beneficiaries
                per category.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
