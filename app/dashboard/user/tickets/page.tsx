"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { TicketCard } from "@/components/ticket-card"
import { getTicketsByUserId } from "@/lib/db-service"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import type { Ticket } from "@/lib/ticket-utils"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if coming from a successful purchase
    const success = searchParams.get("success")
    if (success === "true") {
      setShowSuccessAlert(true)

      // Hide the alert after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setIsLoading(true)
          const userTickets = await getTicketsByUserId(user.uid)
          setTickets(userTickets as Ticket[])
        } catch (error) {
          console.error("Error fetching tickets:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        // User is not logged in
        setTickets([])
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const upcomingTickets = tickets.filter((ticket) => ticket.status === "valid")
  const pastTickets = tickets.filter((ticket) => ticket.status === "used" || ticket.status === "expired")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 rounded-full border-4 border-tct-magenta border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <Button className="bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90">Find More Events</Button>
      </div>

      {showSuccessAlert && (
        <Alert className="bg-green-900/20 border-green-500 text-white">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Purchase Successful!</AlertTitle>
          <AlertDescription>
            Your tickets have been purchased successfully. You should receive a confirmation email shortly.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming ({upcomingTickets.length})</TabsTrigger>
          <TabsTrigger value="past">Past Events ({pastTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingTickets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">You don't have any upcoming tickets.</p>
              <Button className="mt-4 bg-tct-magenta hover:bg-tct-magenta/90">Browse Events</Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastTickets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">You don't have any past tickets.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
