import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Share2, ArrowLeft, Ticket } from "lucide-react"
import { PaymentForm } from "@/components/stripe/payment-form"

// This would come from an API in a real application
const events = [
  {
    id: "1",
    title: "Summer Music Festival",
    date: "June 15, 2025",
    time: "2:00 PM - 10:00 PM",
    location: "Central Park, New York",
    image: "/placeholder.svg?height=400&width=800",
    price: "$49.99",
    category: "Music",
    description:
      "Join us for the biggest music festival of the summer featuring top artists from around the world. Experience live performances across multiple stages, delicious food vendors, and an unforgettable atmosphere.",
    organizer: "City Events Co.",
    ticketsAvailable: 250,
  },
  {
    id: "2",
    title: "Tech Conference 2025",
    date: "July 10, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Convention Center, San Francisco",
    image: "/placeholder.svg?height=400&width=800",
    price: "$99.99",
    category: "Conference",
    description:
      "The premier tech conference bringing together industry leaders, innovators, and tech enthusiasts. Discover the latest trends, attend workshops, and network with professionals from top tech companies.",
    organizer: "TechTalks Inc.",
    ticketsAvailable: 500,
  },
  {
    id: "3",
    title: "Comedy Night",
    date: "May 25, 2025",
    time: "8:00 PM - 11:00 PM",
    location: "Laugh Factory, Los Angeles",
    image: "/placeholder.svg?height=400&width=800",
    price: "$29.99",
    category: "Comedy",
    description:
      "A night of non-stop laughter featuring the funniest stand-up comedians in the country. Grab your friends and enjoy an evening of hilarious performances in a cozy venue.",
    organizer: "Laugh Productions",
    ticketsAvailable: 150,
  },
  {
    id: "4",
    title: "Basketball Championship",
    date: "August 5, 2025",
    time: "7:30 PM - 10:00 PM",
    location: "Sports Arena, Chicago",
    image: "/placeholder.svg?height=400&width=800",
    price: "$79.99",
    category: "Sports",
    description:
      "Witness the thrilling final game of the basketball championship season. See top athletes compete for the championship title in this action-packed sporting event.",
    organizer: "City Sports Association",
    ticketsAvailable: 1000,
  },
]

export default function EventPage({ params }: { params: { id: string } }) {
  const event = events.find((e) => e.id === params.id) || events[0]

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
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <Button variant="outline" className="border-tct-cyan text-white hover:text-tct-navy">
            <Share2 className="h-4 w-4 mr-2" />
            Share Event
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="relative rounded-lg overflow-hidden h-64 md:h-96">
              <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              <div className="absolute top-4 left-4">
                <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-300 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-tct-magenta" />
                  {event.date}
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-tct-cyan" />
                  {event.time}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-tct-coral" />
                  {event.location}
                </div>
              </div>

              <div className="prose max-w-none text-gray-300">
                <h2 className="text-xl font-semibold mb-2 text-white">About This Event</h2>
                <p>{event.description}</p>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-white">Organizer</h2>
                <p>Presented by {event.organizer}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-tct-navy/80 p-6 rounded-lg border border-tct-cyan/20 shadow-md sticky top-8">
              <h2 className="text-xl font-bold mb-4">Ticket Information</h2>
              <div className="mb-4">
                <p className="text-gray-300">Starting from</p>
                <p className="text-3xl font-bold text-tct-magenta">{event.price}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-300 mb-1">
                  <Ticket className="h-4 w-4 inline mr-1" />
                  {event.ticketsAvailable} tickets available
                </p>
              </div>

              <PaymentForm
                eventId={event.id}
                eventTitle={event.title}
                price={Number.parseFloat(event.price.replace("$", ""))}
                sellerStripeAccountId="acct_example" // This would come from your database in a real app
              />

              <div className="text-center text-sm text-gray-400 mt-4">
                <p>Secure checkout powered by Stripe</p>
                <p className="mt-1">All sales are final. No refunds.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
