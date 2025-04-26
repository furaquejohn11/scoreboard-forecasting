"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function FeatureImportanceChart() {
  // Sample data - would come from your processed CSV and ML model
  const data = [
    { feature: "Age", importance: 0.28 },
    { feature: "Income Level", importance: 0.22 },
    { feature: "Household Size", importance: 0.18 },
    { feature: "Employment Status", importance: 0.15 },
    { feature: "Education Level", importance: 0.08 },
    { feature: "Disability Status", importance: 0.05 },
    { feature: "Geographic Location", importance: 0.04 },
  ].sort((a, b) => b.importance - a.importance)

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Feature Importance</CardTitle>
        <CardDescription>Key factors influencing welfare predictions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 0.3]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <YAxis type="category" dataKey="feature" />
              <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
              <Bar dataKey="importance" fill="#10b981" name="Importance Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Interpretation:</h4>
          <p className="text-sm text-gray-600">
            Age and income level are the strongest predictors of welfare needs, suggesting that age-specific and
            income-based targeting should be prioritized for 2025 resource allocation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
