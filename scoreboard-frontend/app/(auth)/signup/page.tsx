"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const firstname = formData.get("firstname") as string
    const lastname = formData.get("lastname") as string
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname,
          lastname,
          username,
          password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to create account")
      }

      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold">WelfareCast</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="firstname" className="text-sm font-medium leading-none">
                      First name
                    </label>
                    <Input id="firstname" name="firstname" placeholder="John" autoComplete="given-name" required />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="lastname" className="text-sm font-medium leading-none">
                      Last name
                    </label>
                    <Input id="lastname" name="lastname" placeholder="Doe" autoComplete="family-name" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="username" className="text-sm font-medium leading-none">
                    Username
                  </label>
                  <Input id="username" name="username" placeholder="johndoe" autoComplete="username" required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    Password
                  </label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      autoComplete="new-password" 
                      required 
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium leading-none">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="text-sm text-red-500 text-center">{error}</div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
