"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createSetupIntent, savePaymentMethod } from "@/lib/payment-service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { RefreshCw } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface AddPaymentMethodFormProps {
  onSuccess: () => void
}

function PaymentMethodForm({ onSuccess }: AddPaymentMethodFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const { userData } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !userData?.uid || !userData?.email) {
      return
    }

    setIsLoading(true)

    try {
      // Create the payment method
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/user/settings`,
        },
        redirect: "if_required",
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message || "Failed to add payment method",
          variant: "destructive",
        })
        return
      }

      // If we get here, the payment method was created successfully
      if (result.setupIntent && result.setupIntent.payment_method) {
        // Save the payment method to the user's account
        const saveResult = await savePaymentMethod(
          userData.uid,
          userData.email,
          result.setupIntent.payment_method as string,
        )

        if (saveResult.error) {
          toast({
            title: "Error",
            description: saveResult.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Payment method added successfully",
          })
          onSuccess()
        }
      }
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className="w-full bg-tct-magenta hover:bg-tct-magenta/90"
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Add Payment Method"
        )}
      </Button>
    </form>
  )
}

export function AddPaymentMethodForm({ onSuccess }: AddPaymentMethodFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { userData } = useAuth()

  useEffect(() => {
    const getSetupIntent = async () => {
      if (!userData?.uid || !userData?.email) return

      try {
        const result = await createSetupIntent(userData.uid, userData.email)
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          setClientSecret(result.clientSecret!)
        }
      } catch (error) {
        console.error("Error creating setup intent:", error)
        toast({
          title: "Error",
          description: "Failed to initialize payment form",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getSetupIntent()
  }, [userData])

  if (isLoading || !clientSecret) {
    return (
      <div className="py-4 text-center">
        <RefreshCw className="h-8 w-8 mx-auto animate-spin text-tct-cyan" />
        <p className="mt-2">Loading payment form...</p>
      </div>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#e91e63",
        colorBackground: "#0a1929",
        colorText: "#ffffff",
        colorDanger: "#ff5252",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "4px",
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentMethodForm onSuccess={onSuccess} />
    </Elements>
  )
}
