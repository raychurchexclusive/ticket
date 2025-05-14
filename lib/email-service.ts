import type { Ticket } from "./ticket-utils"

// Email template types
export type EmailTemplate = "ticket-purchase" | "ticket-cancelled" | "event-reminder" | "account-created"

// Email service interface
interface EmailServiceInterface {
  sendEmail(to: string, subject: string, html: string): Promise<boolean>
  sendTicketPurchaseEmail(to: string, tickets: Ticket[], orderId: string): Promise<boolean>
  sendEventReminderEmail(to: string, ticket: Ticket): Promise<boolean>
}

// Email service implementation
export class EmailService implements EmailServiceInterface {
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // In a real implementation, you would use a service like SendGrid, Mailgun, etc.
      // For now, we'll just log the email details
      console.log(`Sending email to ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Content: ${html}`)

      // In production, replace with actual email sending logic:
      // const response = await emailProvider.send({
      //   to,
      //   subject,
      //   html,
      //   from: 'tickets@topcitytickets.com'
      // })

      return true
    } catch (error) {
      console.error("Error sending email:", error)
      return false
    }
  }

  async sendTicketPurchaseEmail(to: string, tickets: Ticket[], orderId: string): Promise<boolean> {
    const event = tickets[0].eventTitle
    const ticketCount = tickets.length
    const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0)

    const subject = `Your Tickets for ${event}`

    // Create HTML for the email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0A0E35; padding: 20px; text-align: center;">
          <img src="${process.env.NEXT_PUBLIC_BASE_URL}/logo.png" alt="Top City Tickets" style="height: 60px;" />
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #0A0E35;">Your Tickets are Confirmed!</h2>
          <p>Thank you for your purchase. Here are your ticket details:</p>
          
          <div style="background-color: white; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <p><strong>Event:</strong> ${event}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Number of Tickets:</strong> ${ticketCount}</p>
            <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          </div>
          
          <p>Your tickets are attached to this email and also available in your account dashboard.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/user/tickets" 
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

    return this.sendEmail(to, subject, html)
  }

  async sendEventReminderEmail(to: string, ticket: Ticket): Promise<boolean> {
    const subject = `Reminder: ${ticket.eventTitle} is Coming Soon!`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0A0E35; padding: 20px; text-align: center;">
          <img src="${process.env.NEXT_PUBLIC_BASE_URL}/logo.png" alt="Top City Tickets" style="height: 60px;" />
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #0A0E35;">Your Event is Coming Soon!</h2>
          <p>This is a friendly reminder about your upcoming event:</p>
          
          <div style="background-color: white; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <p><strong>Event:</strong> ${ticket.eventTitle}</p>
            <p><strong>Ticket Code:</strong> ${ticket.ticketCode}</p>
          </div>
          
          <p>Don't forget to have your ticket ready for scanning at the entrance.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/user/tickets" 
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

    return this.sendEmail(to, subject, html)
  }
}

// Create a singleton instance
export const emailService = new EmailService()
