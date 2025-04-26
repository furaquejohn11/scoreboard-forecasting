"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts"

interface AnomalyDetectionProps {
  data: any[]
}

export function AnomalyDetection({ data }: AnomalyDetectionProps) {
  // Sample data for demonstration
  const sampleAnomalies = [
    {
      id: "A001",
      region: "North",
      category: "Elderly",
      predicted: 450,
      expected: 380,
      deviation: 18.4,
      confidence: 0.92,
    },
    {
      id: "A002",
      region: "South",
      category: "Children",
      predicted: 620,
      expected: 720,
      deviation: -13.9,
      confidence: 0.88,
    },
    {
      id: "A003",
      region: "East",
      category: "Disabled",
      predicted: 380,
      expected: 310,
      deviation: 22.6,
      confidence: 0.95,
    },
    {
      id: "A004",
      region: "Central",
      category: "Low Income",
      predicted: 890,
      expected: 780,
      deviation: 14.1,
      confidence: 0.87,
    },
    {
      id: "A005",
      region: "West",
      category: "Unemployed",
      predicted: 210,
      expected: 280,
      deviation: -25.0,
      confidence: 0.91,
    },
  ]

  const scatterData = sampleAnomalies.map((item) => ({
    x: item.expected,
    y: item.predicted,
    z: Math.abs(item.deviation),
    id: item.id,
    category: item.category,
    region: item.region,
    deviation: item.deviation,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Detection</CardTitle>
          <CardDescription>Unusual patterns detected in the forecasting model</CardDescription>
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
                  formatter={(value, name, props) => {
                    if (name === "z") return [`${Math.abs(props.payload.deviation).toFixed(1)}%`, "Deviation"]
                    return [value, name]
                  }}
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
            <p className="text-sm text-gray-600 mb-2">
              The scatter plot shows expected vs. predicted beneficiary counts. Points further from the diagonal line
              represent larger anomalies. Red points indicate higher than expected counts, blue points indicate lower
              than expected.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anomaly Details</CardTitle>
          <CardDescription>Significant deviations from expected patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Predicted</TableHead>
                <TableHead>Deviation</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleAnomalies.map((anomaly, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{anomaly.id}</TableCell>
                  <TableCell>{anomaly.region}</TableCell>
                  <TableCell>{anomaly.category}</TableCell>
                  <TableCell>{anomaly.expected}</TableCell>
                  <TableCell>{anomaly.predicted}</TableCell>
                  <TableCell className={anomaly.deviation > 0 ? "text-red-600" : "text-blue-600"}>
                    {anomaly.deviation > 0 ? "+" : ""}
                    {anomaly.deviation}%
                  </TableCell>
                  <TableCell>{(anomaly.confidence * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    <Badge variant={Math.abs(anomaly.deviation) > 20 ? "destructive" : "outline"}>
                      {Math.abs(anomaly.deviation) > 20 ? "Critical" : "Significant"}
                    </Badge>
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
