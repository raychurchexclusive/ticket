"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getPaymentMethods, deletePaymentMethod, setDefaultPaymentMethod } from "@/lib/payment-service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { CreditCard, Trash2, CheckCircle, PlusCircle, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddPaymentMethodForm } from "./add-payment-method"

export function PaymentMethods() {
  const { userData } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)

  const fetchPaymentMethods = async () => {
    if (!userData?.uid || !userData?.email) return

    setIsLoading(true)
    try {
      const result = await getPaymentMethods(userData.uid, userData.email)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setPaymentMethods(result.paymentMethods || [])
        setDefaultPaymentMethodId((result.defaultPaymentMethodId as string) || null)
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast({
        title: "Error",
        description: "Failed to fetch payment methods",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [userData])

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    setIsDeleting(paymentMethodId)
    try {
      const result = await deletePaymentMethod(paymentMethodId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Payment method deleted successfully",
        })
        fetchPaymentMethods()
      }
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    if (!userData?.uid || !userData?.email) return

    setIsSettingDefault(paymentMethodId)
    try {
      const result = await setDefaultPaymentMethod(userData.uid, userData.email, paymentMethodId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Default payment method updated",
        })
        setDefaultPaymentMethodId(paymentMethodId)
      }
    } catch (error) {
      console.error("Error setting default payment method:", error)
      toast({
        title: "Error",
        description: "Failed to set default payment method",
        variant: "destructive",
      })
    } finally {
      setIsSettingDefault(null)
    }
  }

  const handlePaymentMethodAdded = () => {
    setIsAddingPaymentMethod(false)
    fetchPaymentMethods()
  }

  const getCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1)
  }

  if (isLoading) {
    return (
      <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Loading your saved payment methods...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-tct-navy/50 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-tct-cyan" />
          Payment Methods
        </CardTitle>
        <CardDescription>Manage your saved payment methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-500 mb-4 opacity-20" />
            <p className="text-gray-400 mb-2">No payment methods saved</p>
            <p className="text-sm text-gray-500">Add a payment method to make checkout faster</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-3 rounded-md border border-tct-cyan/20 bg-tct-navy/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 bg-gray-700 rounded flex items-center justify-center text-xs">
                    {getCardBrand(method.card.brand)}
                  </div>
                  <div>
                    <div className="font-medium">
                      •••• {method.card.last4}
                      {defaultPaymentMethodId === method.id && (
                        <span className="ml-2 text-xs bg-tct-cyan/20 text-tct-cyan px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Expires {method.card.exp_month}/{method.card.exp_year}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {defaultPaymentMethodId !== method.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefaultPaymentMethod(method.id)}
                      disabled={isSettingDefault === method.id}
                      className="h-8 w-8 p-0"
                    >
                      {isSettingDefault === method.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span className="sr-only">Set as default</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    disabled={isDeleting === method.id}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    {isDeleting === method.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isAddingPaymentMethod} onOpenChange={setIsAddingPaymentMethod}>
          <DialogTrigger asChild>
            <Button className="w-full bg-tct-magenta hover:bg-tct-magenta/90">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-tct-navy border border-tct-cyan/20 text-white">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>Add a new credit or debit card to your account</DialogDescription>
            </DialogHeader>
            <AddPaymentMethodForm onSuccess={handlePaymentMethodAdded} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
