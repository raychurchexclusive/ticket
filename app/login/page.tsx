"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"

  const { logIn, currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      router.push(redirect)
    }
  }, [currentUser, router, redirect])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await logIn(email, password)
      toast({
        title: "Login successful",
        description: "Welcome back to Top City Tickets!",
      })
      router.push(redirect)
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle different Firebase auth errors
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.")
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up.")
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.")
      } else {
        setError("Failed to log in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-tct-navy">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo size="lg" className="mb-4" />
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400">Enter your credentials to access your account</p>
        </div>
        <div className="bg-tct-navy/80 rounded-lg p-6 shadow-lg border border-tct-cyan/20">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-500 text-white flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-tct-navy/50">
              <TabsTrigger value="email" className="data-[state=active]:bg-tct-magenta data-[state=active]:text-white">
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="data-[state=active]:bg-tct-magenta data-[state=active]:text-white">
                Phone
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-sm text-tct-magenta hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-tct-navy/50 border-tct-cyan/30 text-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-tct-magenta hover:bg-tct-magenta/90" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="phone">
              <div className="p-6 text-center">
                <p className="text-gray-400">Phone authentication coming soon!</p>
                <p className="text-sm text-gray-500 mt-2">Please use email login for now.</p>
              </div>
            </TabsContent>
          </Tabs>
          <div className="text-center text-sm mt-4 text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-tct-magenta hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
