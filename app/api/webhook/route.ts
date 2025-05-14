import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createTicket } from "@/lib/ticket-utils"
import { emailService } from "@/lib/email-service"
import { randomBytes } from "crypto"
import { saveTicket, saveOrder, getEventById } from "@/lib/db-service"

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object)
        break

      // Add more event handlers as needed
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    // Extract data from the session
    const { metadata, customer_details, amount_total, payment_intent } = session
    const { eventId, quantity, userId } = metadata
    const userEmail = customer_details.email

    // Get event details from Firebase
    const event = await getEventById(eventId)
    if (!event) {
      throw new Error(`Event not found: ${eventId}`)
    }

    // Generate a unique order ID
    const orderId = `ORDER-${randomBytes(4).toString("hex").toUpperCase()}`

    // Generate tickets
    const tickets = []
    const ticketPrice = amount_total / 100 / Number.parseInt(quantity)
    const ticketIds = []

    for (let i = 0; i < Number.parseInt(quantity); i++) {
      // Create the ticket
      const ticket = await createTicket(
        eventId,
        event.title,
        userId || `user_${randomBytes(4).toString("hex")}`,
        userEmail,
        ticketPrice,
      )

      // Save ticket to Firebase
      const ticketId = await saveTicket(ticket)
      ticketIds.push(ticketId)
      tickets.push(ticket)
    }

    // Save order to Firebase
    await saveOrder({
      userId: userId || `user_${randomBytes(4).toString("hex")}`,
      userEmail,
      eventId,
      eventTitle: event.title,
      ticketIds,
      totalAmount: amount_total / 100,
      paymentIntentId: payment_intent,
      status: "completed",
    })

    // Send confirmation email to customer
    await emailService.sendTicketPurchaseEmail(userEmail, tickets, orderId)

    // Notify seller about the sale
    if (event.sellerEmail) {
      await emailService.sendEmail(
        event.sellerEmail,
        `New Ticket Sale: ${event.title}`,
        `You have a new sale for ${event.title}. ${quantity} tickets were purchased.`,
      )
    }

    console.log(`Generated ${tickets.length} tickets for order ${orderId}`)

    return true
  } catch (error) {
    console.error("Error handling checkout session completed:", error)
    throw error
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  // Similar to handleCheckoutSessionCompleted but for direct PaymentIntent payments
  // Implement as needed for your application
  console.log("Payment intent succeeded:", paymentIntent.id)
  return true
}

export const config = {
  api: {
    bodyParser: false,
  },
}
