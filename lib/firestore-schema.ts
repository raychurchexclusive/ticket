/**
 * This file documents the Firestore database schema.
 * It's not used in the application code but serves as documentation.
 */

import type { Timestamp } from "firebase/firestore"

// Users collection
interface User {
  id: string // Document ID
  email: string
  displayName?: string
  role: "admin" | "seller" | "user"
  createdAt: Timestamp
  updatedAt: Timestamp
  stripeCustomerId?: string // For users who have made purchases
  stripeConnectAccountId?: string // For sellers
}

// Events collection
interface Event {
  id: string // Document ID
  title: string
  description: string
  date: string
  time: string
  location: string
  price: number
  category: string
  image: string
  ticketsAvailable: number
  ticketsSold: number
  status: "active" | "draft" | "completed" | "cancelled"
  sellerId: string // Reference to the seller user
  sellerEmail: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Event requests collection
interface EventRequest {
  id: string // Document ID
  sellerId: string // Reference to the seller user
  sellerEmail: string
  title: string
  description: string
  date: string
  time: string
  location: string
  price: number
  category: string
  ticketsAvailable: number
  image?: string
  status: "pending" | "approved" | "rejected"
  requestDate: Timestamp
  feedback?: string // Feedback if rejected
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Tickets collection
interface Ticket {
  id: string // Document ID
  eventId: string // Reference to the event
  eventTitle: string
  ticketCode: string // Unique code for verification
  qrCodeDataUrl: string // QR code image data
  purchaseDate: Timestamp
  userId: string // Reference to the user
  userEmail: string
  status: "valid" | "used" | "cancelled" | "expired"
  usedDate?: Timestamp
  seatInfo?: string
  price: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Orders collection
interface Order {
  id: string // Document ID
  userId: string // Reference to the user
  userEmail: string
  eventId: string // Reference to the event
  eventTitle: string
  ticketIds: string[] // References to the tickets
  totalAmount: number
  paymentIntentId: string // Stripe payment intent ID
  status: "completed" | "refunded" | "failed"
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Verifications collection
interface Verification {
  id: string // Document ID
  eventId: string // Reference to the event
  ticketCode: string
  status: "valid" | "used" | "invalid" | "expired"
  verifiedBy: string // Reference to the seller user
  verifiedAt: Timestamp
  createdAt: Timestamp
}

// Stripe connect accounts collection (optional, can also be stored in the users collection)
interface StripeAccount {
  id: string // Document ID
  userId: string // Reference to the user
  accountId: string // Stripe account ID
  payoutsEnabled: boolean
  chargesEnabled: boolean
  detailsSubmitted: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
