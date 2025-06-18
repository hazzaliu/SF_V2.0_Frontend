"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { PlusIcon, TrashIcon, BuildingIcon } from "lucide-react"
import type { TrackedSupplier } from "@/types"

interface TrackedSupplierListProps {
  suppliers: TrackedSupplier[]
  onChange: (suppliers: TrackedSupplier[]) => void
}

export default function TrackedSupplierList({ suppliers, onChange }: TrackedSupplierListProps) {
  const { toast } = useToast()
  const [newSupplier, setNewSupplier] = useState<TrackedSupplier>({
    code: "",
    name: "",
    is_prophecy_supplier: false,
  })

  // Ensure suppliers is always an array
  const safeSuppliers = suppliers || []

  // Handle Enter key press to add supplier
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSupplier.code.trim() && newSupplier.name.trim()) {
      e.preventDefault()
      addSupplier()
    }
  }

  const validateSupplier = (supplier: TrackedSupplier): string[] => {
    const errors: string[] = []
    
    if (!supplier.code.trim()) {
      errors.push("Supplier code is required")
    } else if (supplier.code.length > 50) {
      errors.push("Supplier code must be 50 characters or less")
    } else if (!/^[A-Z0-9_-]+$/i.test(supplier.code)) {
      errors.push("Supplier code can only contain letters, numbers, underscores, and hyphens")
    }
    
    if (!supplier.name.trim()) {
      errors.push("Supplier name is required")
    } else if (supplier.name.length > 255) {
      errors.push("Supplier name must be 255 characters or less")
    }
    
    // Check for duplicates
    const existingCodes = safeSuppliers.map(s => s.code.toLowerCase())
    const existingNames = safeSuppliers.map(s => s.name.toLowerCase())
    
    if (existingCodes.includes(supplier.code.toLowerCase())) {
      errors.push("Supplier code already exists")
    }
    
    if (existingNames.includes(supplier.name.toLowerCase())) {
      errors.push("Supplier name already exists")
    }
    
    return errors
  }

  const addSupplier = () => {
    // Debug: Log the current state
    console.log('🔍 Add Supplier clicked:', { newSupplier, suppliers })
    
    const errors = validateSupplier(newSupplier)
    
    if (errors.length > 0) {
      console.error('❌ Validation errors:', errors)
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      })
      return
    }

    try {
      const updatedSuppliers = [...safeSuppliers, { ...newSupplier }]
      console.log('✅ Adding supplier, new list:', updatedSuppliers)
      onChange(updatedSuppliers)
      
      // Reset form
      setNewSupplier({
        code: "",
        name: "",
        is_prophecy_supplier: false,
      })
      
      toast({
        title: "Success",
        description: `Supplier "${newSupplier.name}" added successfully.`,
      })
    } catch (error) {
      console.error('❌ Error adding supplier:', error)
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeSupplier = (index: number) => {
    const supplierToRemove = safeSuppliers[index]
    const updatedSuppliers = safeSuppliers.filter((_, i) => i !== index)
    onChange(updatedSuppliers)
    
    toast({
      title: "Supplier Removed",
      description: `"${supplierToRemove.name}" has been removed from the tracked suppliers list.`,
    })
  }

  const updateSupplier = (index: number, field: keyof TrackedSupplier, value: string | boolean) => {
    const updatedSuppliers = safeSuppliers.map((supplier, i) => 
      i === index ? { ...supplier, [field]: value } : supplier
    )
    onChange(updatedSuppliers)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BuildingIcon className="h-5 w-5" />
          Tracked Suppliers
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add suppliers that will be tracked and evaluated in this project. Specify whether each supplier is a Prophecy supplier.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Supplier Form */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="font-medium mb-4">Add New Supplier</h4>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <Label htmlFor="supplier-code">
                Supplier Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supplier-code"
                value={newSupplier.code}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                onKeyPress={handleKeyPress}
                placeholder="e.g., SUP1, COMP_A"
                maxLength={50}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Short identifier (letters, numbers, _ and - only)
              </p>
            </div>
            <div className="md:col-span-4">
              <Label htmlFor="supplier-name">
                Supplier Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supplier-name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Company Name Ltd"
                maxLength={255}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-3">
              <div className="flex items-center space-x-2 h-10">
                <Checkbox
                  id="prophecy-supplier"
                  checked={newSupplier.is_prophecy_supplier}
                  onCheckedChange={(checked) => 
                    setNewSupplier(prev => ({ ...prev, is_prophecy_supplier: checked as boolean }))
                  }
                />
                <Label htmlFor="prophecy-supplier" className="text-sm whitespace-nowrap">
                  Prophecy Supplier
                </Label>
              </div>
            </div>
            <div className="md:col-span-1 flex justify-end">
              <Button 
                onClick={addSupplier}
                disabled={!newSupplier.code.trim() || !newSupplier.name.trim()}
                size="sm"
                className="h-10"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Suppliers List */}
        {safeSuppliers.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Current Suppliers ({safeSuppliers.length})</h4>
            <div className="space-y-2">
              {safeSuppliers.map((supplier, index) => (
                <div key={`${supplier.code}-${index}`} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <Label htmlFor={`edit-code-${index}`} className="text-xs text-muted-foreground">
                        Code
                      </Label>
                      <Input
                        id={`edit-code-${index}`}
                        value={supplier.code}
                        onChange={(e) => updateSupplier(index, 'code', e.target.value.toUpperCase())}
                        className="text-sm"
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-name-${index}`} className="text-xs text-muted-foreground">
                        Name
                      </Label>
                      <Input
                        id={`edit-name-${index}`}
                        value={supplier.name}
                        onChange={(e) => updateSupplier(index, 'name', e.target.value)}
                        className="text-sm"
                        maxLength={255}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-prophecy-${index}`}
                          checked={supplier.is_prophecy_supplier}
                          onCheckedChange={(checked) => 
                            updateSupplier(index, 'is_prophecy_supplier', checked as boolean)
                          }
                        />
                        <Label htmlFor={`edit-prophecy-${index}`} className="text-sm">
                          Prophecy
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        {supplier.is_prophecy_supplier && (
                          <Badge variant="secondary" className="text-xs">
                            Prophecy
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSupplier(index)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BuildingIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No suppliers added yet</p>
            <p className="text-sm">Add suppliers using the form above</p>
          </div>
        )}

        {safeSuppliers.length > 0 && (
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-900">Export Information:</p>
            <p className="text-blue-800">
              This supplier list will be included in your exported documents after the design brief information.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}