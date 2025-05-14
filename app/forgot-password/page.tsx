"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
      toast({
        title: "Reset email sent",
        description: "Check your inbox for password reset instructions",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)

      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address. Please check and try again.")
      } else {
        setError("Failed to send reset email. Please try again.")
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
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="text-gray-400">Enter your email to receive a password reset link</p>
        </div>
        <div className="bg-tct-navy/80 rounded-lg p-6 shadow-lg border border-tct-cyan/20">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-500 text-white flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-green-900/20 border border-green-500 text-white flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Reset email sent!</p>
                  <p className="text-sm">Check your inbox for instructions to reset your password.</p>
                </div>
              </div>
              <div className="text-center">
                <Link href="/login">
                  <Button variant="outline" className="mt-2">
                    Return to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
              <Button type="submit" className="w-full bg-tct-magenta hover:bg-tct-magenta/90" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
              <div className="text-center text-sm mt-4 text-gray-400">
                Remember your password?{" "}
                <Link href="/login" className="text-tct-magenta hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
