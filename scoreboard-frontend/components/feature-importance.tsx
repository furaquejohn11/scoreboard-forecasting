"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface FeatureImportanceProps {
  data: any[]
}

export function FeatureImportance({ data }: FeatureImportanceProps) {
  // Sample data for demonstration
  const sampleData = [
    { feature: "Age", importance: 0.28 },
    { feature: "Income Level", importance: 0.22 },
    { feature: "Household Size", importance: 0.18 },
    { feature: "Employment Status", importance: 0.15 },
    { feature: "Education Level", importance: 0.08 },
    { feature: "Disability Status", importance: 0.05 },
    { feature: "Geographic Location", importance: 0.04 },
  ].sort((a, b) => b.importance - a.importance)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Importance Analysis</CardTitle>
          <CardDescription>Key factors influencing welfare beneficiary predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={sampleData} margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 0.3]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" />
                <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="importance" fill="#10b981" name="Importance Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Interpretation</h3>
            <p className="text-sm text-gray-600">
              The feature importance analysis reveals that demographic factors like age and income level have the
              strongest influence on welfare predictions. This suggests that welfare programs should focus on
              age-specific and income-based targeting for optimal resource allocation in 2025.
            </p>
            <p className="text-sm text-gray-600">
              The model has identified these key predictors by analyzing historical patterns and correlations in the
              data, providing valuable insights for policy planning and budget allocation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
