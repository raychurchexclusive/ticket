"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function StripeSuccess() {
  const router = useRouter()

  useEffect(() => {
    // You could fetch the latest account status here
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full bg-tct-navy/80 border border-tct-cyan/20 text-white">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center">Stripe Account Connected</CardTitle>
          <CardDescription className="text-center">
            Your Stripe account has been successfully connected to Top City Tickets.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>
            You can now receive payments for ticket sales directly to your bank account. Top City Tickets takes an 8%
            platform fee from each transaction.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className="bg-tct-magenta hover:bg-tct-magenta/90" onClick={() => router.push("/dashboard/seller")}>
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
