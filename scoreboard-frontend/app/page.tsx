import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BarChart3, LineChart, Upload, Users, Shield,
  ArrowRight, CheckCircle2
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-bold text-gray-900">WelfareCast</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" aria-label="Sign In">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" aria-label="Get Started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="bg-gradient-to-b from-white to-emerald-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow text-emerald-700 text-sm font-medium mb-6">
            <span className="mr-2">✨</span>
            Built for Social Service Champions
          </div>
          <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-md">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Empower Your <span className="text-emerald-600 block mt-2">Welfare Strategy with AI</span>
            </h1>
            <p className="mt-6 text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              WelfareCast helps local governments and agencies forecast welfare demand, prioritize resources, and act with confidence—no data science degree needed.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="https://youtu.be/UbM8T6rJI1A?si=Jb2vj-dPld6QnuKT" target="_blank">
                <Button size="lg" className="bg-white text-emerald-600 border hover:bg-gray-50">
                  Watch Demo
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-white">
                  Start Forecasting <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How WelfareCast Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Upload className="h-6 w-6" />,
                title: "Upload Your Data",
                desc: "Upload CSV files or connect to your LGU database with one click."
              },
              {
                icon: <LineChart className="h-6 w-6" />,
                title: "AI Forecasting",
                desc: "Our models analyze trends and project future welfare needs instantly."
              },
              {
                icon: <CheckCircle2 className="h-6 w-6" />,
                title: "Plan Smarter",
                desc: "Use our visual tools to allocate resources and act on predictions."
              },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-emerald-100 rounded-lg text-emerald-600">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose WelfareCast?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to transform your welfare program planning and execution.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <LineChart className="h-6 w-6 text-emerald-600" />,
                title: "AI-Powered Predictions",
                desc: "Leverage machine learning algorithms to forecast future welfare needs."
              },
              {
                icon: <Users className="h-6 w-6 text-emerald-600" />,
                title: "Beneficiary Insights",
                desc: "Understand beneficiary patterns over time with intuitive visuals."
              },
              {
                icon: <Shield className="h-6 w-6 text-emerald-600" />,
                title: "Secure & Reliable",
                desc: "Enterprise-grade data protection and automated backups."
              }
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-2xl shadow-md border hover:shadow-lg transition">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Welfare Program?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join leading organizations already using WelfareCast to make data-driven decisions.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
                <span className="text-white font-bold">WelfareCast</span>
              </div>
              <p className="text-sm leading-relaxed">Making welfare programs smarter with AI-powered forecasting and insights.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
                <li><Link href="#" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            © {new Date().getFullYear()} WelfareCast. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
