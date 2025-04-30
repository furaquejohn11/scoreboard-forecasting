import { DashboardSummary } from "@/components/dashboard-summary"
import { ForecastOverview } from "@/components/forecast-overview"
import { RegionalInsights } from "@/components/regional-insights"
import { AnomalyHighlights } from "@/components/anomaly-highlights"
import { FeatureImportanceChart } from "@/components/feature-importance-chart"
import { BeneficiaryTrends } from "@/components/beneficiary-trends"
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookie = await cookies();
  const token = await cookie.get('token')?.value;

  if (!token) {
    redirect('/login');
  }
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Forecast Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            2025 Welfare Beneficiary Forecast based on 2021-2024 historical data
          </p>
        </div>

        <DashboardSummary />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ForecastOverview />
          <RegionalInsights />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <AnomalyHighlights />
          <FeatureImportanceChart />
        </div>

        <div className="mt-6">
          <BeneficiaryTrends />
        </div>
      </div>
    </main>
  )
}
