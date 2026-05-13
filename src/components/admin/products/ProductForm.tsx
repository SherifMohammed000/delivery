"use client";

import React, { useState } from "react";
import { ProductInput } from "@/types/product";
import { AuthInput } from "@/components/auth/AuthInput";
import { Save, Loader2, X } from "lucide-react";
import Link from "next/link";

interface ProductFormProps {
  initialData?: ProductInput;
  onSubmit: (data: ProductInput) => Promise<void>;
  loading: boolean;
  title: string;
}

export const ProductForm = ({ initialData, onSubmit, loading, title }: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductInput>(
    initialData || {
      name: "",
      size: "",
      priceInPesewas: 0,
      stock: 0,
      isAvailable: true,
      imageUrl: "",
      category: "domestic",
      description: "",
    }
  );

  // Buffer for GH₵ input display
  const [priceBuffer, setPriceBuffer] = useState(
    initialData ? (initialData.priceInPesewas / 100).toString() : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceBuffer(value);
    
    // Parse as float and convert to pesewas
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      setFormData({ ...formData, priceInPesewas: Math.round(parsed * 100) });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">{title}</h1>
        <Link 
          href="/admin/products"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-10 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-zinc-900 border-l-4 border-orange-500 pl-4 mb-2">Basic Info</h2>
            <AuthInput
              label="Product Name"
              id="name"
              type="text"
              required
              placeholder="e.g. 14.5kg Refill"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <AuthInput
                label="Size Label"
                id="size"
                type="text"
                required
                placeholder="e.g. 14.5kg"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider pl-1">Category</label>
                <select
                  className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-600 transition-all text-zinc-900 font-medium"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                >
                  <option value="domestic">Domestic</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider pl-1">Description</label>
              <textarea
                className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-600 transition-all text-zinc-900 font-medium min-h-[120px]"
                placeholder="Product details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-zinc-900 border-l-4 border-orange-500 pl-4 mb-2">Inventory & Pricing</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <AuthInput
                label="Price (GH₵)"
                id="price"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={priceBuffer}
                onChange={handlePriceChange}
              />
              <AuthInput
                label="Stock Level"
                id="stock"
                type="number"
                required
                placeholder="0"
                value={formData.stock.toString()}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <AuthInput
              label="Image URL"
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />

            {formData.imageUrl && (
              <div className="mt-4 p-2 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                <p className="text-[10px] text-zinc-400 font-bold uppercase mb-2 text-center">Preview</p>
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded-xl"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 disabled:bg-orange-400 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "Saving Changes..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
