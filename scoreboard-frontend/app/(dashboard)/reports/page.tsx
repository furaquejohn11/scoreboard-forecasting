import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, FileBarChart2, FilePieChart } from "lucide-react"

export default function ReportsPage() {
  // Sample data for demonstration
  const reports = [
    {
      id: "R001",
      name: "Annual Forecast Summary 2025",
      type: "Forecast",
      date: "2024-04-15",
      format: "PDF",
      size: "2.4 MB",
      icon: FileBarChart2,
    },
    {
      id: "R002",
      name: "Regional Distribution Analysis",
      type: "Analysis",
      date: "2024-04-10",
      format: "Excel",
      size: "1.8 MB",
      icon: FilePieChart,
    },
    {
      id: "R003",
      name: "Anomaly Detection Report",
      type: "Technical",
      date: "2024-04-05",
      format: "PDF",
      size: "3.2 MB",
      icon: FileText,
    },
    {
      id: "R004",
      name: "Quarterly Beneficiary Trends",
      type: "Summary",
      date: "2024-03-31",
      format: "PDF",
      size: "1.5 MB",
      icon: FileBarChart2,
    },
    {
      id: "R005",
      name: "Feature Importance Analysis",
      type: "Technical",
      date: "2024-03-25",
      format: "Excel",
      size: "2.1 MB",
      icon: FilePieChart,
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <FileText className="mr-2 h-4 w-4" />
            Generate New Report
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Access and download generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <report.icon className="h-4 w-4 text-gray-500" />
                        <span>{report.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.format}</TableCell>
                    <TableCell>{report.size}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
