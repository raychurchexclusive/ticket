import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { EventCarousel } from "@/components/event-carousel"

export default function Home() {
  return (
    <div className="min-h-screen bg-tct-navy text-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Hero background"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-tct-navy/50 to-tct-navy"></div>
        </div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-tct-magenta">Discover</span> and <span className="text-tct-cyan">Experience</span>{" "}
            Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300">
            Find and book tickets for concerts, sports, theater, and more. Your next unforgettable experience is just a
            click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-tct-magenta hover:bg-tct-magenta/90 text-lg px-8">
                Browse Events
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-tct-cyan text-tct-cyan hover:bg-tct-cyan/10 text-lg px-8"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-tct-navy">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <Link href="/events">
              <Button variant="link" className="text-tct-cyan">
                View All Events
              </Button>
            </Link>
          </div>
          <EventCarousel />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-tct-navy/80">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Music", icon: "🎵" },
              { name: "Sports", icon: "⚽" },
              { name: "Arts", icon: "🎭" },
              { name: "Comedy", icon: "😂" },
              { name: "Conferences", icon: "💼" },
              { name: "Food & Drink", icon: "🍷" },
              { name: "Workshops", icon: "🔧" },
              { name: "Festivals", icon: "🎪" },
            ].map((category) => (
              <Link href={`/events?category=${category.name}`} key={category.name}>
                <div className="bg-tct-navy border border-tct-cyan/20 rounded-lg p-6 text-center hover:border-tct-magenta transition-colors cursor-pointer">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h3 className="text-lg font-medium">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-tct-navy">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-tct-magenta/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-tct-magenta">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Browse Events</h3>
              <p className="text-gray-300">Discover events that match your interests and schedule.</p>
            </div>
            <div className="text-center">
              <div className="bg-tct-cyan/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-tct-cyan">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Purchase Tickets</h3>
              <p className="text-gray-300">Secure your spot with our easy and safe checkout process.</p>
            </div>
            <div className="text-center">
              <div className="bg-tct-coral/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-tct-coral">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Attend & Enjoy</h3>
              <p className="text-gray-300">Get your digital tickets instantly and enjoy the event!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-tct-navy to-tct-navy/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Something Amazing?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of event-goers and discover your next unforgettable experience.
          </p>
          <Link href="/events">
            <Button size="lg" className="bg-tct-magenta hover:bg-tct-magenta/90 text-lg px-8">
              Explore Events
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-tct-navy border-t border-tct-cyan/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image src="/logo.png" alt="Top City Tickets" width={150} height={40} />
              <p className="text-gray-400 mt-2">© 2025 Top City Tickets. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/about" className="text-gray-300 hover:text-white">
                About
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white">
                Contact
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
