"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Share2, CalendarX } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"

interface Event {
  id: string
  title: string
  date: string
  location: string
  image: string
  price: string
  category: string
}

export function EventCarousel() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date()
        const eventsRef = collection(db, "events")
        const eventsQuery = query(
          eventsRef,
          where("status", "==", "active"),
          where("date", ">=", now.toISOString().split("T")[0]),
          orderBy("date", "asc"),
          limit(10),
        )

        const snapshot = await getDocs(eventsQuery)

        if (snapshot.empty) {
          setEvents([])
        } else {
          const eventData = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title,
              date: data.date,
              location: data.location,
              image: data.image || "/placeholder.svg?height=200&width=400",
              price: `$${data.price}`,
              category: data.category,
            }
          })
          setEvents(eventData)
        }
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const nextSlide = () => {
    if (events.length === 0) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
  }

  const prevSlide = () => {
    if (events.length === 0) return
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
  }

  const shareEvent = async (event: Event) => {
    const shareUrl = `${window.location.origin}/events/${event.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} at ${event.location} on ${event.date}`,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied!",
        description: "Event link copied to clipboard",
      })
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || events.length === 0) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex, isAutoPlaying, events.length])

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Music":
        return "bg-tct-magenta text-white"
      case "Conference":
        return "bg-tct-cyan text-tct-navy"
      case "Comedy":
        return "bg-tct-coral text-white"
      case "Sports":
        return "bg-tct-navy text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <Card className="relative overflow-hidden border-2 border-tct-cyan/20 bg-tct-navy/80 shadow-xl">
          <div className="h-48 w-full bg-tct-navy/50 animate-pulse"></div>
          <CardContent className="p-4 text-white">
            <div className="h-6 w-3/4 bg-tct-navy/50 animate-pulse mb-4"></div>
            <div className="h-4 w-1/2 bg-tct-navy/50 animate-pulse mb-4"></div>
            <div className="flex justify-between">
              <div className="h-8 w-1/4 bg-tct-navy/50 animate-pulse"></div>
              <div className="h-8 w-1/4 bg-tct-navy/50 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-tct-magenta rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>
        <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-tct-cyan rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>

        <Card className="relative overflow-hidden border-2 border-tct-cyan/20 bg-tct-navy/80 shadow-xl">
          <CardContent className="p-8 text-white flex flex-col items-center justify-center min-h-[250px]">
            <CalendarX className="h-16 w-16 text-tct-magenta mb-4 opacity-70" />
            <h3 className="text-xl font-bold text-center mb-2">No Events Scheduled</h3>
            <p className="text-gray-300 text-center">Check back soon for upcoming events!</p>
            <Button className="bg-tct-magenta hover:bg-tct-magenta/90 mt-6">
              <Link href="/events">Browse All Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentEvent = events[currentIndex]

  return (
    <div className="relative w-full max-w-md mx-auto" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="absolute -top-4 -left-4 w-72 h-72 bg-tct-magenta rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>
      <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-tct-cyan rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>

      <Card className="relative overflow-hidden border-2 border-tct-cyan/20 bg-tct-navy/80 shadow-xl">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={currentEvent.image || "/placeholder.svg"}
            alt={currentEvent.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <Badge className={`absolute top-3 left-3 ${getCategoryColor(currentEvent.category)}`}>
            {currentEvent.category}
          </Badge>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-xl font-bold">{currentEvent.title}</h3>
            <div className="flex items-center text-sm mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{currentEvent.date}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4 text-white">
          <div className="flex items-start gap-2 mb-4">
            <MapPin className="h-4 w-4 text-tct-cyan mt-0.5" />
            <span className="text-sm text-gray-300">{currentEvent.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Starting from</p>
              <p className="text-xl font-bold text-tct-magenta">{currentEvent.price}</p>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-tct-cyan text-white">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share event</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-tct-navy text-white border-tct-cyan">
                  <DropdownMenuItem onClick={() => shareEvent(currentEvent)} className="hover:bg-tct-navy/70">
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://twitter.com/intent/tweet?text=Check out ${currentEvent.title}&url=${encodeURIComponent(
                        `${typeof window !== "undefined" ? window.location.origin : ""}/events/${currentEvent.id}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-tct-navy/70"
                    >
                      Share on Twitter
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        `${typeof window !== "undefined" ? window.location.origin : ""}/events/${currentEvent.id}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-tct-navy/70"
                    >
                      Share on Facebook
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href={`/events/${currentEvent.id}`}>
                <Button className="bg-tct-magenta hover:bg-tct-magenta/90">View Details</Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-tct-cyan text-white hover:bg-tct-navy/70"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous event</span>
            </Button>

            <div className="flex gap-1">
              {events.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-tct-magenta" : "bg-tct-cyan/30"}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-tct-cyan text-white hover:bg-tct-navy/70"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next event</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
