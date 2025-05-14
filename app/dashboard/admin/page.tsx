"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  DollarSign,
  Plus,
  Ticket,
  Users,
  Trash2,
  Upload,
  X,
  Edit,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

// Types
interface Seller {
  id: string
  email: string
  status: "active" | "pending" | "inactive"
  events: number
  dateAdded: string
}

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  price: string
  category: string
  image: string
  ticketsAvailable: number
  ticketsSold: number
  status: "active" | "draft" | "completed" | "cancelled"
}

interface EventRequest {
  id: string
  sellerId: string
  sellerEmail: string
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

export default function AdminDashboard() {
  // Seller state
  const [sellers, setSellers] = useState<Seller[]>([
    {
      id: "1",
      email: "john.doe@example.com",
      status: "active",
      events: 3,
      dateAdded: "2025-01-15",
    },
    {
      id: "2",
      email: "jane.smith@example.com",
      status: "active",
      events: 2,
      dateAdded: "2025-02-20",
    },
    {
      id: "3",
      email: "mark.wilson@example.com",
      status: "pending",
      events: 0,
      dateAdded: "2025-03-05",
    },
  ])
  const [newSellerEmail, setNewSellerEmail] = useState("")
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false)
  const [sellerToDelete, setSellerToDelete] = useState<string | null>(null)
  const [isDeleteSellerDialogOpen, setIsDeleteSellerDialogOpen] = useState(false)

