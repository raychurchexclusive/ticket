"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { createCheckoutSession, createPaymentIntent } from "@/app/api/stripe/actions"
import { createPaymentIntentWithSavedMethod, getPaymentMethods } from "@/lib/payment-service"
import { useAuth } from "@/lib/auth-context"
import { getEventById } from "@/lib/db-service"
import { ArrowLeft, CreditCard, Lock, ShoppingCart, Ticket, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Payment form component
function PaymentForm({
  clientSecret,
  eventId,
  onSuccess,
}: { clientSecret: string; eventId: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/user/tickets?success=true&event_id=${eventId}`,
        },
        redirect: "if_required",
      })

      if (result.error) {
        toast({
          title: "Payment failed",
          description: result.error.message || "An error occurred during payment",
          variant: "destructive",
        })
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        toast({
          title: "Payment successful",
          description: "Your ticket purchase was successful!",
        })
        onSuccess()
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      toast({
        title: "Payment error",
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
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Pay Now
          </>
        )}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const { userData } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")

  const [isLoading, setIsLoading] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [eventLoading, setEventLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"new" | "saved">("new")
  const [email, setEmail] = useState(userData?.email || "")
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([])
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Fetch event details
  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        router.push("/events")
        return
      }

      try {
        const eventData = await getEventById(eventId)
        if (!eventData) {
          toast({
            title: "Event not found",
            description: "The event you're looking for doesn't exist.",
            variant: "destructive",
          })
          router.push("/events")
          return
        }
        setEvent(eventData)
      } catch (error) {
        console.error("Error fetching event:", error)
        toast({
          title: "Error",
          description: "There was an error loading the event details.",
          variant: "destructive",
        })
      } finally {
        setEventLoading(false)
      }
    }

    fetchEvent()
  }, [eventId, router])

  // Fetch saved payment methods if user is logged in
  useEffect(() => {
    async function fetchPaymentMethods() {
      if (!userData?.uid || !userData?.email) return

      try {
        const result = await getPaymentMethods(userData.uid, userData.email)
        if (result.error) {
          console.error("Error fetching payment methods:", result.error)
        } else {
          setSavedPaymentMethods(result.paymentMethods || [])
          if (result.paymentMethods && result.paymentMethods.length > 0) {
            // Set default payment method if available
            if (result.defaultPaymentMethodId) {
              setSelectedPaymentMethodId(result.defaultPaymentMethodId as string)
            } else {
              setSelectedPaymentMethodId(result.paymentMethods[0].id)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error)
      }
    }

    fetchPaymentMethods()
  }, [userData])

  // Create payment intent for new payment method
  const createPaymentIntentForNewMethod = async () => {
    if (!event) return

    setIsLoading(true)
    try {
      const result = await createPaymentIntent(
        event.id,
        event.title,
        Number.parseFloat(event.price) * quantity,
        event.sellerStripeAccountId,
        userData?.uid,
      )

      if (result.error) {
        console.error(result.error)
        toast({
          title: "Error",
          description: "Failed to initialize payment",
          variant: "destructive",
        })
      } else if (result.clientSecret) {
        setClientSecret(result.clientSecret)
      }
    } catch (error) {
      console.error("Error creating payment intent:", error)
      toast({
        title: "Error",
        description: "Failed to initialize payment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle checkout with saved payment method
  const handleCheckoutWithSavedMethod = async () => {
    if (!event || !userData?.uid || !userData?.email) return

    setIsLoading(true)
    try {
      const result = await createPaymentIntentWithSavedMethod(
        userData.uid,
        userData.email,
        event.id,
        event.title,
        Number.parseFloat(event.price) * quantity,
        event.sellerStripeAccountId,
        selectedPaymentMethodId,
      )

      if (result.error) {
        console.error(result.error)
        toast({
          title: "Payment failed",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Payment successful",
          description: "Your ticket purchase was successful!",
        })
        setPaymentSuccess(true)
        setTimeout(() => {
          router.push(`/dashboard/user/tickets?success=true&event_id=${event.id}`)
        }, 1500)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      toast({
        title: "Payment error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle checkout with guest or new payment method
  const handleCheckout = async () => {
    if (!event) return

    // For guest checkout or when using a new payment method with Stripe Checkout
    if (!userData || (userData && paymentMethod === "new" && !clientSecret)) {
      setIsLoading(true)
      try {
        // For guest checkout, we need to validate the email
        if (!userData && (!email || !email.includes("@"))) {
          toast({
            title: "Invalid email",
            description: "Please enter a valid email address.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        const result = await createCheckoutSession(
          event.id,
          event.title,
          Number.parseFloat(event.price),
          quantity,
          event.sellerStripeAccountId,
          savePaymentMethod,
        )

        if (result.error) {
          console.error(result.error)
          toast({
            title: "Checkout error",
            description: "There was an error processing your checkout. Please try again.",
            variant: "destructive",
          })
        } else if (result.url) {
          window.location.href = result.url
        }
      } catch (error) {
        console.error("Error creating checkout session:", error)
        toast({
          title: "Checkout error",
          description: "There was an error processing your checkout. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else if (userData && paymentMethod === "new" && clientSecret) {
      // Payment intent already created, Elements form will handle submission
    } else if (userData && paymentMethod === "saved") {
      // Use saved payment method
      await handleCheckoutWithSavedMethod()
    }
  }

  // Handle payment method change
  useEffect(() => {
    if (userData && paymentMethod === "new" && !clientSecret) {
      createPaymentIntentForNewMethod()
    }
  }, [paymentMethod, userData])

  if (eventLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-tct-navy/50 rounded"></div>
          <div className="h-64 bg-tct-navy/50 rounded"></div>
          <div className="h-32 bg-tct-navy/50 rounded"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Event not found</AlertTitle>
          <AlertDescription>The event you're looking for doesn't exist or has been removed.</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/events")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader>
            <CardTitle>Payment Successful!</CardTitle>
            <CardDescription>Your ticket purchase was completed successfully.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-900/20 border-green-500/30">
              <Ticket className="h-4 w-4 text-green-500" />
              <AlertTitle>Tickets Purchased</AlertTitle>
              <AlertDescription>
                Your tickets have been sent to your email and are also available in your account.
              </AlertDescription>
            </Alert>
            <div className="text-center py-4">
              <Ticket className="h-16 w-16 mx-auto text-tct-magenta mb-4" />
              <p className="text-xl font-bold mb-2">Thank you for your purchase!</p>
              <p className="text-gray-300">Redirecting to your tickets...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const price = Number.parseFloat(event.price)
  const subtotal = price * quantity
  const serviceFee = subtotal * 0.05
  const total = subtotal + serviceFee

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-tct-magenta" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={event.image || "/placeholder.svg?height=100&width=100"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{event.title}</h2>
                  <p className="text-sm text-gray-300">{event.location}</p>
                  <div className="flex items-center text-sm mt-1">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    {event.time && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{event.time}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-tct-cyan" />
                Payment Details
              </CardTitle>
              <CardDescription>{userData ? "Complete your purchase" : "Guest checkout"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!userData && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                    required
                  />
                  <p className="text-xs text-gray-400">Your tickets will be sent to this email address</p>
                </div>
              )}

              {userData && (
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as "new" | "saved")}
                  >
                    <div className="flex items-center space-x-2 rounded-md border border-tct-cyan/20 p-3">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new" className="flex-1 cursor-pointer">
                        Use a new payment method
                      </Label>
                    </div>

                    {savedPaymentMethods.length > 0 && (
                      <div className="flex items-center space-x-2 rounded-md border border-tct-cyan/20 p-3">
                        <RadioGroupItem value="saved" id="saved" />
                        <Label htmlFor="saved" className="flex-1 cursor-pointer">
                          Use a saved payment method
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>
              )}

              {userData && paymentMethod === "saved" && savedPaymentMethods.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Payment Method</Label>
                  <RadioGroup
                    value={selectedPaymentMethodId}
                    onValueChange={setSelectedPaymentMethodId}
                    className="space-y-2"
                  >
                    {savedPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center space-x-2 rounded-md border border-tct-cyan/20 p-3"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-12 bg-gray-700 rounded flex items-center justify-center text-xs">
                              {method.card.brand.toUpperCase()}
                            </div>
                            <span>•••• {method.card.last4}</span>
                            <span className="text-xs text-gray-400">
                              Expires {method.card.exp_month}/{method.card.exp_year}
                            </span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {userData && paymentMethod === "new" && (
                <>
                  {clientSecret ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
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
                      }}
                    >
                      <PaymentForm
                        clientSecret={clientSecret}
                        eventId={event.id}
                        onSuccess={() => {
                          setPaymentSuccess(true)
                          setTimeout(() => {
                            router.push(`/dashboard/user/tickets?success=true&event_id=${event.id}`)
                          }, 1500)
                        }}
                      />
                    </Elements>
                  ) : (
                    <div className="py-4 text-center">
                      <RefreshCw className="h-8 w-8 mx-auto animate-spin text-tct-cyan" />
                      <p className="mt-2">Loading payment form...</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch id="save-payment" checked={savePaymentMethod} onCheckedChange={setSavePaymentMethod} />
                    <Label htmlFor="save-payment">Save payment method for future purchases</Label>
                  </div>
                </>
              )}

              {(!userData || (userData && paymentMethod === "saved")) && (
                <div className="flex items-center justify-center p-3 bg-tct-navy/50 rounded-md border border-tct-cyan/10">
                  <Lock className="h-4 w-4 text-tct-cyan mr-2" />
                  <span className="text-sm text-gray-300">Secure checkout powered by Stripe</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Number of Tickets</Label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 rounded-r-none p-0"
                  >
                    -
                  </Button>
                  <div className="flex h-8 w-12 items-center justify-center border-y border-input bg-tct-navy/50">
                    {quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-l-none p-0"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Price ({quantity} {quantity === 1 ? "ticket" : "tickets"})
                  </span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service fee (5%)</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-tct-cyan/20">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {userData && paymentMethod === "new" && clientSecret ? (
                <p className="text-sm text-center w-full text-gray-400">
                  Complete the payment form above to purchase your tickets
                </p>
              ) : (
                <Button
                  className="w-full bg-tct-magenta hover:bg-tct-magenta/90"
                  onClick={handleCheckout}
                  disabled={isLoading || (userData && paymentMethod === "saved" && !selectedPaymentMethodId)}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {userData && paymentMethod === "saved" ? "Pay Now" : "Checkout"}
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardContent className="pt-6">
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-tct-cyan mt-0.5" />
                  <p>Your payment information is encrypted and secure.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Ticket className="h-4 w-4 text-tct-magenta mt-0.5" />
                  <p>Tickets will be delivered to your email immediately after purchase.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-tct-coral mt-0.5" />
                  <p>We accept Visa, Mastercard, American Express, and Discover.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
