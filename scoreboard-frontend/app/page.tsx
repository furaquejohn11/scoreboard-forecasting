import { Upload } from "@/components/upload"
import { Sidebar } from "@/components/sidebar"
import "./globals.css";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Welfare Beneficiary Forecasting System
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Upload historical beneficiary data (2021-2024) to generate intelligent predictions for 2025
              </p>
            </div>

            <Upload />
          </div>
        </div>
      </main>
    </div>
  )
}
