"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConnectAccount } from "@/components/stripe/connect-account"
import { useAuth } from "@/lib/auth-context"
import { useRealtimeCollection } from "@/hooks/use-realtime-data"
import { getSellerStripeAccount } from "@/app/api/stripe/actions"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckIcon as BankCheck,
  Calendar,
  DollarSign,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  RefreshCw,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SellerPaymentsPage() {
  const { userData } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [stripeAccountStatus, setStripeAccountStatus] = useState<{
    accountId?: string
    payoutsEnabled?: boolean
    chargesEnabled?: boolean
    detailsSubmitted?: boolean
    error?: string
  }>({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch payment history in real-time
  const { data: payments, loading: paymentsLoading } = useRealtimeCollection("payments", {
    where: [["sellerId", "==", userData?.uid || ""]],
    orderBy: [["createdAt", "desc"]],
    limit: 10,
  })

  // Fetch events in real-time
  const { data: events, loading: eventsLoading } = useRealtimeCollection("events", {
    where: [["sellerId", "==", userData?.uid || ""]],
    orderBy: [["createdAt", "desc"]],
  })

  // Calculate total earnings
  const totalEarnings = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const pendingPayouts = payments
    .filter((payment) => payment.status === "available")
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)

  // Check Stripe account status
  const checkAccountStatus = async () => {
    if (!userData?.uid) return

    setIsRefreshing(true)
    try {
      const result = await getSellerStripeAccount(userData.uid)
      setStripeAccountStatus(result)
    } catch (error) {
      console.error("Error checking account status:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Check status on component mount
  useEffect(() => {
    if (userData?.uid) {
      checkAccountStatus()
    }
  }, [userData?.uid])

  // Handle payout request
  const handleRequestPayout = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would call a server action to request a payout
      // For now, we'll just show a success toast
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Payout requested",
        description: "Your payout request has been submitted and will be processed within 1-2 business days.",
      })
    } catch (error) {
      console.error("Error requesting payout:", error)
      toast({
        title: "Error",
        description: "There was an error requesting your payout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If user is not a seller, redirect to dashboard
  if (userData && userData.role !== "seller") {
    return (
      <div className="space-y-6">
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader>
            <CardTitle>Seller Access Required</CardTitle>
            <CardDescription>You need to be a seller to access this page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                This page is only accessible to sellers. Please apply to become a seller in your account settings.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push("/dashboard/user/settings")}
              className="bg-tct-magenta hover:bg-tct-magenta/90"
            >
              Go to Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments Dashboard</h1>
        <Button
          variant="outline"
          onClick={checkAccountStatus}
          disabled={isRefreshing}
          className="bg-tct-navy/50 border-tct-cyan/30 text-white hover:bg-tct-navy/70"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-tct-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings from ticket sales</p>
          </CardContent>
        </Card>
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
            <BankCheck className="h-4 w-4 text-tct-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Funds available for withdrawal</p>
          </CardContent>
        </Card>
        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-tct-coral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.filter((e) => e.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Events currently selling tickets</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Payment Account</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <div className="grid gap-6 md:grid-cols-2">
            <ConnectAccount sellerId={userData?.uid || ""} email={userData?.email || ""} />

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
                  <h3 className="font-medium">Platform Fee</h3>
                  <p className="text-sm text-gray-300">
                    Top City Tickets takes an 8% platform fee from each ticket sale. The remaining 92% is transferred to
                    your connected Stripe account.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Payout Schedule</h3>
                  <p className="text-sm text-gray-300">
                    Funds are available for payout 7 days after the ticket sale. This holding period helps protect
                    against chargebacks and fraud.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Tax Information</h3>
                  <p className="text-sm text-gray-300">
                    You are responsible for reporting income and paying applicable taxes. We provide a year-end summary
                    for your tax reporting.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Payment FAQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-tct-navy border border-tct-cyan/20 text-white">
                    <DialogHeader>
                      <DialogTitle>Payment FAQ</DialogTitle>
                      <DialogDescription>Frequently asked questions about payments and payouts</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">How long until I receive my money?</h3>
                        <p className="text-sm text-gray-300">
                          Funds are available for payout 7 days after the ticket sale. Once you request a payout, it
                          typically takes 1-2 business days to reach your bank account.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">What happens if a customer requests a refund?</h3>
                        <p className="text-sm text-gray-300">
                          If a refund is issued, the amount will be deducted from your available balance. If there are
                          insufficient funds, it may be deducted from future sales.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">Are there any additional fees?</h3>
                        <p className="text-sm text-gray-300">
                          Stripe charges a small fee for each payout to your bank account. This is typically around
                          0.25% of the payout amount.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Documentation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent payments from ticket sales</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-tct-navy/50 rounded"></div>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-500 mb-4 opacity-20" />
                  <p className="text-gray-400 mb-2">No payment history yet</p>
                  <p className="text-sm text-gray-500">Payments will appear here once you start selling tickets</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="font-medium">{payment.eventTitle}</div>
                          <div className="text-xs text-muted-foreground">Order #{payment.orderId}</div>
                        </TableCell>
                        <TableCell>{new Date(payment.createdAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.ticketCount}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              payment.status === "available"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : payment.status === "paid"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
              <Button variant="outline">View All</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
              <CardHeader>
                <CardTitle>Request Payout</CardTitle>
                <CardDescription>Transfer your available funds to your bank account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-md border-tct-cyan/20 bg-tct-navy/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Available for payout:</span>
                    <span className="font-bold">${pendingPayouts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Payout fee:</span>
                    <span className="text-sm">$0.25</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-tct-cyan/10">
                    <span className="font-medium">Total payout amount:</span>
                    <span className="font-bold">${(pendingPayouts - 0.25).toFixed(2)}</span>
                  </div>
                </div>

                {!stripeAccountStatus.payoutsEnabled && (
                  <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Account Setup Required</AlertTitle>
                    <AlertDescription>
                      You need to complete your Stripe account setup before you can request payouts.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-tct-magenta hover:bg-tct-magenta/90"
                  onClick={handleRequestPayout}
                  disabled={isLoading || !stripeAccountStatus.payoutsEnabled || pendingPayouts <= 0}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      Request Payout
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>Recent transfers to your bank account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BankCheck className="h-12 w-12 mx-auto text-gray-500 mb-4 opacity-20" />
                  <p className="text-gray-400 mb-2">No payout history yet</p>
                  <p className="text-sm text-gray-500">
                    Your payout history will appear here once you request your first payout
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  View All Payouts
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
