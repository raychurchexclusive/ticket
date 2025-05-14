"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Store, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { requestSellerStatus } from "@/lib/cloud-functions"

export function BecomeSeller() {
  const { userData, refreshUserData } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form state
  const [businessName, setBusinessName] = useState("")
  const [businessDescription, setBusinessDescription] = useState("")
  const [website, setWebsite] = useState("")
  const [taxId, setTaxId] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    setIsSubmitting(true)

    try {
      await requestSellerStatus({
        userId: userData?.uid || "",
        businessName,
        businessDescription,
        website,
        taxId,
      })

      setSuccess(true)
      toast({
        title: "Request submitted",
        description: "Your request to become a seller has been submitted for review.",
      })

      // Refresh user data to get updated role
      await refreshUserData()
    } catch (error: any) {
      console.error("Error submitting seller request:", error)
      setError(error.message || "Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user is already a seller
  if (userData?.role === "seller" || userData?.role === "admin") {
    return (
      <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-tct-magenta" />
            Seller Status
          </CardTitle>
          <CardDescription>Your seller account status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-900/20 rounded-md border border-green-500/30">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="font-medium">You are a verified seller</h3>
              <p className="text-sm text-gray-300">You can create and manage events on the platform</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Seller Dashboard</Label>
            <p className="text-sm text-gray-300">
              Access your seller dashboard to manage events, track sales, and more.
            </p>
            <Button className="bg-tct-magenta hover:bg-tct-magenta/90" asChild>
              <a href="/dashboard/seller">Go to Seller Dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If user has a pending request
  if (userData?.sellerRequest?.status === "pending") {
    return (
      <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-tct-magenta" />
            Seller Application
          </CardTitle>
          <CardDescription>Your application is being reviewed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-900/20 rounded-md border border-yellow-500/30">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <div>
              <h3 className="font-medium">Application Under Review</h3>
              <p className="text-sm text-gray-300">
                We're currently reviewing your application. This process typically takes 1-2 business days.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Application Details</Label>
            <div className="p-3 rounded-md bg-tct-navy/50 border border-tct-cyan/10">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Business Name</p>
                  <p>{userData?.sellerRequest?.businessName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Submitted On</p>
                  <p>
                    {userData?.sellerRequest?.createdAt
                      ? new Date(userData.sellerRequest.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default: User can apply to become a seller
  return (
    <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-tct-magenta" />
          Become a Seller
        </CardTitle>
        <CardDescription>Apply to sell tickets for your events on our platform</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-500 text-white flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-md bg-green-900/20 border border-green-500 text-white flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <p>Your application has been submitted successfully. We'll review it shortly.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Business Name</Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business or organization name"
              className="bg-tct-navy/50 border-tct-cyan/30 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-description">Business Description</Label>
            <Textarea
              id="business-description"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Tell us about your business and the types of events you plan to host"
              className="bg-tct-navy/50 border-tct-cyan/30 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="bg-tct-navy/50 border-tct-cyan/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax ID / Business Number (Optional)</Label>
              <Input
                id="tax-id"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="For tax purposes"
                className="bg-tct-navy/50 border-tct-cyan/30 text-white"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(checked) => setAgreeTerms(!!checked)} />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </Label>
              <p className="text-sm text-gray-400">
                By becoming a seller, you agree to our{" "}
                <a href="#" className="text-tct-cyan hover:underline">
                  Seller Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-tct-cyan hover:underline">
                  Platform Guidelines
                </a>
                .
              </p>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="bg-tct-magenta hover:bg-tct-magenta/90 w-full"
          disabled={isSubmitting || !agreeTerms}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Apply to Become a Seller"}
        </Button>
      </CardFooter>
    </Card>
  )
}
