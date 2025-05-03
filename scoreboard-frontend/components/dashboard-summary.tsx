// "use client"

import { Card, CardContent } from "@/components/ui/card"
import { getLastYearHighestGrowthCategory, getLastYearHighestGrowthDistrict, getTotalBeneficiaries } from "@/lib/data"
import { ArrowUpRight, ArrowDownRight,  Users, SquareEqual, TrendingUp, MapPin } from "lucide-react"

async function beneficiariesInformation() {
  const totalBeneficiaries = await getTotalBeneficiaries();

  // Sort once (descending: most recent year first)
  const sorted = [...totalBeneficiaries.beneficiaries_by_year].sort((a, b) => b.YEAR - a.YEAR);

  const currentYear = sorted[0]?.YEAR ?? "N/A";
  const currentYearBeneficiaries = sorted[0]?.BENEFICIARY_COUNT ?? 0;

  const lastYear = sorted[1]?.YEAR ?? "N/A";
  const lastYearBeneficiaries = sorted[1]?.BENEFICIARY_COUNT ?? 0;

  const beneficiariesDifference = currentYearBeneficiaries - lastYearBeneficiaries;

  return {
    currentYear,
    currentYearBeneficiaries,
    lastYear,
    lastYearBeneficiaries,
    beneficiariesDifference,
    allYearsDescending: sorted,
  };
}


export async function DashboardSummary() {

  // const totalBeneficiaries = await getTotalBeneficiaries();
  const beneficiariesInfo = await beneficiariesInformation();
  const lastYearGrowthDistrict = await getLastYearHighestGrowthDistrict();
  const lastYearGrowthCategory = await getLastYearHighestGrowthCategory();


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Beneficiaries Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Beneficiaries ({beneficiariesInfo.currentYear})</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-semibold">{beneficiariesInfo.currentYearBeneficiaries}</p>
                <p className="ml-2 text-sm font-medium  flex items-center">
                  {beneficiariesInfo.beneficiariesDifference >= 0 ? 
                      (<ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />) : 
                      (<ArrowDownRight className="h-4 w-4 mr-1 text-red-600" />) }
                  {beneficiariesInfo.beneficiariesDifference}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                From {beneficiariesInfo.lastYearBeneficiaries} in {beneficiariesInfo.lastYear}
              </p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicted Total Beneficiaries by the end of current year card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Predicted Total Beneficiaries</p>

              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-semibold">{`N/A`}</p>
                <p className="ml-2 text-sm font-medium text-emerald-600">Beneficiaries</p>
              </div>
              <p className="text-sm text-gray-500 mt-1">By the end of {beneficiariesInfo.currentYear}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Highest Growth Category Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Highest Growth Category ({lastYearGrowthCategory.year})</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-semibold">{lastYearGrowthCategory.category}</p>
                <p className="ml-2 text-sm font-medium text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  {lastYearGrowthCategory.growthPercent}%
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">Last Year Growth</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

       {/* Highest Growth Region Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Highest Growth Region ({lastYearGrowthDistrict.year})</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-semibold">{lastYearGrowthDistrict.district}</p>
                <p className="ml-2 text-sm font-medium text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  {lastYearGrowthDistrict.growthPercent}%
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">Last Year Regional Distribution</p>
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
