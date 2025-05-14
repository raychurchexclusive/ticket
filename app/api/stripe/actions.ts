"use server"

import { stripe, calculatePlatformFee, formatAmountForStripe } from "@/lib/stripe"

// Create a Connect account link for sellers
export async function createConnectAccountLink(sellerId: string, email: string) {
  try {
    // Check if the seller already has a connected account
    let account
    const accounts = await stripe.accounts.list({
      limit: 100,
    })

    const existingAccount = accounts.data.find((acc) => acc.metadata?.sellerId === sellerId)

    if (existingAccount) {
      account = existingAccount
    } else {
      // Create a new Connect account
      account = await stripe.accounts.create({
        type: "express",
        email,
        metadata: {
          sellerId,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/seller/stripe/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/seller/stripe/success`,
      type: "account_onboarding",
    })

    return { url: accountLink.url }
  } catch (error) {
    console.error("Error creating Connect account link:", error)
    return { error: "Failed to create Connect account link" }
  }
}

// Create a checkout session for a ticket purchase
export async function createCheckoutSession(
  eventId: string,
  eventTitle: string,
  unitAmount: number,
  quantity: number,
  sellerStripeAccountId: string,
  savePaymentMethod = false,
) {
  try {
    const amountInCents = formatAmountForStripe(unitAmount)
    const platformFee = calculatePlatformFee(amountInCents * quantity)

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: eventTitle,
              metadata: {
                eventId,
              },
            },
            unit_amount: amountInCents,
          },
          quantity,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerStripeAccountId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/user/tickets?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${eventId}?canceled=true`,
      metadata: {
        eventId,
        quantity,
      },
      ...(savePaymentMethod && {
        payment_intent_data: {
          setup_future_usage: "on_session",
        },
      }),
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return { error: "Failed to create checkout session" }
  }
}

// Create a payment intent for direct payment
export async function createPaymentIntent(
  eventId: string,
  eventTitle: string,
  amount: number,
  sellerStripeAccountId: string,
  customerId?: string,
) {
  try {
    const amountInCents = formatAmountForStripe(amount)
    const platformFee = calculatePlatformFee(amountInCents)

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        eventId,
        eventTitle,
      },
      ...(customerId && { customer: customerId }),
    })

    return { clientSecret: paymentIntent.client_secret }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return { error: "Failed to create payment intent" }
  }
}

// Retrieve a seller's Stripe account details
export async function getSellerStripeAccount(sellerId: string) {
  try {
    const accounts = await stripe.accounts.list({
      limit: 100,
    })

    const account = accounts.data.find((acc) => acc.metadata?.sellerId === sellerId)

    if (!account) {
      return { error: "Stripe account not found" }
    }

    return {
      accountId: account.id,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
    }
  } catch (error) {
    console.error("Error retrieving seller Stripe account:", error)
    return { error: "Failed to retrieve Stripe account" }
  }
}

// Create a Stripe customer for a user
export async function createOrRetrieveCustomer(userId: string, email: string) {
  try {
    // Check if customer already exists
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    if (customers.data.length > 0) {
      return { customerId: customers.data[0].id }
    }

    // Create a new customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    return { customerId: customer.id }
  } catch (error) {
    console.error("Error creating/retrieving customer:", error)
    return { error: "Failed to create/retrieve customer" }
  }
}

// Webhook handler route
export async function handleStripeWebhook(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        // Process successful checkout
        // Generate tickets, send confirmation emails, etc.
        break
      case "account.updated":
        const account = event.data.object
        // Update seller account status
        break
      // Add more event handlers as needed
    }

    return { received: true }
  } catch (error) {
    console.error("Error handling webhook:", error)
    return { error: "Webhook error" }
  }
}
