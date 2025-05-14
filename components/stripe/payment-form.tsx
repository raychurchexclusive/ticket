"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { createCheckoutSession } from "@/app/api/stripe/actions"
import { ShoppingCart } from "lucide-react"

interface PaymentFormProps {
  eventId: string
  eventTitle: string
  price: number
  sellerStripeAccountId: string
  userId?: string
}

export function PaymentForm({ eventId, eventTitle, price, sellerStripeAccountId, userId }: PaymentFormProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"new" | "saved">("new")

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const result = await createCheckoutSession(
        eventId,
        eventTitle,
        price,
        quantity,
        sellerStripeAccountId,
        savePaymentMethod,
      )

      if (result.error) {
        console.error(result.error)
      } else if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPrice = price * quantity
  const platformFee = totalPrice * 0.08
  const finalPrice = totalPrice + platformFee

  return (
    <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
      <CardHeader>
        <CardTitle>Purchase Tickets</CardTitle>
        <CardDescription>Secure checkout for {eventTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {userId && (
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "new" | "saved")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Use a new payment method</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saved" id="saved" />
                <Label htmlFor="saved">Use a saved payment method</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {userId && paymentMethod === "new" && (
          <div className="flex items-center space-x-2">
            <Switch id="save-payment" checked={savePaymentMethod} onCheckedChange={setSavePaymentMethod} />
            <Label htmlFor="save-payment">Save payment method for future purchases</Label>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-sm">
            <span>
              Price ({quantity} {quantity === 1 ? "ticket" : "tickets"})
            </span>
            <span>${(price * quantity).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service fee (8%)</span>
            <span>${platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-tct-cyan/20">
            <span>Total</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-tct-magenta hover:bg-tct-magenta/90" onClick={handleCheckout} disabled={isLoading}>
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Checkout
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
