"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Calendar, MapPin, Download, ExternalLink } from "lucide-react"
import type { Ticket } from "@/lib/ticket-utils"

interface TicketCardProps {
  ticket: Ticket
  showDetails?: boolean
}

export function TicketCard({ ticket, showDetails = false }: TicketCardProps) {
  const handleDownload = () => {
    // Create a downloadable version of the ticket
    const ticketHtml = `
      <html>
        <head>
          <title>Ticket - ${ticket.eventTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .ticket { max-width: 500px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; }
            .ticket-header { background-color: #0A0E35; color: white; padding: 15px; text-align: center; }
            .ticket-body { padding: 20px; }
            .ticket-qr { text-align: center; margin: 20px 0; }
            .ticket-info { margin-bottom: 15px; }
            .ticket-footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="ticket-header">
              <h1>Top City Tickets</h1>
              <h2>${ticket.eventTitle}</h2>
            </div>
            <div class="ticket-body">
              <div class="ticket-info">
                <p><strong>Ticket Code:</strong> ${ticket.ticketCode}</p>
                <p><strong>Purchase Date:</strong> ${new Date(ticket.purchaseDate).toLocaleDateString()}</p>
                ${ticket.seatInfo ? `<p><strong>Seat:</strong> ${ticket.seatInfo}</p>` : ""}
              </div>
              <div class="ticket-qr">
                <img src="${ticket.qrCodeDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
              </div>
            </div>
            <div class="ticket-footer">
              <p>© 2025 Top City Tickets. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([ticketHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ticket-${ticket.ticketCode}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-hidden bg-tct-navy/80 border border-tct-cyan/20 text-white">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image src="/placeholder.svg?height=200&width=400" alt={ticket.eventTitle} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-lg font-bold">{ticket.eventTitle}</h3>
            <div className="flex items-center text-sm mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Event Date</span> {/* In a real app, include the actual event date */}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Ticket ID</p>
            <p className="font-medium">{ticket.ticketCode}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            <p
              className={`font-medium ${
                ticket.status === "valid"
                  ? "text-green-500"
                  : ticket.status === "used"
                    ? "text-gray-500"
                    : "text-red-500"
              }`}
            >
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative h-32 w-32 border rounded-md p-2 bg-white">
            <Image
              src={ticket.qrCodeDataUrl || "/placeholder.svg"}
              alt="Ticket QR Code"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 text-sm">
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="h-4 w-4 text-tct-cyan mt-0.5" />
              <span className="text-gray-300">Event Location</span> {/* In a real app, include the actual location */}
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-tct-magenta mt-0.5" />
              <span className="text-gray-300">Purchased on {new Date(ticket.purchaseDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 border-tct-cyan/20">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button className="bg-tct-magenta hover:bg-tct-magenta/90" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
