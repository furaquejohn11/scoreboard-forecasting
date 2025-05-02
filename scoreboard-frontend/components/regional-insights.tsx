'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getHighestGrowthDistrict } from "@/lib/data"

interface PieData {
  name: string
  value: number
  percentage: number
}

export function RegionalInsights() {
  const [pieData, setPieData] = useState<PieData[]>([])

  useEffect(() => {
    async function fetchData() {
      const data = await getHighestGrowthDistrict()
      const counts = data.counts_by_year["2025"]
  
      let formatted: PieData[] = []
  
      if (counts && Object.keys(counts).length > 0) {
        formatted = Object.entries(counts).map(([district, stats]) => ({
          name: district,
          value: stats.count,
          percentage: stats.percent,
        }))
      } else {
        // Fallback: default districts with 0s
        formatted = [
          { name: "District A", value: 0, percentage: 0 },
          { name: "District B", value: 0, percentage: 0 },
          { name: "District C", value: 0, percentage: 0 },
        ]
      }
  
      setPieData(formatted)
    }
  
    fetchData()
  }, [])

  const COLORS = [
    "#10b981", "#0ea5e9", "#8b5cf6",
    "#f59e0b", "#ef4444", "#14b8a6", "#6366f1"
  ]

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
    index: number
  }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Regional Distribution (2025)</CardTitle>
        <CardDescription>
          Predicted beneficiary distribution by district
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => value.toLocaleString()}
                labelFormatter={(label) => `District: ${label}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">District Analysis:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            {pieData.length > 0 ? (
              pieData.map((d) => (
                <li key={d.name}>
                  {d.name} has {d.value} beneficiaries ({d.percentage}%)
                </li>
              ))
            ) : (
              <li>Loading data...</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
