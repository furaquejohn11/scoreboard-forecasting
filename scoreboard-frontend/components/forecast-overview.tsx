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
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from 'xlsx'

type Forecast = {
  category: string
  current_month: { name: string; count: number }
  next_month: { name: string; forecast: number }
}

export function ForecastOverview() {
  const [data, setData] = useState<
    { category: string; current: number; forecast: number; growth: number }[]
  >([])

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://127.0.0.1:8000/api/file/forecast_by_category", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
    
      if (!response.ok) {
        setData([]);
        return;
      }
    
      const json: { forecasts: Forecast[] } = await response.json();
    
      const processed = json.forecasts.map((item) => {
        const current = item.current_month.count;
        const forecast = item.next_month.forecast;
        const growth =
          current === 0 ? 0 : ((forecast - current) / current) * 100;
    
        return {
          category: item.category,
          current,
          forecast,
          growth: parseFloat(growth.toFixed(1)),
        };
      });
    
      setData(processed);
    }

    fetchData()
  }, [])

  const handleExportToExcel = () => {
    // Prepare data for Excel
    const excelData = data.map(item => ({
      "Category": item.category,
      "Current Month (April 2025)": item.current,
      "Forecast (May 2025)": item.forecast,
      "Growth %": item.growth
    }));

    // Add summary row
    const totalCurrent = data.reduce((sum, d) => sum + d.current, 0);
    const totalForecast = data.reduce((sum, d) => sum + d.forecast, 0);
    const overallGrowth = ((totalForecast - totalCurrent) / totalCurrent) * 100;

    excelData.push({
      "Category": "TOTAL",
      "Current Month (April 2025)": totalCurrent,
      "Forecast (May 2025)": totalForecast,
      "Growth %": parseFloat(overallGrowth.toFixed(1))
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Forecast Overview");

    // Generate Excel file
    XLSX.writeFile(wb, "forecast-overview.xlsx");
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Beneficiary Forecast by Category</CardTitle>
            <CardDescription>
              April 2025 vs. May 2025 projected beneficiaries
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
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              interval={0}
              tick={({ x, y, payload }) => {
                const words = payload.value.split(" ")
                const maxLineLength = 12 // you can tweak this
                const firstLine = words.slice(0, 2).join(" ")
                const secondLine = words.slice(2).join(" ")

                return (
                  <g transform={`translate(${x},${y + 10})`}>
                    <text textAnchor="middle" fontSize={10} fill="#666">
                      <tspan x={0} dy="0">{firstLine}</tspan>
                      <tspan x={0} dy="10">{secondLine}</tspan>
                    </text>
                  </g>
                )
              }}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                const labelMap: Record<string, string> = {
                  current: "April 2025 (Actual)",
                  forecast: "May 2025 (Forecast)",
                  growth: "Growth %",
                };
                return [value.toLocaleString(), labelMap[name] ?? name];
              }}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 10 }} />
            <Bar dataKey="current" fill="#64748b" name="April 2025 (Actual)" />
            <Bar dataKey="forecast" fill="#10b981" name="May 2025 (Forecast)" />
          </BarChart>

          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Key Insights:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            {data.length > 0 ? (
              <>
                <li>
                  Highest growth:{" "}
                  {
                    [...data].sort((a, b) => b.growth - a.growth)[0]
                      .category
                  }{" "}
                  at {Math.max(...data.map((d) => d.growth)).toFixed(1)}%
                </li>
                <li>
                  Lowest growth:{" "}
                  {
                    [...data].sort((a, b) => a.growth - b.growth)[0]
                      .category
                  }{" "}
                  at {Math.min(...data.map((d) => d.growth)).toFixed(1)}%
                </li>
                <li>
                  Overall forecast increase:{" "}
                  {(
                    ((data.reduce((sum, d) => sum + d.forecast, 0) -
                      data.reduce((sum, d) => sum + d.current, 0)) /
                      data.reduce((sum, d) => sum + d.current, 0)) *
                    100
                  ).toFixed(1)}
                  %
                </li>
              </>
            ) : (
              <li>Loading insights...</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
