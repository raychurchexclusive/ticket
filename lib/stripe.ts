import { Stripe } from "stripe"

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Calculate platform fee (5%)
export const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * 0.05)
}

// Format amount for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100)
}

// Format amount from Stripe (convert cents to dollars)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100
}

// Create a Stripe product for an event
export const createEventProduct = async (
  eventId: string,
  eventTitle: string,
  eventDescription: string,
  price: number,
  sellerStripeAccountId: string,
) => {
  try {
    // Create a product
    const product = await stripe.products.create({
      name: eventTitle,
      description: eventDescription,
      metadata: {
        eventId,
      },
    })

    // Create a price for the product
    const priceInCents = formatAmountForStripe(price)
    const priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: priceInCents,
      currency: "usd",
    })

    return {
      productId: product.id,
      priceId: priceObj.id,
      success: true,
    }
  } catch (error) {
    console.error("Error creating Stripe product:", error)
    return {
      error: "Failed to create Stripe product",
      success: false,
    }
  }
}
