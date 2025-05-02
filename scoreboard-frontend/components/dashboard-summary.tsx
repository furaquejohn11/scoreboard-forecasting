// "use client"

import { Card, CardContent } from "@/components/ui/card"
import { getTotalBeneficiaries } from "@/lib/data"
import { ArrowUpRight, Users, AlertTriangle, TrendingUp, MapPin } from "lucide-react"

export async function DashboardSummary() {

  const totalBeneficiaries = await getTotalBeneficiaries();
  // This would normally come from your data processing results
  const summaryData = {
    totalBeneficiaries: {
      current: 9700,
      predicted: 10400,
      percentChange: 7.2,
    },
    anomalies: {
      count: 5,
      severity: "Medium",
    },
    highestGrowth: {
      category: "Elderly",
      percentChange: 14.3,
    },
    highestRegion: {
      name: "East",
      percentChange: 12.5,
    },
  }

  

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Beneficiaries (2025)</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-semibold">{totalBeneficiaries.total_beneficiaries}</p>
                <p className="ml-2 text-sm font-medium text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  {totalBeneficiaries.total_beneficiaries}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                From {summaryData.totalBeneficiaries.current.toLocaleString()} in 2024
              </p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Detected Anomalies</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-semibold">{summaryData.anomalies.count}</p>
                <p className="ml-2 text-sm font-medium text-amber-600">{summaryData.anomalies.severity} Severity</p>
              </div>
              <p className="text-sm text-gray-500 mt-1">Require attention</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Highest Growth Category</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-semibold">{summaryData.highestGrowth.category}</p>
                <p className="ml-2 text-sm font-medium text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  {summaryData.highestGrowth.percentChange}%
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">Year-over-year growth</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Highest Growth Region</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-semibold">{summaryData.highestRegion.name}</p>
                <p className="ml-2 text-sm font-medium text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  {summaryData.highestRegion.percentChange}%
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">Regional distribution</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
