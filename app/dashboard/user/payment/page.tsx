"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentMethods } from "@/components/payment/payment-methods"
import { useAuth } from "@/lib/auth-context"
import { CreditCard, Receipt, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRealtimeCollection } from "@/hooks/use-realtime-data"

export default function UserPaymentPage() {
  const { userData } = useAuth()
  const [activeTab, setActiveTab] = useState("payment-methods")

  // Fetch payment history
  const { data: payments, loading: paymentsLoading } = useRealtimeCollection("payments", {
    where: [["userId", "==", userData?.uid || ""]],
    orderBy: [["createdAt", "desc"]],
    limit: 10,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Settings</h1>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods">
          <div className="grid gap-6 md:grid-cols-2">
            <PaymentMethods />

            <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-tct-cyan" />
                  Payment Information
                </CardTitle>
                <CardDescription>How payments work on Top City Tickets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Secure Payments</h3>
                  <p className="text-sm text-gray-300">
                    All payment information is securely processed and stored by Stripe. We never store your full card
                    details on our servers.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Saved Payment Methods</h3>
                  <p className="text-sm text-gray-300">
                    Saving a payment method allows for faster checkout. You can add, remove, or update your payment
                    methods at any time.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Billing</h3>
                  <p className="text-sm text-gray-300">
                    You will only be charged when you purchase tickets. There are no subscription or recurring fees for
                    using Top City Tickets.
                  </p>
                </div>
                <Alert className="bg-tct-navy/50 border-tct-cyan/30">
                  <CreditCard className="h-4 w-4 text-tct-cyan" />
                  <AlertTitle>Payment Security</AlertTitle>
                  <AlertDescription>
                    Your payment information is protected with industry-standard encryption and security measures.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment-history">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-tct-coral" />
                Payment History
              </CardTitle>
              <CardDescription>Your recent ticket purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-tct-navy/50 rounded"></div>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-gray-500 mb-4 opacity-20" />
                  <p className="text-gray-400 mb-2">No payment history</p>
                  <p className="text-sm text-gray-500">
                    Your payment history will appear here after you purchase tickets
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-md border border-tct-cyan/20 bg-tct-navy/50"
                    >
                      <div>
                        <div className="font-medium">{payment.eventTitle}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(payment.createdAt?.seconds * 1000).toLocaleDateString()} •{payment.ticketCount}{" "}
                          {payment.ticketCount === 1 ? "ticket" : "tickets"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${payment.amount.toFixed(2)}</div>
                        <div className="text-xs">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : payment.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
