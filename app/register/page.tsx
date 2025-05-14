"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, currentUser } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const displayName = `${firstName} ${lastName}`.trim()
      await signUp(email, password, displayName)

      toast({
        title: "Account created",
        description: "Welcome to Top City Tickets!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Registration error:", error)

      // Handle different Firebase auth errors
      if (error.code === "auth/email-already-in-use") {
        setError("Email is already in use. Please log in or use a different email.")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address. Please check and try again.")
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.")
      } else {
        setError("Failed to create account. Please try again.")
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
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-gray-400">Enter your information to get started</p>
        </div>
        <div className="bg-tct-navy/80 rounded-lg p-6 shadow-lg border border-tct-cyan/20">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-500 text-white flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="text-white">
                  First name
                </Label>
                <Input
                  id="first-name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name" className="text-white">
                  Last name
                </Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
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
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-tct-navy/50 border-tct-cyan/30 text-white"
              />
              <p className="text-xs text-gray-400">Must be at least 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-tct-navy/50 border-tct-cyan/30 text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-tct-magenta hover:bg-tct-magenta/90" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="text-center text-sm mt-4 text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-tct-magenta hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
