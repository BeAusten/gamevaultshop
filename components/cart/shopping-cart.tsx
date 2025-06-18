"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCartItems, updateCartItemQuantity, removeFromCart, clearCart, type CartItem } from "@/lib/cart"
import { createPurchaseRequest } from "@/lib/purchases"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Plus, Minus, Trash2, CreditCard, ExternalLink, ShoppingCartIcon as CartIcon } from "lucide-react"
import Image from "next/image"

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
  onCartUpdate?: () => void
  adminSettings?: { [key: string]: string }
}

export function ShoppingCartComponent({ isOpen, onClose, onCartUpdate, adminSettings = {} }: ShoppingCartProps) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [purchaseId, setPurchaseId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchCartItems()
    }
  }, [isOpen, user])

  const fetchCartItems = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const items = await getCartItems(user.id)
      setCartItems(items)
    } catch (error) {
      console.error("Error fetching cart items:", error)
      toast.error("Failed to load cart items")
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    try {
      await updateCartItemQuantity(cartItemId, newQuantity)
      await fetchCartItems()
      onCartUpdate?.()
    } catch (error) {
      toast.error("Failed to update quantity")
    }
  }

  const removeItem = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId)
      await fetchCartItems()
      onCartUpdate?.()
      toast.success("Item removed from cart")
    } catch (error) {
      toast.error("Failed to remove item")
    }
  }

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return

    setIsCheckingOut(true)
    try {
      console.log("Starting checkout process...")
      console.log("Cart items:", cartItems)

      const purchaseRequest = await createPurchaseRequest(user.id, cartItems)
      console.log("Purchase request created:", purchaseRequest)

      setPurchaseId(purchaseRequest.purchase_id)
      await clearCart(user.id)
      setCartItems([])
      onCartUpdate?.()
      toast.success("Purchase request created! Check Discord for details.")
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to create purchase request: " + (error as Error).message)
    } finally {
      setIsCheckingOut(false)
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  if (purchaseId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-slate-900 border-green-500/30">
          <DialogHeader>
            <DialogTitle className="text-green-400 text-center">Purchase Request Created!</DialogTitle>
            <DialogDescription className="text-center">
              Your purchase request has been submitted successfully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-center">
            <div className="p-6 bg-green-500/10 rounded-lg border border-green-500/30">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Purchase ID</h3>
              <p className="text-2xl font-mono font-bold text-white">{purchaseId}</p>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              <p>• Save your Purchase ID for reference</p>
              <p>• Join our Discord server to complete payment</p>
              <p>• An admin will process your request shortly</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className="premium-button"
                onClick={() => {
                  const discordLink = adminSettings?.discord_server_link || "https://discord.gg/yourserver"
                  window.open(discordLink, "_blank")
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Discord Server
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPurchaseId(null)
                  onClose()
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-blue-500/30 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-400">
            <CartIcon className="w-5 h-5" />
            Shopping Cart ({cartItems.length})
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-8">
            <CartIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="premium-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                      <Image
                        src={item.product.image_url || "/placeholder.svg?height=64&width=64"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{item.product.name}</h4>
                      <p className="text-blue-400 font-bold">{formatPrice(item.product.price)}</p>
                      {item.product.stock <= 5 && (
                        <Badge variant="destructive" className="text-xs">
                          Only {item.product.stock} left!
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-400">{formatPrice(totalPrice)}</span>
              </div>

              <Button
                className="w-full premium-button"
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isCheckingOut ? "Processing..." : "Create Purchase Request"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export const ShoppingCart = ShoppingCartComponent
