import Link from "next/link"
import { BarChart3, Home, Settings, Users } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">WelfareCast</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <Home className="mr-2 h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/beneficiaries" className="flex items-center text-gray-600 hover:text-gray-900">
              <Users className="mr-2 h-5 w-5" />
              <span>Beneficiaries</span>
            </Link>
            <Link href="/settings" className="flex items-center text-gray-600 hover:text-gray-900">
              <Settings className="mr-2 h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
