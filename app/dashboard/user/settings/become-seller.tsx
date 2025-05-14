"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Store } from "lucide-react"
import { updateUserToSeller } from "@/lib/cloud-functions"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"

export function BecomeSeller() {
  const { userData, refreshUserData } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleBecomeSeller = async () => {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      await updateUserToSeller()
      setSuccess(true)
      toast({
        title: "Success!",
        description: "You are now a seller. Refreshing your profile...",
      })

      // Refresh user data to get updated role
      await refreshUserData()
    } catch (error: any) {
      console.error("Error becoming a seller:", error)
      setError("Failed to update your account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (userData?.role === "seller" || userData?.role === "admin") {
    return (
      <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-tct-cyan" />
            Seller Status
          </CardTitle>
          <CardDescription>Your seller account status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">You are already a seller!</p>
              <p className="text-sm text-gray-300">You can create and manage events from your seller dashboard.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90" asChild>
            <a href="/dashboard/seller">Go to Seller Dashboard</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-tct-cyan" />
          Become a Seller
        </CardTitle>
        <CardDescription>Start selling tickets for your own events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-900/20 border border-red-500 text-white flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Success!</p>
              <p className="text-sm text-gray-300">Your account has been upgraded to seller status.</p>
            </div>
          </div>
        ) : (
          <>
            <p>
              As a seller on Top City Tickets, you can create and manage your own events, sell tickets, and track
              attendance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-md bg-tct-navy/50 border border-tct-cyan/10">
                <h3 className="font-medium mb-1">Create Events</h3>
                <p className="text-sm text-gray-300">List your concerts, shows, conferences, and more</p>
              </div>
              <div className="p-3 rounded-md bg-tct-navy/50 border border-tct-cyan/10">
                <h3 className="font-medium mb-1">Sell Tickets</h3>
                <p className="text-sm text-gray-300">Set prices and manage ticket inventory</p>
              </div>
              <div className="p-3 rounded-md bg-tct-navy/50 border border-tct-cyan/10">
                <h3 className="font-medium mb-1">Track Sales</h3>
                <p className="text-sm text-gray-300">Monitor ticket sales and revenue in real-time</p>
              </div>
              <div className="p-3 rounded-md bg-tct-navy/50 border border-tct-cyan/10">
                <h3 className="font-medium mb-1">Verify Tickets</h3>
                <p className="text-sm text-gray-300">Scan and validate tickets at your events</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        {success ? (
          <Button className="w-full bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90" asChild>
            <a href="/dashboard/seller">Go to Seller Dashboard</a>
          </Button>
        ) : (
          <Button
            className="w-full bg-tct-magenta hover:bg-tct-magenta/90"
            onClick={handleBecomeSeller}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Become a Seller"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
