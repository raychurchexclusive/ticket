"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createConnectAccountLink, getSellerStripeAccount } from "@/app/api/stripe/actions"
import { CreditCard, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"

interface ConnectAccountProps {
  sellerId: string
  email: string
}

export function ConnectAccount({ sellerId, email }: ConnectAccountProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [accountStatus, setAccountStatus] = useState<{
    accountId?: string
    payoutsEnabled?: boolean
    chargesEnabled?: boolean
    detailsSubmitted?: boolean
    error?: string
  }>({})

  const checkAccountStatus = async () => {
    const result = await getSellerStripeAccount(sellerId)
    setAccountStatus(result)
  }

  // Check status on component mount
  useState(() => {
    checkAccountStatus()
  })

  const handleConnectAccount = async () => {
    setIsLoading(true)
    try {
      const result = await createConnectAccountLink(sellerId, email)

      if (result.error) {
        console.error(result.error)
      } else if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Error connecting Stripe account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-tct-magenta" />
          Stripe Connect
        </CardTitle>
        <CardDescription>Connect your Stripe account to receive payments for ticket sales</CardDescription>
      </CardHeader>
      <CardContent>
        {accountStatus.error ? (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p>Error retrieving account status. Please try again.</p>
          </div>
        ) : accountStatus.accountId && accountStatus.detailsSubmitted && accountStatus.payoutsEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <p>Your Stripe account is connected and ready to receive payments!</p>
            </div>
            <div className="text-sm text-gray-300">
              <p>Account ID: {accountStatus.accountId.substring(0, 8)}...</p>
              <p>Payouts enabled: {accountStatus.payoutsEnabled ? "Yes" : "No"}</p>
              <p>Charges enabled: {accountStatus.chargesEnabled ? "Yes" : "No"}</p>
            </div>
          </div>
        ) : accountStatus.accountId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              <p>Your Stripe account is connected but not fully set up.</p>
            </div>
            <p className="text-sm text-gray-300">Please complete your account setup to start receiving payments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p>
              Connect your Stripe account to receive payments directly to your bank account. Top City Tickets takes an
              8% platform fee from each transaction.
            </p>
            <div className="flex items-center gap-2 p-3 bg-tct-navy/50 rounded-md border border-tct-cyan/10">
              <CreditCard className="h-5 w-5 text-tct-cyan" />
              <div className="text-sm">
                <p className="font-medium">Secure Payments</p>
                <p className="text-gray-300">Stripe handles all payment processing and security</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {accountStatus.accountId && accountStatus.detailsSubmitted && accountStatus.payoutsEnabled ? (
          <Button variant="outline" className="w-full" onClick={checkAccountStatus}>
            Refresh Status
          </Button>
        ) : accountStatus.accountId ? (
          <Button
            className="w-full bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90"
            onClick={handleConnectAccount}
            disabled={isLoading}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isLoading ? "Loading..." : "Complete Account Setup"}
          </Button>
        ) : (
          <Button
            className="w-full bg-tct-magenta hover:bg-tct-magenta/90"
            onClick={handleConnectAccount}
            disabled={isLoading}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isLoading ? "Loading..." : "Connect Stripe Account"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
