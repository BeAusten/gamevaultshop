"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Palette, Edit, GripVertical } from "lucide-react"
import { toast } from "sonner"

interface RarityColor {
  name: string
  color: string
}

interface RarityColorsManagerProps {
  rarityColors: { [key: string]: string }
  rarityOrder: string[]
  onUpdate: (colors: { [key: string]: string }, order: string[]) => void
}

export function RarityColorsManager({ rarityColors, rarityOrder, onUpdate }: RarityColorsManagerProps) {
  const [colors, setColors] = useState<RarityColor[]>([])
  const [order, setOrder] = useState<string[]>([])
  const [newRarity, setNewRarity] = useState({ name: "", color: "#3B82F6" })
  const [editingRarity, setEditingRarity] = useState<RarityColor | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    // Create ordered array based on rarityOrder
    const orderedColors: RarityColor[] = []
    const colorEntries = Object.entries(rarityColors)

    // First add items in the specified order
    rarityOrder.forEach((name) => {
      const colorEntry = colorEntries.find(([key]) => key === name)
      if (colorEntry) {
        orderedColors.push({ name: colorEntry[0], color: colorEntry[1] })
      }
    })

    // Then add any remaining items not in the order
    colorEntries.forEach(([name, color]) => {
      if (!rarityOrder.includes(name)) {
        orderedColors.push({ name, color })
      }
    })

    setColors(orderedColors)
    setOrder(orderedColors.map((c) => c.name))
  }, [rarityColors, rarityOrder])

  const addRarity = () => {
    if (!newRarity.name.trim()) {
      toast.error("Please enter a rarity name")
      return
    }

    const rarityName = newRarity.name.toLowerCase().trim()

    if (colors.some((c) => c.name === rarityName)) {
      toast.error("Rarity already exists")
      return
    }

    const updatedColors = [...colors, { name: rarityName, color: newRarity.color }]
    const updatedOrder = [...order, rarityName]

    updateColors(updatedColors, updatedOrder)
    setNewRarity({ name: "", color: "#3B82F6" })
    toast.success("Rarity color added!")
  }

  const updateRarity = () => {
    if (!editingRarity) return

    const updatedColors = colors.map((color) => (color.name === editingRarity.name ? editingRarity : color))
    updateColors(updatedColors, order)
    setEditingRarity(null)
    toast.success("Rarity color updated!")
  }

  const deleteRarity = (name: string) => {
    const updatedColors = colors.filter((color) => color.name !== name)
    const updatedOrder = order.filter((n) => n !== name)
    updateColors(updatedColors, updatedOrder)
    toast.success("Rarity color deleted!")
  }

  const updateColors = (updatedColors: RarityColor[], updatedOrder: string[]) => {
    setColors(updatedColors)
    setOrder(updatedOrder)

    const colorObject = updatedColors.reduce(
      (acc, { name, color }) => {
        acc[name] = color
        return acc
      },
      {} as { [key: string]: string },
    )

    onUpdate(colorObject, updatedOrder)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newColors = [...colors]
    const newOrder = [...order]

    // Remove dragged item
    const [draggedColor] = newColors.splice(draggedIndex, 1)
    const [draggedName] = newOrder.splice(draggedIndex, 1)

    // Insert at new position
    newColors.splice(dropIndex, 0, draggedColor)
    newOrder.splice(dropIndex, 0, draggedName)

    updateColors(newColors, newOrder)
    setDraggedIndex(null)
    toast.success("Rarity order updated!")
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
          <Palette className="w-4 h-4 mr-2" />
          Rarity Colors
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-slate-900 border-pink-500/30 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-pink-400">Manage Rarity Colors</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-hidden">
          {/* Add New Rarity */}
          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-pink-400">Add New Rarity</CardTitle>
              <CardDescription>Define colors for different item rarities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rarity-name">Rarity Name</Label>
                  <Input
                    id="rarity-name"
                    value={newRarity.name}
                    onChange={(e) => setNewRarity({ ...newRarity, name: e.target.value })}
                    placeholder="e.g., legendary, mythic"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="rarity-color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rarity-color"
                      type="color"
                      value={newRarity.color}
                      onChange={(e) => setNewRarity({ ...newRarity, color: e.target.value })}
                      className="bg-slate-700 border-slate-600 w-16 h-10 p-1"
                    />
                    <Input
                      value={newRarity.color}
                      onChange={(e) => setNewRarity({ ...newRarity, color: e.target.value })}
                      placeholder="#3B82F6"
                      className="bg-slate-700 border-slate-600 flex-1"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={addRarity} className="bg-pink-600 hover:bg-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Rarity
              </Button>
            </CardContent>
          </Card>

          {/* Existing Rarities */}
          <Card className="bg-slate-800/50 border-pink-500/20 flex-1 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-pink-400">Current Rarity Colors</CardTitle>
              <CardDescription>Drag and drop to reorder rarities</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <ScrollArea className="h-96">
                <div className="space-y-3 pr-4">
                  {colors.map((rarity, index) => (
                    <div
                      key={rarity.name}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-3 bg-slate-700/50 rounded-lg cursor-move transition-all ${
                        draggedIndex === index ? "opacity-50 scale-95" : "hover:bg-slate-700/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: rarity.color }}
                        />
                        <div>
                          <Badge style={{ backgroundColor: rarity.color, color: "white" }} className="capitalize">
                            {rarity.name}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">{rarity.color}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRarity(rarity)}
                          className="border-blue-500/50 text-blue-400"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteRarity(rarity.name)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Edit Rarity Dialog */}
        {editingRarity && (
          <Dialog open={!!editingRarity} onOpenChange={() => setEditingRarity(null)}>
            <DialogContent className="bg-slate-900 border-pink-500/30">
              <DialogHeader>
                <DialogTitle className="text-pink-400">Edit Rarity Color</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rarity Name</Label>
                  <Input
                    value={editingRarity.name}
                    onChange={(e) => setEditingRarity({ ...editingRarity, name: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editingRarity.color}
                      onChange={(e) => setEditingRarity({ ...editingRarity, color: e.target.value })}
                      className="bg-slate-700 border-slate-600 w-16 h-10 p-1"
                    />
                    <Input
                      value={editingRarity.color}
                      onChange={(e) => setEditingRarity({ ...editingRarity, color: e.target.value })}
                      className="bg-slate-700 border-slate-600 flex-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={updateRarity} className="bg-pink-600 hover:bg-pink-700">
                    Update
                  </Button>
                  <Button variant="outline" onClick={() => setEditingRarity(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