  // Event state
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Summer Music Festival",
      date: "2025-06-15",
      time: "14:00 - 22:00",
      location: "Central Park, New York",
      price: "49.99",
      category: "Music",
      image: "/placeholder.svg?height=200&width=400",
      ticketsAvailable: 250,
      ticketsSold: 120,
      status: "active",
    },
    {
      id: "2",
      title: "Tech Conference 2025",
      date: "2025-07-10",
      time: "09:00 - 17:00",
      location: "Convention Center, San Francisco",
      price: "99.99",
      category: "Conference",
      image: "/placeholder.svg?height=200&width=400",
      ticketsAvailable: 500,
      ticketsSold: 85,
      status: "active",
    },
    {
      id: "3",
      title: "Comedy Night",
      date: "2025-05-25",
      time: "20:00 - 23:00",
      location: "Laugh Factory, Los Angeles",
      price: "29.99",
      category: "Comedy",
      image: "/placeholder.svg?height=200&width=400",
      ticketsAvailable: 150,
      ticketsSold: 42,
      status: "draft",
    },
  ])
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    date: "",
    time: "",
    location: "",
    price: "",
    category: "Music",
    ticketsAvailable: 100,
    status: "draft",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Event requests state
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([
    {
      id: "req1",
      sellerId: "1",
      sellerEmail: "john.doe@example.com",
      title: "Comedy Night",
      date: "2025-05-25",
      time: "8:00 PM - 11:00 PM",
      location: "Laugh Factory, Los Angeles",
      description: "A night of non-stop laughter featuring the funniest stand-up comedians in the country.",
      price: "29.99",
      category: "Comedy",
      ticketsAvailable: 150,
      image: "/placeholder.svg?height=200&width=400",
      status: "pending",
      requestDate: "2025-03-10",
    },
    {
      id: "req2",
      sellerId: "2",
      sellerEmail: "jane.smith@example.com",
      title: "Jazz in the Park",
      date: "2025-07-20",
      time: "6:00 PM - 9:00 PM",
      location: "Golden Gate Park, San Francisco",
      description: "An evening of smooth jazz under the stars. Bring your own blanket and refreshments.",
      price: "19.99",
      category: "Music",
      ticketsAvailable: 200,
      image: null,
      status: "pending",
      requestDate: "2025-03-05",
    },
    {
      id: "req3",
      sellerId: "1",
      sellerEmail: "john.doe@example.com",
      title: "Indie Film Festival",
      date: "2025-08-15",
      time: "12:00 PM - 10:00 PM",
      location: "Downtown Cinema, Chicago",
      description: "A showcase of independent films from around the world.",
      price: "39.99",
      category: "Arts",
      ticketsAvailable: 300,
      image: null,
      status: "pending",
      requestDate: "2025-03-01",
    },
  ])
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null)
  const [isRequestDetailsDialogOpen, setIsRequestDetailsDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionFeedback, setRejectionFeedback] = useState("")

  // Handler functions for sellers
  const handleAddSeller = () => {
    if (newSellerEmail && !sellers.some((seller) => seller.email === newSellerEmail)) {
      const newSeller: Seller = {
        id: (sellers.length + 1).toString(),
        email: newSellerEmail,
        status: "active",
        events: 0,
        dateAdded: new Date().toISOString().split("T")[0],
      }
      setSellers([...sellers, newSeller])
      setNewSellerEmail("")
      setIsSellerDialogOpen(false)
      toast({
        title: "Seller added",
        description: `${newSellerEmail} has been added as a seller.`,
      })
    } else if (sellers.some((seller) => seller.email === newSellerEmail)) {
      toast({
        title: "Error",
        description: "This email is already registered as a seller.",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteSeller = (sellerId: string) => {
    setSellerToDelete(sellerId)
    setIsDeleteSellerDialogOpen(true)
  }

  const handleDeleteSeller = () => {
    if (sellerToDelete) {
      const sellerEmail = sellers.find((s) => s.id === sellerToDelete)?.email
      setSellers(sellers.filter((seller) => seller.id !== sellerToDelete))
      setIsDeleteSellerDialogOpen(false)
      setSellerToDelete(null)
      toast({
        title: "Seller removed",
        description: `${sellerEmail} has been removed from sellers.`,
      })
    }
  }

  // Handler functions for events
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.price) {
      const eventToAdd: Event = {
        id: (events.length + 1).toString(),
        title: newEvent.title || "",
        date: newEvent.date || "",
        time: newEvent.time || "",
        location: newEvent.location || "",
        price: newEvent.price || "",
        category: newEvent.category || "Music",
        image: selectedImage || "/placeholder.svg?height=200&width=400",
        ticketsAvailable: newEvent.ticketsAvailable || 100,
        ticketsSold: 0,
        status: (newEvent.status as "active" | "draft" | "completed" | "cancelled") || "draft",
      }
      setEvents([...events, eventToAdd])
      setNewEvent({
        title: "",
        date: "",
        time: "",
        location: "",
        price: "",
        category: "Music",
        ticketsAvailable: 100,
        status: "draft",
      })
      setSelectedImage(null)
      setIsEventDialogOpen(false)
      toast({
        title: "Event created",
        description: `${eventToAdd.title} has been created successfully.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields (title, date, price).",
        variant: "destructive",
      })
    }
  }

  // Handler functions for event requests
  const viewRequestDetails = (request: EventRequest) => {
    setSelectedRequest(request)
    setIsRequestDetailsDialogOpen(true)
  }

  const openApproveDialog = (request: EventRequest) => {
    setSelectedRequest(request)
    setIsApproveDialogOpen(true)
  }

  const openRejectDialog = (request: EventRequest) => {
    setSelectedRequest(request)
    setRejectionFeedback("")
    setIsRejectDialogOpen(true)
  }

  const handleApproveRequest = () => {
    if (!selectedRequest) return

    // Update the request status
    const updatedRequests = eventRequests.map((req) =>
      req.id === selectedRequest.id ? { ...req, status: "approved" as const } : req,
    )
    setEventRequests(updatedRequests)

    // Create a new event from the request
    const newEventFromRequest: Event = {
      id: (events.length + 1).toString(),
      title: selectedRequest.title,
      date: selectedRequest.date,
      time: selectedRequest.time,
      location: selectedRequest.location,
      price: selectedRequest.price,
      category: selectedRequest.category,
      image: selectedRequest.image || "/placeholder.svg?height=200&width=400",
      ticketsAvailable: selectedRequest.ticketsAvailable,
      ticketsSold: 0,
      status: "active",
    }
    setEvents([...events, newEventFromRequest])

    // Update seller's event count
    const updatedSellers = sellers.map((seller) =>
      seller.id === selectedRequest.sellerId ? { ...seller, events: seller.events + 1 } : seller,
    )
    setSellers(updatedSellers)

    setIsApproveDialogOpen(false)
    setSelectedRequest(null)

    toast({
      title: "Event request approved",
      description: `${selectedRequest.title} has been approved and added to events.`,
    })
  }

  const handleRejectRequest = () => {
    if (!selectedRequest) return

    const updatedRequests = eventRequests.map((req) =>
      req.id === selectedRequest.id ? { ...req, status: "rejected" as const, feedback: rejectionFeedback } : req,
    )
    setEventRequests(updatedRequests)
    setIsRejectDialogOpen(false)
    setSelectedRequest(null)

    toast({
      title: "Event request rejected",
      description: `${selectedRequest.title} has been rejected.`,
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "draft":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const pendingRequestsCount = eventRequests.filter((req) => req.status === "pending").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-tct-magenta hover:bg-tct-magenta/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Seller
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-tct-navy border border-tct-cyan/20 text-white">
              <DialogHeader>
                <DialogTitle>Add New Seller</DialogTitle>
                <DialogDescription>
                  Enter the email address of the seller you want to add. They will have access to the seller dashboard.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="seller-email">Seller Email</Label>
                  <Input
                    id="seller-email"
                    type="email"
                    placeholder="seller@example.com"
                    value={newSellerEmail}
                    onChange={(e) => setNewSellerEmail(e.target.value)}
                    className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSellerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-tct-magenta hover:bg-tct-magenta/90" onClick={handleAddSeller}>
                  Add Seller
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-tct-navy border border-tct-cyan/20 text-white">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new event. Required fields are marked with an asterisk (*).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">
                      Event Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="event-title"
                      placeholder="Summer Music Festival"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-category">Category</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                    >
                      <SelectTrigger id="event-category" className="bg-tct-navy/50 border-tct-cyan/30 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-tct-navy border border-tct-cyan/20 text-white">
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Conference">Conference</SelectItem>
                        <SelectItem value="Comedy">Comedy</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Food">Food & Drink</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-date">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-time">Time</Label>
                    <Input
                      id="event-time"
                      placeholder="7:00 PM - 10:00 PM"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    placeholder="Central Park, New York"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-price">
                      Price ($) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="event-price"
                      placeholder="49.99"
                      value={newEvent.price}
                      onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                      className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-tickets">Tickets Available</Label>
                    <Input
                      id="event-tickets"
                      type="number"
                      placeholder="100"
                      value={newEvent.ticketsAvailable?.toString()}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, ticketsAvailable: Number.parseInt(e.target.value) || 100 })
                      }
                      className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-image">Event Flyer</Label>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input
                      id="event-image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                    />
                    <div
                      className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedImage ? (
                        <div className="relative w-full">
                          <Image
                            src={selectedImage || "/placeholder.svg"}
                            alt="Event flyer preview"
                            width={200}
                            height={200}
                            className="mx-auto h-40 object-contain"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-0 right-0 h-6 w-6 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedImage(null)
                              if (fileInputRef.current) fileInputRef.current.value = ""
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload event flyer</p>
                          <p className="text-xs text-gray-400 mt-1">Recommended size: 1200 x 630 pixels</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-status">Status</Label>
                  <Select
                    value={newEvent.status}
                    onValueChange={(value) =>
                      setNewEvent({
                        ...newEvent,
                        status: value as "active" | "draft" | "completed" | "cancelled",
                      })
                    }
                  >
                    <SelectTrigger id="event-status" className="bg-tct-navy/50 border-tct-cyan/30 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-tct-navy border border-tct-cyan/20 text-white">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90" onClick={handleAddEvent}>
                  Create Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-tct-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-green-500">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-tct-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-green-500">+15% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-tct-coral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {events.filter((e) => new Date(e.date) > new Date()).length} upcoming events
            </p>
          </CardContent>
        </Card>
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Event Requests</CardTitle>
            <Clock className="h-4 w-4 text-tct-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequestsCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingRequestsCount > 0 ? `${pendingRequestsCount} pending approval` : "No pending requests"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">
            Event Requests
            {pendingRequestsCount > 0 && (
              <span className="ml-2 rounded-full bg-tct-magenta px-2 py-0.5 text-xs text-white">
                {pendingRequestsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle>Event Requests</CardTitle>
              <CardDescription>Review and manage event requests from sellers.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Clock className="h-10 w-10 mb-2 opacity-20" />
                          <p>No event requests found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-xs text-muted-foreground">{request.location}</div>
                        </TableCell>
                        <TableCell>{request.sellerEmail}</TableCell>
                        <TableCell>
                          <div>{new Date(request.date).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{request.time}</div>
                        </TableCell>
                        <TableCell>{request.category}</TableCell>
                        <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                              request.status,
                            )}`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-tct-cyan/10 text-tct-cyan hover:bg-tct-cyan/20 hover:text-tct-cyan"
                              onClick={() => viewRequestDetails(request)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                            {request.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                                  onClick={() => openApproveDialog(request)}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                  onClick={() => openRejectDialog(request)}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registered Sellers</CardTitle>
                <CardDescription>
                  Manage seller accounts and permissions. Sellers can create and manage their own events.
                </CardDescription>
              </div>
              <Button className="bg-tct-magenta hover:bg-tct-magenta/90" onClick={() => setIsSellerDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Seller
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-10 w-10 mb-2 opacity-20" />
                          <p>No sellers found</p>
                          <Button
                            variant="link"
                            className="mt-2 text-tct-magenta"
                            onClick={() => setIsSellerDialogOpen(true)}
                          >
                            Add your first seller
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sellers.map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell className="font-medium">{seller.email}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                              seller.status,
                            )}`}
                          >
                            {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{seller.events}</TableCell>
                        <TableCell>{new Date(seller.dateAdded).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => confirmDeleteSeller(seller.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Events</CardTitle>
                <CardDescription>Manage events across the platform.</CardDescription>
              </div>
              <Button
                className="bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90"
                onClick={() => setIsEventDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Calendar className="h-10 w-10 mb-2 opacity-20" />
                          <p>No events found</p>
                          <Button
                            variant="link"
                            className="mt-2 text-tct-cyan"
                            onClick={() => setIsEventDialogOpen(true)}
                          >
                            Create your first event
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded overflow-hidden relative">
                              <Image
                                src={event.image || "/placeholder.svg"}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-xs text-muted-foreground">{event.location}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{new Date(event.date).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{event.time}</div>
                        </TableCell>
                        <TableCell>${event.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-tct-magenta h-2 rounded-full"
                                style={{
                                  width: `${Math.min(100, (event.ticketsSold / event.ticketsAvailable) * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs whitespace-nowrap">
                              {event.ticketsSold}/{event.ticketsAvailable}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                              event.status,
                            )}`}
                          >
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User management content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Seller Confirmation Dialog */}
      <Dialog open={isDeleteSellerDialogOpen} onOpenChange={setIsDeleteSellerDialogOpen}>
        <DialogContent className="bg-tct-navy border border-tct-cyan/20 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this seller? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-4 border rounded-md bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-500">
              This will remove the seller's access to the platform and all their associated data.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteSellerDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSeller}>
              Delete Seller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Request Details Dialog */}
      <Dialog open={isRequestDetailsDialogOpen} onOpenChange={setIsRequestDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-tct-navy border border-tct-cyan/20 text-white">
          <DialogHeader>
            <DialogTitle>Event Request Details</DialogTitle>
            <DialogDescription>
              Review the details of this event request from {selectedRequest?.sellerEmail}.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3 relative h-40 rounded-md overflow-hidden">
                  <Image
                    src={selectedRequest.image || "/placeholder.svg?height=200&width=200"}
                    alt={selectedRequest.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="md:w-2/3 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold">{selectedRequest.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRequest.category}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-tct-magenta" />
                    <span>{new Date(selectedRequest.date).toLocaleDateString()}</span>
                    {selectedRequest.time && (
                      <>
                        <span>•</span>
                        <span>{selectedRequest.time}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-tct-cyan" />
                    <span>${selectedRequest.price}</span>
                    <span>•</span>
                    <span>{selectedRequest.ticketsAvailable} tickets</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-tct-coral" />
                    <span>Requested on {new Date(selectedRequest.requestDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm">{selectedRequest.description || "No description provided."}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Location</h4>
                <p className="text-sm">{selectedRequest.location || "No location specified."}</p>
              </div>

              {selectedRequest.status !== "pending" && (
                <div className="space-y-2">
                  <h4 className="font-medium">Status</h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        selectedRequest.status,
                      )}`}
                    >
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </span>
                    {selectedRequest.feedback && <span className="text-sm">- {selectedRequest.feedback}</span>}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                  onClick={() => {
                    setIsRequestDetailsDialogOpen(false)
                    openRejectDialog(selectedRequest)
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsRequestDetailsDialogOpen(false)
                    openApproveDialog(selectedRequest)
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            {selectedRequest?.status !== "pending" && (
              <Button variant="outline" onClick={() => setIsRequestDetailsDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Event Request Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="bg-tct-navy border border-tct-cyan/20 text-white">
          <DialogHeader>
            <DialogTitle>Approve Event Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this event request? This will create a new event and make it available on
              the platform.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded overflow-hidden relative">
                  <Image
                    src={selectedRequest.image || "/placeholder.svg"}
                    alt={selectedRequest.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{selectedRequest.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selectedRequest.date).toLocaleDateString()} • {selectedRequest.category}
                  </div>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-md bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-600">
                  This event will be immediately visible to users and tickets will be available for purchase.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApproveRequest}>
              Approve Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Event Request Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-tct-navy border border-tct-cyan/20 text-white">
          <DialogHeader>
            <DialogTitle>Reject Event Request</DialogTitle>
            <DialogDescription>
              Please provide feedback to the seller about why this event request is being rejected.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded overflow-hidden relative">
                  <Image
                    src={selectedRequest.image || "/placeholder.svg"}
                    alt={selectedRequest.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{selectedRequest.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selectedRequest.date).toLocaleDateString()} • {selectedRequest.category}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejection-feedback">Feedback (Optional)</Label>
                <Textarea
                  id="rejection-feedback"
                  placeholder="Provide feedback to the seller..."
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  rows={3}
                  className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectRequest}>
              Reject Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
