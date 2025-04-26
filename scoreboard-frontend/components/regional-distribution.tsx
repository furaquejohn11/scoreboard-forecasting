"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RegionalDistributionProps {
  data: any[]
}

export function RegionalDistribution({ data }: RegionalDistributionProps) {
  // Sample data for demonstration
  const sampleData = [
    { region: "North", "2024": 2800, "2025": 3100, change: 300, percentChange: 10.7 },
    { region: "South", "2024": 3500, "2025": 3900, change: 400, percentChange: 11.4 },
    { region: "East", "2024": 2100, "2025": 2400, change: 300, percentChange: 14.3 },
    { region: "West", "2024": 2600, "2025": 2800, change: 200, percentChange: 7.7 },
    { region: "Central", "2024": 3200, "2025": 3600, change: 400, percentChange: 12.5 },
  ]

  const COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444"]

  const pieData = sampleData.map((item) => ({
    name: item.region,
    value: item["2025"],
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Predicted Regional Distribution (2025)</CardTitle>
            <CardDescription>Forecasted beneficiary distribution by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Growth Analysis</CardTitle>
            <CardDescription>Comparing 2024 vs. 2025 predicted beneficiaries by region</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>2024</TableHead>
                  <TableHead>2025 (Predicted)</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>% Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.region}</TableCell>
                    <TableCell>{row["2024"].toLocaleString()}</TableCell>
                    <TableCell>{row["2025"].toLocaleString()}</TableCell>
                    <TableCell>+{row.change.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">+{row.percentChange}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regional Insights</CardTitle>
          <CardDescription>Key findings from regional distribution analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The East region shows the highest growth rate at 14.3%, suggesting increasing welfare needs in this area.
              This could be due to economic factors or demographic shifts that the model has identified.
            </p>
            <p className="text-sm text-gray-600">
              The South and Central regions will require the largest absolute increase in resources, with each needing
              to accommodate approximately 400 additional beneficiaries in 2025.
            </p>
            <p className="text-sm text-gray-600">
              The West region shows the lowest growth rate at 7.7%, indicating relatively stable welfare needs compared
              to other regions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
