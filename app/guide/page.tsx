"use client"

import { Wallet, CreditCard, Gift, Building, Smartphone } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"

export default function GuidePage() {
  // Add state for admin settings at the top of the component
  const [adminSettings, setAdminSettings] = useState<{ [key: string]: string }>({})

  // Add fetchAdminSettings function
  const fetchAdminSettings = async () => {
    const { data } = await supabase.from("admin_settings").select("*")
    if (data) {
      const settings: { [key: string]: string } = {}
      data.forEach((setting) => {
        settings[setting.setting_key] = setting.setting_value
      })
      setAdminSettings(settings)
    }
  }

  // Add useEffect to fetch settings
  useEffect(() => {
    fetchAdminSettings()
  }, [])

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold mb-6">Guide</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="text-gray-300">
          Welcome to our platform! This guide will help you understand the basics and get you started quickly.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Account Setup</h2>
        <ol className="list-decimal list-inside text-gray-300 space-y-2">
          <li>Create an account by clicking the "Sign Up" button.</li>
          <li>Verify your email address to activate your account.</li>
          <li>Set up your profile with your personal information.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
        {/* In the Payment Methods section, replace the hardcoded payment methods with dynamic ones: */}
        <div className="space-y-4">
          {(() => {
            const paymentMethods = JSON.parse(
              adminSettings.payment_methods || '{"paypal": true, "crypto": true, "gift_cards": true}',
            )
            const enabledMethods = []

            if (paymentMethods.paypal) {
              enabledMethods.push(
                <div key="paypal" className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-blue-400">PayPal</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Send payment to our PayPal account. Include your Purchase ID in the payment note.
                  </p>
                </div>,
              )
            }

            if (paymentMethods.crypto) {
              enabledMethods.push(
                <div key="crypto" className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-semibold text-yellow-400">Cryptocurrency</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    We accept Bitcoin, Ethereum, and other major cryptocurrencies. Contact us for wallet addresses.
                  </p>
                </div>,
              )
            }

            if (paymentMethods.gift_cards) {
              enabledMethods.push(
                <div key="gift_cards" className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-green-400">Gift Cards</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    We accept Amazon, Steam, Google Play, and other popular gift cards.
                  </p>
                </div>,
              )
            }

            if (paymentMethods.bank_transfer) {
              enabledMethods.push(
                <div key="bank_transfer" className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="w-5 h-5 text-purple-400" />
                    <h4 className="font-semibold text-purple-400">Bank Transfer</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Direct bank transfers accepted. Contact us for banking details.
                  </p>
                </div>,
              )
            }

            if (paymentMethods.cash_app) {
              enabledMethods.push(
                <div key="cash_app" className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-5 h-5 text-pink-400" />
                    <h4 className="font-semibold text-pink-400">Cash App</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Send payment via Cash App. Include your Purchase ID in the payment note.
                  </p>
                </div>,
              )
            }

            return enabledMethods.length > 0 ? (
              enabledMethods
            ) : (
              <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg text-center">
                <p className="text-gray-400">No payment methods are currently enabled.</p>
              </div>
            )
          })()}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="border border-gray-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-200">How do I reset my password?</h3>
            <p className="text-gray-300">
              You can reset your password by clicking the "Forgot Password" link on the login page.
            </p>
          </div>
          <div className="border border-gray-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-200">How do I contact support?</h3>
            <p className="text-gray-300">
              You can contact our support team by sending an email to support@example.com.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
