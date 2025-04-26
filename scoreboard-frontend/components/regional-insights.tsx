"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function RegionalInsights() {
  // Sample data - would come from your processed CSV
  const data = [
    { name: "North", value: 3100, percentage: 29.8 },
    { name: "South", value: 3900, percentage: 37.5 },
    { name: "East", value: 2400, percentage: 23.1 },
    { name: "West", value: 2800, percentage: 26.9 },
    { name: "Central", value: 3600, percentage: 34.6 },
  ]

  const COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444"]

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Regional Distribution (2025)</CardTitle>
        <CardDescription>Predicted beneficiary distribution by region</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} labelFormatter={(label) => `Region: ${label}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Regional Analysis:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>South region has the highest concentration of beneficiaries</li>
            <li>East region shows the fastest growth rate year-over-year</li>
            <li>Central region requires additional resource allocation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
