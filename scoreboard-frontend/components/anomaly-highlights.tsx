"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts"

export function AnomalyHighlights() {
  // Sample data - would come from your processed CSV
  const anomalies = [
    {
      id: "A001",
      region: "North",
      category: "Elderly",
      predicted: 450,
      expected: 380,
      deviation: 18.4,
      confidence: 0.92,
      severity: "High",
    },
    {
      id: "A002",
      region: "South",
      category: "Children",
      predicted: 620,
      expected: 720,
      deviation: -13.9,
      confidence: 0.88,
      severity: "Medium",
    },
    {
      id: "A003",
      region: "East",
      category: "Disabled",
      predicted: 380,
      expected: 310,
      deviation: 22.6,
      confidence: 0.95,
      severity: "High",
    },
    {
      id: "A004",
      region: "Central",
      category: "Low Income",
      predicted: 890,
      expected: 780,
      deviation: 14.1,
      confidence: 0.87,
      severity: "Medium",
    },
    {
      id: "A005",
      region: "West",
      category: "Unemployed",
      predicted: 210,
      expected: 280,
      deviation: -25.0,
      confidence: 0.91,
      severity: "High",
    },
  ]

  const scatterData = anomalies.map((item) => ({
    x: item.expected,
    y: item.predicted,
    z: Math.abs(item.deviation),
    id: item.id,
    category: item.category,
    region: item.region,
    deviation: item.deviation,
    severity: item.severity,
  }))

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Anomaly Detection</CardTitle>
        <CardDescription>Significant deviations from expected patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Expected" unit=" beneficiaries" />
              <YAxis type="number" dataKey="y" name="Predicted" unit=" beneficiaries" />
              <ZAxis type="number" dataKey="z" range={[60, 400]} name="Deviation" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm">
                        <p className="font-bold">{`${data.category} (${data.region})`}</p>
                        <p>{`Expected: ${data.x} beneficiaries`}</p>
                        <p>{`Predicted: ${data.y} beneficiaries`}</p>
                        <p className={data.deviation > 0 ? "text-red-600" : "text-blue-600"}>
                          {`Deviation: ${data.deviation > 0 ? "+" : ""}${data.deviation.toFixed(1)}%`}
                        </p>
                        <p>{`Severity: ${data.severity}`}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter
                name="Anomalies"
                data={scatterData}
                fill={(entry) => (entry.deviation > 0 ? "#ef4444" : "#3b82f6")}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Top Anomalies:</h4>
          <div className="space-y-2">
            {anomalies.slice(0, 3).map((anomaly) => (
              <div key={anomaly.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium">{anomaly.category}</span> in <span>{anomaly.region}</span>
                  <p className="text-xs text-gray-500">
                    {anomaly.deviation > 0 ? "+" : ""}
                    {anomaly.deviation}% deviation from expected
                  </p>
                </div>
                <Badge variant={anomaly.severity === "High" ? "destructive" : "outline"}>{anomaly.severity}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
