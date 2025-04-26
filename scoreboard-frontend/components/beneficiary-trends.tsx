"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function BeneficiaryTrends() {
  // Sample data - would come from your processed CSV
  const categoryTrends = [
    { year: "2021", Elderly: 1200, Children: 2100, Disabled: 950, "Low Income": 3200, Unemployed: 1800 },
    { year: "2022", Elderly: 1300, Children: 2250, Disabled: 1000, "Low Income": 3400, Unemployed: 1650 },
    { year: "2023", Elderly: 1450, Children: 2400, Disabled: 1100, "Low Income": 3600, Unemployed: 1500 },
    { year: "2024", Elderly: 1600, Children: 2600, Disabled: 1200, "Low Income": 3900, Unemployed: 1400 },
    { year: "2025", Elderly: 1830, Children: 2800, Disabled: 1350, "Low Income": 4120, Unemployed: 1300 },
  ]

  const regionTrends = [
    { year: "2021", North: 2400, South: 3000, East: 1800, West: 2200, Central: 2800 },
    { year: "2022", North: 2550, South: 3200, East: 1950, West: 2350, Central: 2950 },
    { year: "2023", North: 2650, South: 3350, East: 2050, West: 2450, Central: 3050 },
    { year: "2024", North: 2800, South: 3500, East: 2100, West: 2600, Central: 3200 },
    { year: "2025", North: 3100, South: 3900, East: 2400, West: 2800, Central: 3600 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Trends & Forecast</CardTitle>
        <CardDescription>Historical data (2021-2024) and predictions (2025)</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="category">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="region">By Region</TabsTrigger>
          </TabsList>

          <TabsContent value="category">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={categoryTrends} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Elderly" stroke="#10b981" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Children" stroke="#0ea5e9" />
                  <Line type="monotone" dataKey="Disabled" stroke="#8b5cf6" />
                  <Line type="monotone" dataKey="Low Income" stroke="#f59e0b" />
                  <Line type="monotone" dataKey="Unemployed" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium">Trend Analysis:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>Elderly beneficiaries show consistent growth with acceleration in 2025</li>
                <li>Unemployment benefits have been steadily decreasing since 2021</li>
                <li>Low income support shows the largest absolute numbers with steady growth</li>
                <li>All categories except Unemployment are projected to increase in 2025</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="region">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={regionTrends} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="North" stroke="#10b981" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="South" stroke="#0ea5e9" />
                  <Line type="monotone" dataKey="East" stroke="#8b5cf6" />
                  <Line type="monotone" dataKey="West" stroke="#f59e0b" />
                  <Line type="monotone" dataKey="Central" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium">Regional Insights:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>All regions show growth in beneficiary numbers from 2021-2025</li>
                <li>North region shows the steepest growth curve for 2025</li>
                <li>South region consistently maintains the highest number of beneficiaries</li>
                <li>East region shows accelerated growth starting in 2024</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
