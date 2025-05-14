"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CreditCard, ExternalLink, Search, Ticket } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRealtimeCollection } from "@/hooks/use-realtime-data"
import { TicketCard } from "@/components/ticket-card"
import type { Ticket as TicketType } from "@/lib/ticket-utils"

export default function UserDashboard() {
  const { userData } = useAuth()
  const userId = userData?.uid

  // Fetch tickets in real-time
  const { data: tickets, loading: ticketsLoading } = useRealtimeCollection<TicketType>("tickets", {
    where: [["userId", "==", userId || ""]],
    orderBy: [["purchaseDate", "desc"]],
  })

  // Fetch upcoming events in real-time
  const { data: savedEvents, loading: eventsLoading } = useRealtimeCollection("savedEvents", {
    where: [["userId", "==", userId || ""]],
    limit: 3,
  })

  // Filter tickets by status
  const upcomingTickets = tickets.filter((ticket) => ticket.status === "valid")
  const pastTickets = tickets.filter((ticket) => ticket.status === "used" || ticket.status === "expired")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <Link href="/events">
          <Button className="bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90">
            <Search className="h-4 w-4 mr-2" />
            Find Events
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-tct-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingTickets.length > 0
                ? `Next event in ${getNextEventDays(upcomingTickets)} days`
                : "No upcoming events"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-tct-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingTickets.length} upcoming, {pastTickets.length} past
            </p>
          </CardContent>
        </Card>
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-tct-coral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Visa •••• 4242 is default</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="saved">Saved Events</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {ticketsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
                  <div className="animate-pulse">
                    <div className="h-40 w-full bg-tct-navy/50"></div>
                    <div className="p-4">
                      <div className="h-4 w-3/4 bg-tct-navy/50 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-tct-navy/50 rounded mb-4"></div>
                      <div className="h-32 w-32 mx-auto bg-tct-navy/50 rounded-md mb-4"></div>
                      <div className="h-8 w-full bg-tct-navy/50 rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : upcomingTickets.length === 0 ? (
            <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
              <CardHeader>
                <CardTitle>No Upcoming Tickets</CardTitle>
                <CardDescription>You don't have any upcoming events.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <Ticket className="h-12 w-12 mx-auto text-gray-500 mb-4 opacity-20" />
                <p className="text-gray-400 mb-4">Looks like you don't have any tickets for upcoming events.</p>
                <Link href="/events">
                  <Button className="bg-tct-magenta hover:bg-tct-magenta/90">Browse Events</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {ticketsLoading ? (
            <div className="animate-pulse">
              <div className="h-40 w-full bg-tct-navy/50 rounded mb-4"></div>
            </div>
          ) : pastTickets.length === 0 ? (
            <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
              <CardHeader>
                <CardTitle>Past Events</CardTitle>
                <CardDescription>View your ticket history for past events.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>You have no past events.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {eventsLoading ? (
            <div className="animate-pulse">
              <div className="h-40 w-full bg-tct-navy/50 rounded mb-4"></div>
            </div>
          ) : savedEvents.length === 0 ? (
            <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
              <CardHeader>
                <CardTitle>Saved Events</CardTitle>
                <CardDescription>Events you've saved for later.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>You have no saved events.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden bg-tct-navy/80 border border-tct-cyan/20 text-white">
                  <div className="relative h-40 w-full">
                    <Image
                      src={event.image || "/placeholder.svg?height=200&width=400"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      <div className="flex items-center text-sm mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{event.date}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-300 mb-4">{event.location}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4 border-tct-cyan/20">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date}
                    </Button>
                    <Link href={`/events/${event.id}`}>
                      <Button className="bg-tct-magenta hover:bg-tct-magenta/90" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to calculate days until next event
function getNextEventDays(tickets: TicketType[]): number {
  if (tickets.length === 0) return 0

  const now = new Date()
  let closestDate = Number.POSITIVE_INFINITY

  tickets.forEach((ticket) => {
    // In a real app, you would get the event date from the event document
    // For now, we'll use a placeholder calculation
    const eventDate = new Date(ticket.purchaseDate)
    eventDate.setDate(eventDate.getDate() + 30) // Assume event is 30 days after purchase

    const diffTime = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0 && diffDays < closestDate) {
      closestDate = diffDays
    }
  })

  return closestDate === Number.POSITIVE_INFINITY ? 0 : closestDate
}
