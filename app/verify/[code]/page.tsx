"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"

export default function VerifyTicketPage() {
  const params = useParams()
  const ticketCode = params.code as string

  const [isLoading, setIsLoading] = useState(true)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function verifyTicket() {
      try {
        const response = await fetch(`/api/verify/${ticketCode}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify ticket")
        }

        setVerificationResult(data)
      } catch (error) {
        console.error("Error verifying ticket:", error)
        setError("Failed to verify ticket. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    verifyTicket()
  }, [ticketCode])

  return (
    <div className="min-h-screen bg-tct-navy flex flex-col">
      <header className="bg-tct-navy text-white p-4 border-b border-tct-navy/30">
        <div className="container mx-auto flex items-center">
          <Logo size="md" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader>
            <CardTitle className="text-center">Ticket Verification</CardTitle>
            <CardDescription className="text-center">Verifying ticket code: {ticketCode}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full border-4 border-tct-magenta border-t-transparent animate-spin mb-4"></div>
                <p>Verifying ticket...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Verification Error</h3>
                <p className="text-gray-300">{error}</p>
              </div>
            ) : verificationResult ? (
              <div className="flex flex-col items-center text-center">
                {verificationResult.status === "valid" ? (
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                ) : verificationResult.status === "used" ? (
                  <Clock className="h-16 w-16 text-yellow-500 mb-4" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                )}

                <h3 className="text-xl font-bold mb-2">
                  {verificationResult.status === "valid"
                    ? "Valid Ticket"
                    : verificationResult.status === "used"
                      ? "Already Used"
                      : "Invalid Ticket"}
                </h3>

                {verificationResult.status === "valid" ? (
                  <div className="space-y-2">
                    <p className="text-green-400">This ticket is valid and ready to use.</p>
                    <p className="text-gray-300">Event: {verificationResult.eventTitle}</p>
                  </div>
                ) : verificationResult.status === "used" ? (
                  <div className="space-y-2">
                    <p className="text-yellow-400">This ticket has already been used.</p>
                    <p className="text-gray-300">Event: {verificationResult.eventTitle}</p>
                    <p className="text-gray-300">Used on: {new Date(verificationResult.usedDate).toLocaleString()}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-red-400">{verificationResult.reason || "This ticket is not valid."}</p>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button variant="outline" className="border-tct-cyan text-white hover:text-tct-navy">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
