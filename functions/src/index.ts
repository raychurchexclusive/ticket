import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import * as nodemailer from "nodemailer"
import * as Stripe from "stripe"

// Initialize Firebase Admin
admin.initializeApp()
const db = admin.firestore()

// Initialize Stripe
const stripe = new Stripe.default(functions.config().stripe.secret, {
  apiVersion: "2023-10-16",
})

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass,
  },
})

// Function to send email
async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: `Top City Tickets <${functions.config().email.user}>`,
    to,
    subject,
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to}`)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Cloud Function: Send welcome email when a new user is created
export const sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const { email, displayName, uid } = user

  if (!email) {
    console.log("No email found for user")
    return null
  }

  const name = displayName || "there"
  const subject = "Welcome to Top City Tickets!"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0A0E35; padding: 20px; text-align: center;">
        <img src="https://your-app-url.com/logo.png" alt="Top City Tickets" style="height: 60px;" />
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #0A0E35;">Welcome to Top City Tickets, ${name}!</h2>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        
        <p>With Top City Tickets, you can:</p>
        <ul>
          <li>Discover exciting events in your area</li>
          <li>Purchase tickets securely</li>
          <li>Manage all your tickets in one place</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://your-app-url.com/dashboard" 
             style="background-color: #E645CF; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Explore Events
          </a>
        </div>
      </div>
      
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>© 2025 Top City Tickets. All rights reserved.</p>
        <p>If you have any questions, please contact our support team at support@topcitytickets.com</p>
      </div>
    </div>
  `

  try {
    await sendEmail(email, subject, html)

    // Update user document to record that welcome email was sent
    await db.collection("users").doc(uid).update({
      welcomeEmailSent: true,
      welcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return null
  } catch (error) {
    console.error("Error in sendWelcomeEmail:", error)
    return null
  }
})

