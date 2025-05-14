"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Ticket, Users } from "lucide-react"
import { Logo } from "@/components/logo"
import { EventCarousel } from "@/components/event-carousel"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { currentUser, logOut } = useAuth()

  const handleLogout = async () => {
    try {
      await logOut()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-tct-navy">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-tct-navy/30 bg-tct-navy text-white">
        <Logo />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-tct-magenta" href="/events">
            Events
          </Link>
          <Link className="text-sm font-medium hover:text-tct-magenta" href="/about">
            About
          </Link>
          <Link className="text-sm font-medium hover:text-tct-magenta" href="/contact">
            Contact
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          {currentUser ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-tct-cyan bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90 hover:text-tct-navy"
                >
                  Dashboard
                </Button>
              </Link>
              <Button size="sm" className="bg-tct-magenta hover:bg-tct-magenta/90" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-tct-cyan bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90 hover:text-tct-navy"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-tct-magenta hover:bg-tct-magenta/90">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-tct-navy to-tct-navy/90 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Logo size="xl" showText={false} />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Your One-Stop Ticket Solution</h1>
                <p className="max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover and purchase tickets for the best events in your area. Fast, secure, and convenient.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/events">
                    <Button size="lg" className="bg-tct-cyan text-tct-navy hover:bg-tct-cyan/90">
                      Browse Events
                    </Button>
                  </Link>
                  {!currentUser && (
                    <Link href="/register">
                      <Button
                        size="lg"
                        variant="outline"
                        className="bg-tct-coral border-tct-coral text-white hover:bg-tct-coral/90"
                      >
                        Sign Up Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex justify-center">
                <EventCarousel />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-tct-navy/95 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-tct-magenta/20 px-3 py-1 text-sm text-tct-magenta">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple & Secure Ticketing</h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform makes it easy to find, purchase, and use tickets for your favorite events.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {[
                {
                  icon: <CalendarDays className="h-10 w-10 text-tct-magenta" />,
                  title: "Find Events",
                  description: "Browse through our curated list of events happening near you.",
                },
                {
                  icon: <Ticket className="h-10 w-10 text-tct-cyan" />,
                  title: "Purchase Tickets",
                  description: "Secure your spot with our easy and safe payment process.",
                },
                {
                  icon: <Users className="h-10 w-10 text-tct-coral" />,
                  title: "Attend Events",
                  description: "Show your digital ticket at the door for quick and easy entry.",
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center space-y-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tct-navy/80 border border-tct-cyan/20">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t border-tct-navy/30 px-4 md:px-6 bg-tct-navy text-white">
        <div className="flex items-center gap-2">
          <Logo size="sm" showText={false} />
          <p className="text-xs">© 2025 Top City Tickets. All rights reserved.</p>
        </div>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:text-tct-cyan" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:text-tct-cyan" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
