import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Ticket, TicketStatus } from "./ticket-utils"

// User-related operations
export async function getUserByEmail(email: string) {
  const usersRef = collection(db, "users")
  const q = query(usersRef, where("email", "==", email))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
}

export async function getUserById(userId: string) {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    return null
  }

  return { id: userSnap.id, ...userSnap.data() }
}

// Event-related operations
export async function getEventById(eventId: string) {
  const eventRef = doc(db, "events", eventId)
  const eventSnap = await getDoc(eventRef)

  if (!eventSnap.exists()) {
    return null
  }

  return { id: eventSnap.id, ...eventSnap.data() }
}

export async function getEventsByUserId(userId: string) {
  const eventsRef = collection(db, "events")
  const q = query(eventsRef, where("sellerId", "==", userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Ticket-related operations
export async function saveTicket(ticket: Ticket) {
  const ticketsRef = collection(db, "tickets")

  // Add created and updated timestamps
  const ticketWithTimestamps = {
    ...ticket,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  // Use the ticket ID if provided, otherwise let Firestore generate one
  if (ticket.id) {
    await setDoc(doc(ticketsRef, ticket.id), ticketWithTimestamps)
    return ticket.id
  } else {
    const docRef = await addDoc(ticketsRef, ticketWithTimestamps)
    return docRef.id
  }
}

export async function getTicketByCode(ticketCode: string) {
  const ticketsRef = collection(db, "tickets")
  const q = query(ticketsRef, where("ticketCode", "==", ticketCode))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
}

export async function getTicketsByUserId(userId: string) {
  const ticketsRef = collection(db, "tickets")
  const q = query(ticketsRef, where("userId", "==", userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus, usedDate?: string) {
  const ticketRef = doc(db, "tickets", ticketId)

  const updateData: DocumentData = {
    status,
    updatedAt: serverTimestamp(),
  }

  if (status === "used" && usedDate) {
    updateData.usedDate = usedDate
  }

  await updateDoc(ticketRef, updateData)
  return true
}

// Order-related operations
export async function saveOrder(order: {
  userId: string
  userEmail: string
  eventId: string
  eventTitle: string
  ticketIds: string[]
  totalAmount: number
  paymentIntentId: string
  status: "completed" | "refunded" | "failed"
}) {
  const ordersRef = collection(db, "orders")

  const orderWithTimestamps = {
    ...order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(ordersRef, orderWithTimestamps)
  return docRef.id
}

export async function getOrdersByUserId(userId: string) {
  const ordersRef = collection(db, "orders")
  const q = query(ordersRef, where("userId", "==", userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Verification history operations
export async function saveVerification(verification: {
  eventId: string
  ticketCode: string
  status: TicketStatus
  verifiedBy: string
  verifiedAt: string
}) {
  const verificationsRef = collection(db, "verifications")

  const verificationWithTimestamp = {
    ...verification,
    createdAt: serverTimestamp(),
  }

  const docRef = await addDoc(verificationsRef, verificationWithTimestamp)
  return docRef.id
}

export async function getVerificationsByEventId(eventId: string) {
  const verificationsRef = collection(db, "verifications")
  const q = query(verificationsRef, where("eventId", "==", eventId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function getVerificationsByUserId(userId: string) {
  const verificationsRef = collection(db, "verifications")
  const q = query(verificationsRef, where("verifiedBy", "==", userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export async function verifyTicket(ticketCode: string): Promise<{
  valid: boolean
  used: boolean
  ticketId: string
  eventId: string
}> {
  const ticket = await getTicketByCode(ticketCode)

  if (!ticket) {
    return { valid: false, used: false, ticketId: "", eventId: "" }
  }

  return {
    valid: ticket.status === "valid" || ticket.status === "used",
    used: ticket.status === "used",
    ticketId: ticket.id,
    eventId: ticket.eventId,
  }
}
