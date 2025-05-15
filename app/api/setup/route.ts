import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { createEventProduct } from "@/lib/stripe"

// This is a protected admin route to set up test data
export async function POST(request: Request) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case "create_test_event":
        return await createTestEvent(data)
      case "set_user_role":
        return await setUserRole(data)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function createTestEvent(data: any) {
  try {
    // Default test event data
    const eventData = {
      title: data.title || "Test Event - Music Festival",
      date: data.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 week from now
      time: data.time || "7:00 PM - 11:00 PM",
      location: data.location || "Test Venue, New York",
      description: data.description || "This is a test event for the ticket selling app.",
      price: data.price || "29.99",
      category: data.category || "Music",
      image: data.image || "/placeholder.svg?height=400&width=800",
      ticketsAvailable: data.ticketsAvailable || 100,
      ticketsSold: 0,
      status: "active",
      sellerId: data.sellerId || "admin",
      sellerEmail: data.sellerEmail || "admin@example.com",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Create a Stripe product for the event if seller has a Stripe account
    if (data.sellerStripeAccountId) {
      const stripeProduct = await createEventProduct(
        "test_event",
        eventData.title,
        eventData.description,
        Number.parseFloat(eventData.price),
        data.sellerStripeAccountId,
      )

      if (stripeProduct.success) {
        eventData.stripeProductId = stripeProduct.productId
        eventData.stripePriceId = stripeProduct.priceId
        eventData.sellerStripeAccountId = data.sellerStripeAccountId
      }
    }

    // Add the event to Firestore
    const eventRef = await addDoc(collection(db, "events"), eventData)

    return NextResponse.json({
      success: true,
      message: "Test event created successfully",
      eventId: eventRef.id,
      event: { id: eventRef.id, ...eventData },
    })
  } catch (error) {
    console.error("Error creating test event:", error)
    return NextResponse.json({ error: "Failed to create test event" }, { status: 500 })
  }
}

async function setUserRole(data: any) {
  try {
    const { email, role } = data

    if (!email || !role || !["admin", "seller", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid email or role" }, { status: 400 })
    }

    // Find user by email
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user role
    const userDoc = querySnapshot.docs[0]
    await updateDoc(doc(db, "users", userDoc.id), {
      role,
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      message: `User ${email} role updated to ${role}`,
      userId: userDoc.id,
    })
  } catch (error) {
    console.error("Error setting user role:", error)
    return NextResponse.json({ error: "Failed to set user role" }, { status: 500 })
  }
}
