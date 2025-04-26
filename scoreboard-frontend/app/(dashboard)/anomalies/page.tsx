import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"

export default function AnomaliesPage() {
  // Sample data for demonstration
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
      status: "Open",
      date: "2024-04-15",
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
      status: "Open",
      date: "2024-04-14",
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
      status: "Investigating",
      date: "2024-04-12",
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
      status: "Resolved",
      date: "2024-04-10",
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
      status: "Resolved",
      date: "2024-04-08",
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Anomaly Detection</h1>
          <Button className="bg-emerald-600 hover:bg-emerald-700">Run New Detection</Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detected Anomalies</CardTitle>
            <CardDescription>Unusual patterns detected in the forecasting model</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="investigating">Investigating</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Deviation</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anomalies.map((anomaly) => (
                      <TableRow key={anomaly.id}>
                        <TableCell className="font-medium">{anomaly.id}</TableCell>
                        <TableCell>{anomaly.region}</TableCell>
                        <TableCell>{anomaly.category}</TableCell>
                        <TableCell className={anomaly.deviation > 0 ? "text-red-600" : "text-blue-600"}>
                          {anomaly.deviation > 0 ? "+" : ""}
                          {anomaly.deviation}%
                        </TableCell>
                        <TableCell>{(anomaly.confidence * 100).toFixed(0)}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              anomaly.severity === "High"
                                ? "destructive"
                                : anomaly.severity === "Medium"
                                  ? "default"
                                  : "outline"
                            }
                          >
                            {anomaly.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {anomaly.status === "Open" ? (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            ) : anomaly.status === "Investigating" ? (
                              <AlertCircle className="h-4 w-4 text-blue-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {anomaly.status}
                          </div>
                        </TableCell>
                        <TableCell>{anomaly.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Other tab contents would filter the anomalies based on status */}
              <TabsContent value="open">{/* Similar table with filtered data */}</TabsContent>
              <TabsContent value="investigating">{/* Similar table with filtered data */}</TabsContent>
              <TabsContent value="resolved">{/* Similar table with filtered data */}</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
