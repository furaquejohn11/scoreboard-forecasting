"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface BeneficiaryForecastProps {
  data: any[]
}

export function BeneficiaryForecast({ data }: BeneficiaryForecastProps) {
  // For a real implementation, we would use actual data
  // This is sample data for demonstration
  const sampleData = [
    { category: "Elderly", "2021": 1200, "2022": 1300, "2023": 1450, "2024": 1600, "2025 (Predicted)": 1750 },
    { category: "Children", "2021": 2100, "2022": 2250, "2023": 2400, "2024": 2600, "2025 (Predicted)": 2800 },
    { category: "Disabled", "2021": 950, "2022": 1000, "2023": 1100, "2024": 1200, "2025 (Predicted)": 1350 },
    { category: "Low Income", "2021": 3200, "2022": 3400, "2023": 3600, "2024": 3900, "2025 (Predicted)": 4200 },
    { category: "Unemployed", "2021": 1800, "2022": 1650, "2023": 1500, "2024": 1400, "2025 (Predicted)": 1300 },
  ]

  const chartData = sampleData.map((item) => ({
    name: item.category,
    "2024": item["2024"],
    "2025 (Predicted)": item["2025 (Predicted)"],
    growthRate: (((item["2025 (Predicted)"] - item["2024"]) / item["2024"]) * 100).toFixed(1),
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Beneficiary Growth Forecast</CardTitle>
          <CardDescription>
            Comparison of current beneficiaries (2024) vs. predicted beneficiaries (2025)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="2024" fill="#64748b" name="2024 (Actual)" />
                <Bar dataKey="2025 (Predicted)" fill="#10b981" name="2025 (Predicted)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Forecast Data</CardTitle>
          <CardDescription>Historical and predicted beneficiary counts by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>2021</TableHead>
                <TableHead>2022</TableHead>
                <TableHead>2023</TableHead>
                <TableHead>2024</TableHead>
                <TableHead>2025 (Predicted)</TableHead>
                <TableHead>Growth Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell>{row["2021"].toLocaleString()}</TableCell>
                  <TableCell>{row["2022"].toLocaleString()}</TableCell>
                  <TableCell>{row["2023"].toLocaleString()}</TableCell>
                  <TableCell>{row["2024"].toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">{row["2025 (Predicted)"].toLocaleString()}</TableCell>
                  <TableCell
                    className={
                      ((row["2025 (Predicted)"] - row["2024"]) / row["2024"]) * 100 > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {(((row["2025 (Predicted)"] - row["2024"]) / row["2024"]) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