// Cloud Function: Generate and send tickets after successful payment
export const generateTicketsAfterPayment = functions.firestore
  .document("payments/{paymentId}")
  .onCreate(async (snapshot, context) => {
    const payment = snapshot.data()

    if (payment.status !== "succeeded") {
      console.log(`Payment ${context.params.paymentId} not successful, skipping ticket generation`)
      return null
    }

    try {
      const { userId, userEmail, eventId, quantity, amount } = payment

      // Get event details
      const eventDoc = await db.collection("events").doc(eventId).get()
      if (!eventDoc.exists) {
        throw new Error(`Event ${eventId} not found`)
      }

      const event = eventDoc.data()
      const ticketPrice = amount / quantity
      const tickets = []

      // Generate tickets
      for (let i = 0; i < quantity; i++) {
        // Generate unique ticket code
        const ticketCode = `TCT-${eventId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

        // Create ticket document
        const ticketData = {
          eventId,
          eventTitle: event.title,
          ticketCode,
          purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
          userId,
          userEmail,
          status: "valid",
          price: ticketPrice,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        // Save ticket to Firestore
        const ticketRef = await db.collection("tickets").add(ticketData)

        // Add ticket ID to the ticket data
        ticketData.id = ticketRef.id
        tickets.push(ticketData)
      }

      // Update event's ticketsSold count
      await db
        .collection("events")
        .doc(eventId)
        .update({
          ticketsSold: admin.firestore.FieldValue.increment(quantity),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

      // Send confirmation email with tickets
      const subject = `Your Tickets for ${event.title}`
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0A0E35; padding: 20px; text-align: center;">
            <img src="https://your-app-url.com/logo.png" alt="Top City Tickets" style="height: 60px;" />
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #0A0E35;">Your Tickets are Confirmed!</h2>
            <p>Thank you for your purchase. Here are your ticket details:</p>
            
            <div style="background-color: white; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Date:</strong> ${event.date}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Number of Tickets:</strong> ${quantity}</p>
              <p><strong>Total Amount:</strong> $${(amount / 100).toFixed(2)}</p>
            </div>
            
            <p>Your tickets are available in your account dashboard.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-app-url.com/dashboard/user/tickets" 
                 style="background-color: #E645CF; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                View My Tickets
              </a>
            </div>
          </div>
          
          <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>© 2025 Top City Tickets. All rights reserved.</p>
            <p>If you have any questions, please contact our support team at support@topcitytickets.com</p>
          </div>
        </div>
      `

      await sendEmail(userEmail, subject, html)

      // Update payment record to indicate tickets were generated
      await snapshot.ref.update({
        ticketsGenerated: true,
        ticketIds: tickets.map((t) => t.id),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      return null
    } catch (error) {
      console.error("Error generating tickets:", error)
      return null
    }
  })

// Cloud Function: Send event reminder emails
export const sendEventReminders = functions.pubsub
  .schedule("0 9 * * *") // Run every day at 9:00 AM
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 59, 999)

      // Find events happening tomorrow
      const eventsSnapshot = await db
        .collection("events")
        .where("date", ">=", now)
        .where("date", "<=", admin.firestore.Timestamp.fromDate(tomorrow))
        .where("status", "==", "active")
        .get()

      if (eventsSnapshot.empty) {
        console.log("No upcoming events found for tomorrow")
        return null
      }

      // Process each event
      const eventPromises = eventsSnapshot.docs.map(async (eventDoc) => {
        const event = eventDoc.data()

        // Find valid tickets for this event
        const ticketsSnapshot = await db
          .collection("tickets")
          .where("eventId", "==", eventDoc.id)
          .where("status", "==", "valid")
          .get()

        if (ticketsSnapshot.empty) {
          console.log(`No valid tickets found for event ${eventDoc.id}`)
          return
        }

        // Send reminder email to each ticket holder
        const emailPromises = ticketsSnapshot.docs.map(async (ticketDoc) => {
          const ticket = ticketDoc.data()

          const subject = `Reminder: ${event.title} is Tomorrow!`
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #0A0E35; padding: 20px; text-align: center;">
                <img src="https://your-app-url.com/logo.png" alt="Top City Tickets" style="height: 60px;" />
              </div>
              
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #0A0E35;">Your Event is Tomorrow!</h2>
                <p>This is a friendly reminder about your upcoming event:</p>
                
                <div style="background-color: white; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
                  <p><strong>Event:</strong> ${event.title}</p>
                  <p><strong>Date:</strong> ${event.date}</p>
                  <p><strong>Time:</strong> ${event.time}</p>
                  <p><strong>Location:</strong> ${event.location}</p>
                  <p><strong>Ticket Code:</strong> ${ticket.ticketCode}</p>
                </div>
                
                <p>Don't forget to have your ticket ready for scanning at the entrance.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://your-app-url.com/dashboard/user/tickets" 
                     style="background-color: #E645CF; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                    View My Tickets
                  </a>
                </div>
              </div>
              
              <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>© 2025 Top City Tickets. All rights reserved.</p>
              </div>
            </div>
          `

          await sendEmail(ticket.userEmail, subject, html)

          // Record that reminder was sent
          await ticketDoc.ref.update({
            reminderSent: true,
            reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        })

        await Promise.all(emailPromises)
      })

      await Promise.all(eventPromises)
      return null
    } catch (error) {
      console.error("Error sending event reminders:", error)
      return null
    }
  })

// Cloud Function: Handle Stripe webhook events
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers["stripe-signature"]

  if (!signature) {
    console.error("No Stripe signature found")
    return res.status(400).send("Missing signature")
  }

  try {
    const event = stripe.webhooks.constructEvent(req.rawBody, signature, functions.config().stripe.webhook_secret)

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object

        // Create payment record in Firestore
        await db.collection("payments").add({
          stripeId: session.id,
          paymentIntentId: session.payment_intent,
          customerId: session.customer,
          userId: session.metadata?.userId,
          userEmail: session.customer_details?.email,
          eventId: session.metadata?.eventId,
          quantity: Number.parseInt(session.metadata?.quantity || "1", 10),
          amount: session.amount_total,
          currency: session.currency,
          status: "succeeded",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object

        // Check if this is a direct payment (not from checkout)
        if (!paymentIntent.metadata?.fromCheckout) {
          await db.collection("payments").add({
            stripeId: paymentIntent.id,
            paymentIntentId: paymentIntent.id,
            customerId: paymentIntent.customer,
            userId: paymentIntent.metadata?.userId,
            userEmail: paymentIntent.metadata?.userEmail,
            eventId: paymentIntent.metadata?.eventId,
            quantity: Number.parseInt(paymentIntent.metadata?.quantity || "1", 10),
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: "succeeded",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        }

        break
      }

      // Add more event handlers as needed
    }

    res.json({ received: true })
  } catch (error) {
    console.error("Error handling Stripe webhook:", error)
    res.status(400).send(`Webhook Error: ${error.message}`)
  }
})

// Cloud Function: Update user role to seller
export const updateUserToSeller = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in to become a seller.")
  }

  const uid = context.auth.uid

  try {
    // Update user document
    await db.collection("users").doc(uid).update({
      role: "seller",
      sellerSince: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Send confirmation email
    const userRecord = await admin.auth().getUser(uid)
    const email = userRecord.email

    if (email) {
      const subject = "Welcome to Top City Tickets Seller Program!"
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0A0E35; padding: 20px; text-align: center;">
            <img src="https://your-app-url.com/logo.png" alt="Top City Tickets" style="height: 60px;" />
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #0A0E35;">Welcome to the Seller Program!</h2>
            <p>Congratulations! You are now a seller on Top City Tickets.</p>
            
            <p>As a seller, you can:</p>
            <ul>
              <li>Create and manage your own events</li>
              <li>Sell tickets and receive payments</li>
              <li>Track sales and attendance</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-app-url.com/dashboard/seller" 
                 style="background-color: #E645CF; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Go to Seller Dashboard
              </a>
            </div>
          </div>
          
          <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>© 2025 Top City Tickets. All rights reserved.</p>
          </div>
        </div>
      `

      await sendEmail(email, subject, html)
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating user to seller:", error)
    throw new functions.https.HttpsError("internal", "Failed to update user role.")
  }
})

// Cloud Function: Clean up expired tickets
export const cleanupExpiredTickets = functions.pubsub
  .schedule("0 0 * * *") // Run every day at midnight
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now()

      // Find events that have already happened
      const eventsSnapshot = await db.collection("events").where("date", "<", now).where("status", "==", "active").get()

      if (eventsSnapshot.empty) {
        console.log("No past events found")
        return null
      }

      // Update event status to completed
      const eventPromises = eventsSnapshot.docs.map(async (eventDoc) => {
        await eventDoc.ref.update({
          status: "completed",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        // Find valid tickets for this event and mark them as expired
        const ticketsSnapshot = await db
          .collection("tickets")
          .where("eventId", "==", eventDoc.id)
          .where("status", "==", "valid")
          .get()

        if (!ticketsSnapshot.empty) {
          const ticketPromises = ticketsSnapshot.docs.map(async (ticketDoc) => {
            await ticketDoc.ref.update({
              status: "expired",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
          })

          await Promise.all(ticketPromises)
        }
      })

      await Promise.all(eventPromises)
      return null
    } catch (error) {
      console.error("Error cleaning up expired tickets:", error)
      return null
    }
  })
