import { NextResponse } from "next/server"
import { getTicketByCode, updateTicketStatus, saveVerification } from "@/lib/db-service"

export async function GET(request: Request, { params }: { params: { code: string } }) {
  const ticketCode = params.code

  try {
    // Get ticket from Firebase
    const ticket = await getTicketByCode(ticketCode)

    if (!ticket) {
      return NextResponse.json(
        {
          status: "invalid",
          reason: "Ticket not found",
          ticketCode,
        },
        { status: 404 },
      )
    }

    // Return ticket information
    return NextResponse.json({
      status: ticket.status,
      eventId: ticket.eventId,
      eventTitle: ticket.eventTitle,
      ticketCode: ticket.ticketCode,
      ...(ticket.status === "used" ? { usedDate: ticket.usedDate } : {}),
    })
  } catch (error) {
    console.error("Error verifying ticket:", error)
    return NextResponse.json({ error: "Failed to verify ticket" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { code: string } }) {
  const ticketCode = params.code

  try {
    const body = await request.json()
    const { sellerId } = body

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 })
    }

    // Get ticket from Firebase
    const ticket = await getTicketByCode(ticketCode)

    if (!ticket) {
      // Save verification attempt
      await saveVerification({
        eventId: "unknown",
        ticketCode,
        status: "invalid",
        verifiedBy: sellerId,
        verifiedAt: new Date().toISOString(),
      })

      return NextResponse.json(
        {
          status: "invalid",
          reason: "Ticket not found",
          ticketCode,
        },
        { status: 404 },
      )
    }

    // If ticket is already used, return used status
    if (ticket.status === "used") {
      // Save verification attempt
      await saveVerification({
        eventId: ticket.eventId,
        ticketCode,
        status: "used",
        verifiedBy: sellerId,
        verifiedAt: new Date().toISOString(),
      })

      return NextResponse.json({
        status: "used",
        eventId: ticket.eventId,
        eventTitle: ticket.eventTitle,
        ticketCode: ticket.ticketCode,
        usedDate: ticket.usedDate,
      })
    }

    // If ticket is valid, mark as used
    if (ticket.status === "valid") {
      const now = new Date().toISOString()

      // Update ticket status
      await updateTicketStatus(ticket.id, "used", now)

      // Save verification
      await saveVerification({
        eventId: ticket.eventId,
        ticketCode,
        status: "valid",
        verifiedBy: sellerId,
        verifiedAt: now,
      })

      return NextResponse.json({
        status: "valid",
        eventId: ticket.eventId,
        eventTitle: ticket.eventTitle,
        ticketCode: ticket.ticketCode,
      })
    }

    // For any other status (cancelled, expired)
    await saveVerification({
      eventId: ticket.eventId,
      ticketCode,
      status: ticket.status,
      verifiedBy: sellerId,
      verifiedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      status: ticket.status,
      eventId: ticket.eventId,
      eventTitle: ticket.eventTitle,
      ticketCode: ticket.ticketCode,
    })
  } catch (error) {
    console.error("Error verifying ticket:", error)
    return NextResponse.json({ error: "Failed to verify ticket" }, { status: 500 })
  }
}
