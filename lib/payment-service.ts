"use server"

import { stripe } from "@/lib/stripe"
import { createOrRetrieveCustomer } from "@/app/api/stripe/actions"
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

// Save a payment method to a user's account
export async function savePaymentMethod(userId: string, email: string, paymentMethodId: string) {
  try {
    // Get or create a Stripe customer
    const { customerId, error } = await createOrRetrieveCustomer(userId, email)

    if (error || !customerId) {
      console.error("Error getting/creating customer:", error)
      return { error: "Failed to get/create customer" }
    }

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Save customer ID to user profile if not already saved
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      if (!userDoc.data().stripeCustomerId) {
        await updateDoc(userRef, {
          stripeCustomerId: customerId,
        })
      }
    } else {
      await setDoc(
        userRef,
        {
          stripeCustomerId: customerId,
          email,
        },
        { merge: true },
      )
    }

    return { success: true, customerId }
  } catch (error) {
    console.error("Error saving payment method:", error)
    return { error: "Failed to save payment method" }
  }
}

// Get a user's saved payment methods
export async function getPaymentMethods(userId: string, email: string) {
  try {
    // Get or create a Stripe customer
    const { customerId, error } = await createOrRetrieveCustomer(userId, email)

    if (error || !customerId) {
      console.error("Error getting/creating customer:", error)
      return { error: "Failed to get/create customer" }
    }

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    })

    // Get the default payment method
    const customer = await stripe.customers.retrieve(customerId)
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method

    return {
      paymentMethods: paymentMethods.data,
      defaultPaymentMethodId,
    }
  } catch (error) {
    console.error("Error getting payment methods:", error)
    return { error: "Failed to get payment methods" }
  }
}

// Delete a payment method
export async function deletePaymentMethod(paymentMethodId: string) {
  try {
    await stripe.paymentMethods.detach(paymentMethodId)
    return { success: true }
  } catch (error) {
    console.error("Error deleting payment method:", error)
    return { error: "Failed to delete payment method" }
  }
}

// Set a payment method as default
export async function setDefaultPaymentMethod(userId: string, email: string, paymentMethodId: string) {
  try {
    // Get or create a Stripe customer
    const { customerId, error } = await createOrRetrieveCustomer(userId, email)

    if (error || !customerId) {
      console.error("Error getting/creating customer:", error)
      return { error: "Failed to get/create customer" }
    }

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error setting default payment method:", error)
    return { error: "Failed to set default payment method" }
  }
}

// Create a setup intent for adding a new payment method
export async function createSetupIntent(userId: string, email: string) {
  try {
    // Get or create a Stripe customer
    const { customerId, error } = await createOrRetrieveCustomer(userId, email)

    if (error || !customerId) {
      console.error("Error getting/creating customer:", error)
      return { error: "Failed to get/create customer" }
    }

    // Create a setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    })

    return { clientSecret: setupIntent.client_secret }
  } catch (error) {
    console.error("Error creating setup intent:", error)
    return { error: "Failed to create setup intent" }
  }
}

// Create a payment intent with a saved payment method
export async function createPaymentIntentWithSavedMethod(
  userId: string,
  email: string,
  eventId: string,
  eventTitle: string,
  amount: number,
  sellerStripeAccountId: string,
  paymentMethodId: string,
) {
  try {
    // Get or create a Stripe customer
    const { customerId, error } = await createOrRetrieveCustomer(userId, email)

    if (error || !customerId) {
      console.error("Error getting/creating customer:", error)
      return { error: "Failed to get/create customer" }
    }

    const amountInCents = Math.round(amount * 100)
    const platformFee = Math.round(amountInCents * 0.05)

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: false,
      confirm: true,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        eventId,
        eventTitle,
        userId,
      },
    })

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    }
  } catch (error) {
    console.error("Error creating payment intent with saved method:", error)
    return { error: "Failed to create payment intent" }
  }
}
