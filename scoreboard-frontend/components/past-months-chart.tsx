"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from 'xlsx'

type PastMonthData = {
  name: string
  count: number
}

export function PastMonthsChart() {
  const [data, setData] = useState<PastMonthData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/file/forecast", {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          setData([])
          return
        }

        const json = await response.json()
        setData(json.past_months ?? [])
      } catch (error) {
        setData([])
      }
    }

    fetchData()
  }, [])

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0)
  const average = data.length ? Math.round(total / data.length) : 0
  const highest = data.reduce((max, d) => (d.count > max.count ? d : max), { name: "N/A", count: 0 })

  const handleExportToExcel = () => {
    // Prepare data for Excel
    const excelData = data.map(item => ({
      "Month": item.name,
      "Beneficiaries": item.count
    }));

    // Add summary statistics
    excelData.push(
      {
        "Month": "TOTAL",
        "Beneficiaries": total
      },
      {
        "Month": "AVERAGE",
        "Beneficiaries": average
      },
      {
        "Month": "PEAK MONTH",
        "Beneficiaries": highest.count
      }
    );

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Past Months Data");

    // Generate Excel file
    XLSX.writeFile(wb, "past-months-data.xlsx");
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Past Monthly Beneficiaries</CardTitle>
            <CardDescription>
              Trends in actual welfare counts from previous 12 months
            </CardDescription>
          </div>
          <Button 
            onClick={handleExportToExcel} 
            variant="outline" 
            size="sm"
            className="border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value: number) => value.toLocaleString()}
                labelFormatter={(label: string) => `${label}`}
              />
              <Bar dataKey="count" fill="#10b981" name="Actual Beneficiaries" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Insights:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            {data.length > 0 ? (
              <>
                <li>Total beneficiaries: {total.toLocaleString()}</li>
                <li>Average per month: {average.toLocaleString()}</li>
                <li>
                  Peak month: {highest.name} with {highest.count.toLocaleString()} beneficiaries
                </li>
              </>
            ) : (
              <li>Loading data...</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
