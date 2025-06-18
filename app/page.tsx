"use client"

import { useState, useEffect } from "react"
import { supabase, type Category, type Subcategory, type Product } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { addToCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Settings, ShoppingCartIcon as CartIcon, Crown, Star, Zap, LogOut, Package, User, BookOpen } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart } from "@/components/cart/shopping-cart"

export default function HomePage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [adminSettings, setAdminSettings] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (user) {
      fetchData()
      fetchCartCount()
      fetchAdminSettings()
    }
  }, [user])

  const fetchData = async () => {
    const [categoriesRes, subcategoriesRes, productsRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("subcategories").select("*").order("name"),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
    ])

    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (subcategoriesRes.data) setSubcategories(subcategoriesRes.data)
    if (productsRes.data) setProducts(productsRes.data)

    if (categoriesRes.data && categoriesRes.data.length > 0) {
      setActiveCategory(categoriesRes.data[0].slug)
    }
  }

  const fetchCartCount = async () => {
    if (!user) return

    try {
      const { data } = await supabase.from("cart_items").select("quantity").eq("user_id", user.id)
      const count = data?.reduce((sum, item) => sum + item.quantity, 0) || 0
      setCartCount(count)
    } catch (error) {
      console.error("Error fetching cart count:", error)
    }
  }

  const handleAddToCart = async (productId: number) => {
    if (!user) return

    try {
      await addToCart(user.id, productId)
      fetchCartCount()
      // Refresh products to show updated stock
      fetchData()
      toast.success("Item added to cart!")
    } catch (error) {
      toast.error("Failed to add item to cart")
      console.error("Add to cart error:", error)
    }
  }

  const getSubcategoriesForCategory = (categoryId: number) => {
    return subcategories.filter((sub) => sub.category_id === categoryId)
  }

  const getProductsForSubcategory = (subcategoryId: number) => {
    return products.filter((product) => product.subcategory_id === subcategoryId)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const getRarityClass = (specifications: any) => {
    const rarity = specifications?.rarity?.toLowerCase()
    if (rarity === "legendary") return "legendary-card"
    if (rarity === "mythic") return "mythic-card"
    return "premium-card"
  }

  const getRarityColorFromSettings = (rarity: string) => {
    try {
      const rarityColors = JSON.parse(adminSettings.rarity_colors || "{}")
      return rarityColors[rarity?.toLowerCase()] || "#3B82F6"
    } catch {
      return "#3B82F6"
    }
  }

  const getRarityColor = (specifications: any) => {
    const rarity = specifications?.rarity?.toLowerCase()
    if (rarity) {
      const color = getRarityColorFromSettings(rarity)
      return `text-[${color}]`
    }
    return "text-blue-400"
  }

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading GameVault...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-blue-500/20 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-gaming font-bold neon-text bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  GameVault
                </h1>
                <p className="text-xs text-gray-400">Premium Gaming Marketplace</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-300">Welcome back,</p>
                <p className="font-semibold text-white">{user.email}</p>
                {user.is_admin && (
                  <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>

              <Link href="/guide">
                <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guide
                </Button>
              </Link>

              <Link href="/profile">
                <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>

              <Button
                variant="outline"
                className="relative border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                onClick={() => setIsCartOpen(true)}
              >
                <CartIcon className="h-4 w-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {user.is_admin && (
                <Link href="/admin">
                  <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="icon" onClick={logout} className="text-gray-400 hover:text-white">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="float-animation">
            <h2 className="text-6xl font-gaming font-bold mb-6 neon-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Premium Gaming Arsenal
            </h2>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover legendary items, mythic collectibles, and exclusive digital assets. Your gateway to the ultimate
            gaming experience.
          </p>
          <div className="flex justify-center space-x-6">
            <Badge
              variant="secondary"
              className="px-6 py-3 text-lg bg-yellow-500/20 text-yellow-400 border-yellow-500/50 pulse-glow"
            >
              <Star className="h-5 w-5 mr-2" />
              Legendary Quality
            </Badge>
            <Badge variant="secondary" className="px-6 py-3 text-lg bg-blue-500/20 text-blue-400 border-blue-500/50">
              <Zap className="h-5 w-5 mr-2" />
              Fast Delivery
            </Badge>
            <Badge
              variant="secondary"
              className="px-6 py-3 text-lg bg-purple-500/20 text-purple-400 border-purple-500/50"
            >
              <Package className="h-5 w-5 mr-2" />
              Secure Trading
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20">
        {categories.length > 0 && (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            {/* Horizontal Scrollable Category Tabs */}
            <div className="relative mb-12">
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="flex h-14 bg-slate-800/50 border border-blue-500/20 p-1">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.slug}
                      value={category.slug}
                      className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 font-semibold text-lg px-8 whitespace-nowrap"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {categories.map((category) => (
              <TabsContent key={category.slug} value={category.slug} className="space-y-12">
                {getSubcategoriesForCategory(category.id).map((subcategory) => {
                  const subcategoryProducts = getProductsForSubcategory(subcategory.id)

                  if (subcategoryProducts.length === 0) return null

                  return (
                    <div key={subcategory.id} className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-3xl font-gaming font-bold text-blue-400 mb-2">{subcategory.name}</h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
                      </div>

                      {/* Horizontal Scrollable Products */}
                      <div className="relative">
                        <ScrollArea className="w-full">
                          <div className="flex space-x-6 pb-4">
                            {subcategoryProducts.map((product) => {
                              const isOnSale = (product as any).sale_active
                              const displayPrice = isOnSale ? (product as any).sale_price : product.price

                              return (
                                <Card
                                  key={product.id}
                                  className={`${getRarityClass(product.specifications)} cursor-pointer group relative overflow-hidden flex-shrink-0 w-80`}
                                  onClick={() => setSelectedProduct(product)}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                                      <Image
                                        src={product.image_url || "/placeholder.svg?height=300&width=300"}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                      />
                                      {product.specifications?.rarity && (
                                        <Badge
                                          className={`absolute top-2 right-2 ${getRarityColor(product.specifications)} bg-black/50 backdrop-blur-sm`}
                                        >
                                          {product.specifications.rarity}
                                        </Badge>
                                      )}
                                      {isOnSale && (
                                        <Badge className="absolute top-2 left-2 bg-red-500/80 text-white">
                                          -{(product as any).sale_percentage}% OFF
                                        </Badge>
                                      )}
                                      {product.stock <= 5 && !isOnSale && (
                                        <Badge className="absolute top-2 left-2 bg-red-500/80 text-white">
                                          Only {product.stock} left!
                                        </Badge>
                                      )}
                                    </div>
                                    <CardTitle
                                      className={`text-lg ${getRarityColor(product.specifications)} group-hover:text-white transition-colors font-gaming`}
                                    >
                                      {product.name}
                                    </CardTitle>
                                    <CardDescription className="text-gray-400 line-clamp-2">
                                      {product.description}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-col">
                                        {isOnSale ? (
                                          <>
                                            <span className="text-gray-400 line-through text-sm">
                                              {formatPrice(product.price)}
                                            </span>
                                            <span className="text-2xl font-bold text-green-400 font-gaming">
                                              {formatPrice(displayPrice)}
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-2xl font-bold text-white font-gaming">
                                            {formatPrice(displayPrice)}
                                          </span>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        className="premium-button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleAddToCart(product.id)
                                        }}
                                        disabled={product.stock === 0}
                                      >
                                        <CartIcon className="h-4 w-4 mr-2" />
                                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                    </div>
                  )
                })}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl bg-slate-900 border-blue-500/30">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-3xl font-gaming ${getRarityColor(selectedProduct.specifications)}`}>
                  {selectedProduct.name}
                </DialogTitle>
                <DialogDescription className="text-gray-300 text-lg">{selectedProduct.description}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square relative overflow-hidden rounded-lg">
                    <Image
                      src={selectedProduct.image_url || "/placeholder.svg?height=500&width=500"}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {(selectedProduct as any).sale_active ? (
                        <>
                          <span className="text-gray-400 line-through text-lg">
                            {formatPrice(selectedProduct.price)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-4xl font-bold text-green-400 font-gaming">
                              {formatPrice((selectedProduct as any).sale_price)}
                            </span>
                            <Badge className="bg-red-500/20 text-red-400">
                              -{(selectedProduct as any).sale_percentage}% OFF
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-white font-gaming">
                          {formatPrice(selectedProduct.price)}
                        </span>
                      )}
                    </div>
                    <Badge
                      className={`text-lg px-4 py-2 ${getRarityColor(selectedProduct.specifications)} bg-black/50`}
                    >
                      Stock: {selectedProduct.stock}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-2xl font-gaming font-semibold text-blue-400">Specifications</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
                            <span className="text-gray-400 capitalize font-semibold">{key.replace("_", " ")}:</span>
                            <span className="text-white font-semibold">
                              {Array.isArray(value) ? value.join(", ") : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Button
                      className="w-full premium-button text-lg py-6"
                      onClick={() => {
                        handleAddToCart(selectedProduct.id)
                        setSelectedProduct(null)
                      }}
                      disabled={selectedProduct.stock === 0}
                    >
                      <CartIcon className="h-5 w-5 mr-2" />
                      {selectedProduct.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>

                    <p className="text-sm text-gray-400 text-center">
                      Items will be reserved in your cart. Complete purchase via Discord.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Shopping Cart */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCartUpdate={fetchCartCount}
        adminSettings={adminSettings}
      />
    </div>
  )
}
