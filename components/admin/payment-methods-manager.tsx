"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CreditCard, Wallet, Gift, Building, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface PaymentMethod {
  key: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

interface PaymentMethodsManagerProps {
  paymentMethods: { [key: string]: boolean }
  onUpdate: (methods: { [key: string]: boolean }) => void
}

export function PaymentMethodsManager({ paymentMethods, onUpdate }: PaymentMethodsManagerProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([])

  const defaultMethods: Omit<PaymentMethod, "enabled">[] = [
    {
      key: "paypal",
      name: "PayPal",
      description: "Accept payments via PayPal",
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      key: "crypto",
      name: "Cryptocurrency",
      description: "Accept Bitcoin, Ethereum, and other cryptocurrencies",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      key: "gift_cards",
      name: "Gift Cards",
      description: "Accept various gift cards as payment",
      icon: <Gift className="w-5 h-5" />,
    },
    {
      key: "bank_transfer",
      name: "Bank Transfer",
      description: "Accept direct bank transfers",
      icon: <Building className="w-5 h-5" />,
    },
    {
      key: "cash_app",
      name: "Cash App",
      description: "Accept payments via Cash App",
      icon: <Smartphone className="w-5 h-5" />,
    },
  ]

  useEffect(() => {
    const methodsWithStatus = defaultMethods.map((method) => ({
      ...method,
      enabled: paymentMethods[method.key] ?? false,
    }))
    setMethods(methodsWithStatus)
  }, [paymentMethods])

  const toggleMethod = (key: string, enabled: boolean) => {
    const updatedMethods = { ...paymentMethods, [key]: enabled }
    onUpdate(updatedMethods)

    const method = defaultMethods.find((m) => m.key === key)
    toast.success(`${method?.name} ${enabled ? "enabled" : "disabled"}`)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
          <CreditCard className="w-4 h-4 mr-2" />
          Payment Methods
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-900 border-green-500/30">
        <DialogHeader>
          <DialogTitle className="text-green-400">Manage Payment Methods</DialogTitle>
        </DialogHeader>

        <Card className="bg-slate-800/50 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400">Available Payment Methods</CardTitle>
            <CardDescription>
              Enable or disable payment methods that will be shown to customers in the guide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {methods.map((method) => (
              <div key={method.key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-blue-400">{method.icon}</div>
                  <div>
                    <Label className="text-white font-semibold">{method.name}</Label>
                    <p className="text-sm text-gray-400">{method.description}</p>
                  </div>
                </div>
                <Switch
                  checked={method.enabled}
                  onCheckedChange={(enabled) => toggleMethod(method.key, enabled)}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="text-sm text-gray-400 p-4 bg-slate-800/30 rounded-lg">
          <p className="font-semibold text-gray-300 mb-2">Note:</p>
          <p>
            These settings control which payment methods are displayed in the user guide. Customers will only see
            enabled payment methods when viewing payment instructions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
