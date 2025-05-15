import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"

async function getEvents() {
  try {
    const eventsRef = collection(db, "events")
    const q = query(eventsRef, where("status", "==", "active"), orderBy("date", "asc"))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return []
    }

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export default async function EventsPage() {
  const events = await getEvents()

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

  return (
    <div className="min-h-screen bg-tct-navy/95 text-white">
      <header className="bg-tct-navy text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <p className="text-gray-300 mt-2">Discover and book tickets for amazing events</p>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">No Events Scheduled</h2>
            <p className="text-gray-300 mb-8">Check back soon for upcoming events!</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div
                key={event.id}
                className="bg-tct-navy/80 border border-tct-cyan/20 rounded-lg overflow-hidden shadow-lg"
              >
                <div className="relative h-48">
                  <Image
                    src={event.image || "/placeholder.svg?height=400&width=800"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                  <div className="space-y-2 text-gray-300 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-tct-magenta" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-tct-cyan" />
                      {event.time}
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
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
