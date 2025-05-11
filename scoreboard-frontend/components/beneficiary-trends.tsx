"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from 'xlsx'

type TrendData = {
  year: string
  [key: string]: number | string
}

export function BeneficiaryTrends() {
  const [categoryTrends, setCategoryTrends] = useState<TrendData[]>([])
  const [regionTrends, setRegionTrends] = useState<TrendData[]>([])
  const [categoryInsights, setCategoryInsights] = useState<string[]>([])
  const [regionInsights, setRegionInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)  // New loading state
  const [activeTab, setActiveTab] = useState("category")

  const generateInsights = (data: TrendData[]): string[] => {
    if (!data.length) return []
    const keys = Object.keys(data[0]).filter(k => k !== "year")
    const insights: string[] = []

    keys.forEach(key => {
      const values = data.map(row => Number(row[key]))
      const start = values[0]
      const end = values[values.length - 1]
      const diff = end - start

      if (diff > 0) {
        insights.push(`${key} increased from ${start} to ${end} between 2021 and 2025`)
      } else if (diff < 0) {
        insights.push(`${key} declined from ${start} to ${end} between 2021 and 2025`)
      } else {
        insights.push(`${key} remained stable from 2021 to 2025`)
      }
    })

    const topKey = keys.reduce((a, b) =>
      Number(data[data.length - 1][a]) > Number(data[data.length - 1][b]) ? a : b
    )
    insights.push(`${topKey} had the highest forecasted value in 2025`)

    return insights
  }

  useEffect(() => {
    const fetchTrends = async (
      url: string,
      transform: (raw: any) => TrendData[],
      setData: (d: TrendData[]) => void,
      setInsights: (i: string[]) => void
    ) => {
      try {
        setLoading(true)  // Set loading to true when fetching starts
        const res = await fetch(url, { method: "POST" })
        if (!res.ok) return

        const data = await res.json()
        const transformed = transform(data)
        setData(transformed)
        setInsights(generateInsights(transformed))
      } catch {
        // Fail silently (return blank)
        setData([])
        setInsights([])
      } finally {
        setLoading(false)  // Set loading to false when fetch finishes (success or error)
      }
    }

    fetchTrends(
      "http://127.0.0.1:8000/api/file/historical_trends_forecast_category",
      (data) =>
        Object.entries(data.counts_by_year || {}).map(([year, counts]) => ({
          year,
          ...(counts as Record<string, number>)
        })),
      setCategoryTrends,
      setCategoryInsights
    )

    fetchTrends(
      "http://127.0.0.1:8000/api/file/historical_trends_forecast_district",
      (data) =>
        Object.entries(data.counts_by_year || {}).map(([year, districts]) => {
          const flat: Record<string, number> = {}
          for (const [region, value] of Object.entries(districts as Record<string, { count: number }>)) {
            flat[region] = value.count
          }
          return { year, ...flat }
        }),
      setRegionTrends,
      setRegionInsights
    )
  }, [])

  const renderInsights = (insights: string[], title: string) => (
    insights.length ? (
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          {insights.map((text, i) => <li key={i}>{text}</li>)}
        </ul>
      </div>
    ) : null
  )

  const renderChart = (data: TrendData[]) => (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {data.length > 0 &&
            Object.keys(data[0])
              .filter(key => key !== "year")
              .map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444"][i % 5]}
                  activeDot={{ r: 6 }}
                />
              ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  const handleExportToExcel = () => {
    const data = activeTab === "category" ? categoryTrends : regionTrends;
    const insights = activeTab === "category" ? categoryInsights : regionInsights;
    
    // Create main data worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create insights worksheet
    const insightsData = insights.map(insight => ({ "Insight": insight }));
    const wsInsights = XLSX.utils.json_to_sheet(insightsData);
    
    // Create workbook with both sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab === "category" ? "Category" : "Regional"} Trends`);
    XLSX.utils.book_append_sheet(wb, wsInsights, "Insights");
    
    // Generate Excel file
    XLSX.writeFile(wb, `beneficiary-trends-${activeTab}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Historical Trends & Forecast</CardTitle>
            <CardDescription>
              Historical data (2021–2024) and 2025 forecast
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
        <Tabs defaultValue="category" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="region">By District</TabsTrigger>
          </TabsList>

          <TabsContent value="category">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading category data...</p>  // Display loading text
            ) : categoryTrends.length ? (
              <>
                {renderChart(categoryTrends)}
                {renderInsights(categoryInsights, "Category Insights:")}
              </>
            ) : <p className="text-gray-500 text-sm">No category data available.</p>}
          </TabsContent>

          <TabsContent value="region">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading regional data...</p>  // Display loading text
            ) : regionTrends.length ? (
              <>
                {renderChart(regionTrends)}
                {renderInsights(regionInsights, "Regional Insights:")}
              </>
            ) : <p className="text-gray-500 text-sm">No regional data available.</p>}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
