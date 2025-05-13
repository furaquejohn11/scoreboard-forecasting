import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, LineChart, Upload, Users, Shield, ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-bold">WelfareCast</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
              <span className="mr-2">✨</span>
              AI-Powered Welfare Forecasting
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Transform Your Welfare
              <span className="text-emerald-600 block mt-2">Program Planning</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Make data-driven decisions with our AI-powered forecasting system. Predict future welfare needs and optimize resource allocation with confidence.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                  Start Forecasting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose WelfareCast?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to transform your welfare program planning and execution
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <LineChart className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Predictions</h3>
              <p className="text-gray-600 leading-relaxed">Leverage advanced machine learning algorithms to forecast future welfare needs with unprecedented accuracy.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Beneficiary Insights</h3>
              <p className="text-gray-600 leading-relaxed">Gain deep insights into beneficiary patterns and needs over time with intuitive visualizations.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">Your data is protected with enterprise-grade security measures and regular backups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
     

      {/* CTA Section */}
      <section className="bg-emerald-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Welfare Program?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join leading organizations already using WelfareCast to make data-driven decisions and improve their welfare programs.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
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
              <p className="text-sm leading-relaxed">Making welfare programs smarter with AI-powered forecasting and data-driven insights.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
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
