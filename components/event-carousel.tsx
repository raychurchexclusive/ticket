"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const eventsRef = collection(db, "events")
        const q = query(eventsRef, where("status", "==", "active"), orderBy("date", "asc"), limit(6))

        const querySnapshot = await getDocs(q)

        const eventsData: Event[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          eventsData.push({
            id: doc.id,
            title: data.title,
            date: data.date,
            location: data.location,
            image: data.image || "/placeholder.svg?height=200&width=400",
            price: data.price,
            category: data.category || "Event",
          })
        })

        setEvents(eventsData)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-tct-navy/80 border border-tct-cyan/20 rounded-lg overflow-hidden shadow-lg animate-pulse"
          >
            <div className="h-48 bg-gray-700"></div>
            <div className="p-5">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="h-3 bg-gray-700 rounded w-12 mb-1"></div>
                  <div className="h-5 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-9 bg-gray-700 rounded w-28"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-tct-navy/50 rounded-lg border border-tct-cyan/20">
        <h3 className="text-xl font-semibold mb-2">No Events Scheduled</h3>
        <p className="text-gray-400 mb-6">Check back soon for upcoming events!</p>
        <Link href="/dashboard">
          <Button variant="outline" className="border-tct-cyan text-tct-cyan hover:bg-tct-cyan/10">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <div key={event.id} className="bg-tct-navy/80 border border-tct-cyan/20 rounded-lg overflow-hidden shadow-lg">
          <div className="relative h-48">
            <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
            <div className="absolute top-4 left-4">
              <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <div className="space-y-2 text-gray-300 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-tct-magenta" />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-tct-coral" />
                {event.location}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Starting from</p>
                <p className="text-xl font-bold text-tct-magenta">${event.price}</p>
              </div>
              <Link href={`/events/${event.id}`}>
                <Button>
                  Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
