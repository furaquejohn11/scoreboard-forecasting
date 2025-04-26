"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function ForecastOverview() {
  // Sample data - would come from your processed CSV
  const data = [
    { category: "Elderly", "2024": 1600, "2025": 1830, growth: 14.3 },
    { category: "Children", "2024": 2600, "2025": 2800, growth: 7.7 },
    { category: "Disabled", "2024": 1200, "2025": 1350, growth: 12.5 },
    { category: "Low Income", "2024": 3900, "2025": 4120, growth: 5.6 },
    { category: "Unemployed", "2024": 1400, "2025": 1300, growth: -7.1 },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Beneficiary Forecast by Category</CardTitle>
        <CardDescription>Comparison of 2024 vs. predicted 2025 beneficiaries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value.toLocaleString(), name === "growth" ? "Growth %" : name]}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
              <Bar dataKey="2024" fill="#64748b" name="2024 (Actual)" />
              <Bar dataKey="2025" fill="#10b981" name="2025 (Predicted)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Key Insights:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Elderly beneficiaries show the highest growth rate at 14.3%</li>
            <li>Unemployment benefits are projected to decrease by 7.1%</li>
            <li>Overall beneficiary count is expected to increase by 7.2%</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
