import { randomBytes } from "crypto"
import QRCode from "qrcode"

// Generate a unique ticket code
export function generateTicketCode(eventId: string): string {
  // Format: TCT-{eventId}-{random alphanumeric string}
  const randomString = randomBytes(4).toString("hex").toUpperCase()
  return `TCT-${eventId}-${randomString}`
}

// Generate a QR code as a data URL
export async function generateQRCode(ticketCode: string): Promise<string> {
  try {
    // The URL that will be encoded in the QR code
    // This would point to your ticket verification endpoint
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${ticketCode}`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#0A0E35", // QR code color (navy)
        light: "#FFFFFF", // Background color
      },
    })

    return qrCodeDataUrl
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

// Ticket status types
export type TicketStatus = "valid" | "used" | "cancelled" | "expired"

// Ticket interface
export interface Ticket {
  id: string
  eventId: string
  eventTitle: string
  ticketCode: string
  qrCodeDataUrl: string
  purchaseDate: string
  userId: string
  userEmail: string
  status: TicketStatus
  usedDate?: string
  seatInfo?: string
  price: number
}

// Generate a new ticket object
export async function createTicket(
  eventId: string,
  eventTitle: string,
  userId: string,
  userEmail: string,
  price: number,
  seatInfo?: string,
): Promise<Ticket> {
  const ticketCode = generateTicketCode(eventId)
  const qrCodeDataUrl = await generateQRCode(ticketCode)

  return {
    id: randomBytes(8).toString("hex"),
    eventId,
    eventTitle,
    ticketCode,
    qrCodeDataUrl,
    purchaseDate: new Date().toISOString(),
    userId,
    userEmail,
    status: "valid",
    seatInfo,
    price,
  }
}
