import { httpsCallable, getFunctions } from "firebase/functions"
import { app } from "./firebase"

const functions = getFunctions(app)

interface SellerRequestData {
  userId: string
  businessName: string
  businessDescription: string
  website?: string
  taxId?: string
}

export async function requestSellerStatus(data: SellerRequestData): Promise<{ success: boolean; message: string }> {
  try {
    const requestSellerStatusFn = httpsCallable(functions, "requestSellerStatus")
    const result = await requestSellerStatusFn(data)
    return result.data as { success: boolean; message: string }
  } catch (error: any) {
    console.error("Error calling requestSellerStatus:", error)
    throw new Error(error.message || "Failed to request seller status")
  }
}

interface SendEventReminderData {
  eventId: string
  days: number
}

export async function sendEventReminder(data: SendEventReminderData): Promise<{ success: boolean; message: string }> {
  try {
    const sendEventReminderFn = httpsCallable(functions, "sendEventReminder")
    const result = await sendEventReminderFn(data)
    return result.data as { success: boolean; message: string }
  } catch (error: any) {
    console.error("Error calling sendEventReminder:", error)
    throw new Error(error.message || "Failed to send event reminder")
  }
}

export async function generateTicketReport(
  eventId: string,
): Promise<{ success: boolean; message: string; reportUrl?: string }> {
  try {
    const generateTicketReportFn = httpsCallable(functions, "generateTicketReport")
    const result = await generateTicketReportFn({ eventId })
    return result.data as { success: boolean; message: string; reportUrl?: string }
  } catch (error: any) {
    console.error("Error calling generateTicketReport:", error)
    throw new Error(error.message || "Failed to generate ticket report")
  }
}

export async function processRefund(ticketId: string, reason: string): Promise<{ success: boolean; message: string }> {
  try {
    const processRefundFn = httpsCallable(functions, "processRefund")
    const result = await processRefundFn({ ticketId, reason })
    return result.data as { success: boolean; message: string }
  } catch (error: any) {
    console.error("Error calling processRefund:", error)
    throw new Error(error.message || "Failed to process refund")
  }
}
