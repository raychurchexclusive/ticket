"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { createConnectAccountLink } from "@/app/api/stripe/actions"

export default function StripeRefresh() {
  const router = useRouter()

  useEffect(() => {
    // This is a simplified example - in a real app, you'd get the seller ID and email from your auth system
    const refreshConnectAccount = async () => {
      const result = await createConnectAccountLink("1", "john.doe@example.com")

      if (result.url) {
        window.location.href = result.url
      }
    }

    refreshConnectAccount()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full bg-tct-navy/80 border border-tct-cyan/20 text-white">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          </div>
          <CardTitle className="text-center">Refreshing Connection</CardTitle>
          <CardDescription className="text-center">
            Please wait while we refresh your Stripe account connection...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>
            You'll be redirected to Stripe to complete your account setup. If you're not redirected automatically,
            please click the button below.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            className="bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90"
            onClick={() => router.push("/dashboard/seller")}
          >
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
