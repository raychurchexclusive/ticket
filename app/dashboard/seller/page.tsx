"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Calendar, MapPin, Users, DollarSign, Plus, Search, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, doc, updateDoc, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore"
import { verifyTicket } from "@/lib/db-service"

interface Event {
  id: string
  title: string
  date: string
  location: string
  image: string
  ticketsSold: number
  ticketsAvailable: number
  revenue: string
  status: "active" | "draft" | "completed" | "cancelled"
}

interface EventRequest {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  price: string
  category: string
  ticketsAvailable: number
  image: string | null
  status: "pending" | "approved" | "rejected"
  requestDate: string
  feedback?: string
}

interface TicketVerification {
  eventId: string
  ticketCode: string
  status: "valid" | "invalid" | "used"
  timestamp: string
}

export default function SellerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [isRequestEventDialogOpen, setIsRequestEventDialogOpen] = useState(false)
  const [ticketCode, setTicketCode] = useState("")
  const [verificationResult, setVerificationResult] = useState<"valid" | "invalid" | "used" | null>(null)
  const [verificationHistory, setVerificationHistory] = useState<TicketVerification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // New event request form state
  const [newEventRequest, setNewEventRequest] = useState<Partial<EventRequest>>({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    price: "",
    category: "Music",
    ticketsAvailable: 100,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Fetch seller's events
    const eventsQuery = query(collection(db, "events"), where("sellerId", "==", user.uid))

    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData: Event[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        eventsData.push({
          id: doc.id,
          title: data.title,
          date: data.date,
          location: data.location,
          image: data.image || "/placeholder.svg?height=200&width=400",
          ticketsSold: data.ticketsSold || 0,
          ticketsAvailable: data.ticketsAvailable || 0,
          revenue: `$${(data.ticketsSold * Number.parseFloat(data.price)).toFixed(2)}`,
          status: data.status || "active",
        })
      })
      setEvents(eventsData)
    })

    // Fetch event requests
    const requestsQuery = query(collection(db, "eventRequests"), where("sellerId", "==", user.uid))

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData: EventRequest[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        requestsData.push({
          id: doc.id,
          title: data.title,
          date: data.date,
          time: data.time,
          location: data.location,
          description: data.description,
          price: data.price,
          category: data.category,
          ticketsAvailable: data.ticketsAvailable,
          image: data.image,
          status: data.status,
          requestDate: data.requestDate,
          feedback: data.feedback,
        })
      })
      setEventRequests(requestsData)
    })

    // Fetch verification history
    const verificationQuery = query(collection(db, "ticketVerifications"), where("sellerId", "==", user.uid))

    const unsubscribeVerifications = onSnapshot(verificationQuery, (snapshot) => {
      const verificationsData: TicketVerification[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        verificationsData.push({
          eventId: data.eventId,
          ticketCode: data.ticketCode,
          status: data.status,
          timestamp: data.timestamp,
        })
      })
      setVerificationHistory(verificationsData)
    })

    return () => {
      unsubscribeEvents()
      unsubscribeRequests()
      unsubscribeVerifications()
    }
  }, [user])

  const handleVerifyTicket = async () => {
    if (!ticketCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await verifyTicket(ticketCode)

      if (result.valid && !result.used) {
        setVerificationResult("valid")
        toast({
          title: "Success",
          description: "Ticket is valid",
        })

        // Mark ticket as used
        const ticketRef = doc(db, "tickets", result.ticketId)
        await updateDoc(ticketRef, {
          used: true,
          usedAt: serverTimestamp(),
          verifiedBy: user?.uid,
        })

        // Add to verification history
        await addDoc(collection(db, "ticketVerifications"), {
          eventId: result.eventId,
          ticketCode: ticketCode,
          status: "valid",
          timestamp: new Date().toISOString(),
          sellerId: user?.uid,
        })
      } else if (result.used) {
        setVerificationResult("used")
        toast({
          title: "Warning",
          description: "Ticket has already been used",
          variant: "destructive",
        })
      } else {
        setVerificationResult("invalid")
        toast({
          title: "Error",
          description: "Invalid ticket code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying ticket:", error)
      toast({
        title: "Error",
        description: "Failed to verify ticket",
        variant: "destructive",
      })
      setVerificationResult("invalid")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitEventRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an event request",
        variant: "destructive",
      })
      return
    }

    try {
      await addDoc(collection(db, "eventRequests"), {
        ...newEventRequest,
        sellerId: user.uid,
        sellerName: user.displayName,
        sellerEmail: user.email,
        status: "pending",
        requestDate: new Date().toISOString(),
        image: selectedImage || null,
      })

      toast({
        title: "Success",
        description: "Event request submitted successfully",
      })

      setIsRequestEventDialogOpen(false)
      setNewEventRequest({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        price: "",
        category: "Music",
        ticketsAvailable: 100,
      })
      setSelectedImage(null)
    } catch (error) {
      console.error("Error submitting event request:", error)
      toast({
        title: "Error",
        description: "Failed to submit event request",
        variant: "destructive",
      })
    }
  }

  const navigateToScanPage = () => {
    router.push("/dashboard/seller/scan")
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsRequestEventDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Request New Event
          </Button>
          <Button onClick={navigateToScanPage} variant="outline">
            <Search className="mr-2 h-4 w-4" /> Scan Tickets
          </Button>
        </div>
      </div>

      <Tabs defaultValue="events">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">My Events</TabsTrigger>
          <TabsTrigger value="requests">Event Requests</TabsTrigger>
          <TabsTrigger value="verification">Verification History</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <Badge
                    className="absolute top-2 right-2"
                    variant={
                      event.status === "active" ? "default" : event.status === "completed" ? "secondary" : "destructive"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {event.ticketsSold} / {event.ticketsAvailable} sold
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="text-sm">{event.revenue}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedEvent(event)
                      setIsVerifyDialogOpen(true)
                    }}
                  >
                    Verify Tickets
                  </Button>
                  <Button onClick={() => router.push(`/events/${event.id}`)}>View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                You don't have any events yet. Request a new event to get started.
              </p>
              <Button className="mt-4" onClick={() => setIsRequestEventDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Request New Event
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{request.title}</CardTitle>
                    <Badge
                      variant={
                        request.status === "pending"
                          ? "outline"
                          : request.status === "approved"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(request.date).toLocaleDateString()} at {request.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {request.location}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3">{request.description}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="font-medium">Price:</span> ${request.price}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Category:</span> {request.category}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Tickets:</span> {request.ticketsAvailable}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Requested:</span>{" "}
                      {new Date(request.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                  {request.status === "rejected" && request.feedback && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded-md">
                      <p className="text-sm font-medium">Feedback:</p>
                      <p className="text-sm">{request.feedback}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {request.status === "approved" && <Button className="w-full">Set Up Event</Button>}
                  {request.status === "rejected" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setNewEventRequest({
                          ...request,
                          feedback: undefined,
                        })
                        setIsRequestEventDialogOpen(true)
                      }}
                    >
                      Edit & Resubmit
                    </Button>
                  )}
                  {request.status === "pending" && (
                    <p className="text-sm text-muted-foreground w-full text-center">
                      Your request is being reviewed by our team.
                    </p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {eventRequests.length === 0 && (
            <div className="text-center p-8">
              <p className="text-muted-foreground">You haven't requested any events yet.</p>
              <Button className="mt-4" onClick={() => setIsRequestEventDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Request New Event
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Verification History</CardTitle>
              <CardDescription>Recent ticket verifications for your events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationHistory.map((verification, index) => {
                  const event = events.find((e) => e.id === verification.eventId)
                  return (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{event?.title || "Unknown Event"}</p>
                        <p className="text-sm text-muted-foreground">Ticket: {verification.ticketCode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {verification.status === "valid" && (
                          <Badge variant="default" className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Valid
                          </Badge>
                        )}
                        {verification.status === "invalid" && (
                          <Badge variant="destructive" className="flex items-center">
                            <XCircle className="h-3 w-3 mr-1" /> Invalid
                          </Badge>
                        )}
                        {verification.status === "used" && (
                          <Badge variant="secondary" className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> Used
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(verification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {verificationHistory.length === 0 && (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No verification history yet.</p>
                  <Button className="mt-4" onClick={navigateToScanPage}>
                    <Search className="mr-2 h-4 w-4" /> Scan Tickets
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verify Ticket Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Ticket</DialogTitle>
            <DialogDescription>Enter the ticket code to verify its authenticity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticketCode">Ticket Code</Label>
              <Input
                id="ticketCode"
                placeholder="e.g., TCT-1234-5678"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
              />
            </div>
            {verificationResult && (
              <div
                className={`p-4 rounded-md ${
                  verificationResult === "valid"
                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : verificationResult === "used"
                      ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                      : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                <div className="flex items-center">
                  {verificationResult === "valid" ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : verificationResult === "used" ? (
                    <Clock className="h-5 w-5 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  <span>
                    {verificationResult === "valid"
                      ? "Ticket is valid"
                      : verificationResult === "used"
                        ? "Ticket has already been used"
                        : "Invalid ticket code"}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifyTicket} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Event Dialog */}
      <Dialog open={isRequestEventDialogOpen} onOpenChange={setIsRequestEventDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request New Event</DialogTitle>
            <DialogDescription>
              Fill out the form below to request a new event. Our team will review your request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEventRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Music Festival"
                  value={newEventRequest.title}
                  onChange={(e) => setNewEventRequest({ ...newEventRequest, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newEventRequest.category}
                  onValueChange={(value) => setNewEventRequest({ ...newEventRequest, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Comedy">Comedy</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEventRequest.date}
                  onChange={(e) => setNewEventRequest({ ...newEventRequest, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  placeholder="e.g., 7:00 PM - 10:00 PM"
                  value={newEventRequest.time}
                  onChange={(e) => setNewEventRequest({ ...newEventRequest, time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Central Park, New York"
                  value={newEventRequest.location}
                  onChange={(e) => setNewEventRequest({ ...newEventRequest, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Ticket Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 29.99"
                  value={newEventRequest.price}
                  onChange={(e) => setNewEventRequest({ ...newEventRequest, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticketsAvailable">Tickets Available</Label>
                <Input
                  id="ticketsAvailable"
                  type="number"
                  min="1"
                  placeholder="e.g., 100"
                  value={newEventRequest.ticketsAvailable}
                  onChange={(e) =>
                    setNewEventRequest({
                      ...newEventRequest,
                      ticketsAvailable: Number.parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Event Image</Label>
                <Input id="image" type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  rows={4}
                  value={newEventRequest.description}
                  onChange={(e) =>
                    setNewEventRequest({
                      ...newEventRequest,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            {selectedImage && (
              <div className="relative h-40 w-full">
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt="Selected event image"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRequestEventDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
