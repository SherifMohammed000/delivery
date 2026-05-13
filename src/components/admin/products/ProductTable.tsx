"use client";

import React from "react";
import { Product } from "@/types/product";
import { Edit2, Power, PowerOff, Loader2 } from "lucide-react";
import Link from "next/link";

interface ProductTableProps {
  products: Product[];
  onToggleStatus: (id: string) => Promise<void>;
  togglingId: string | null;
}

export const ProductTable = ({ products, onToggleStatus, togglingId }: ProductTableProps) => {
  const formatCurrency = (pesewas: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(pesewas / 100);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden text-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-zinc-50/50 border-b border-zinc-100 text-zinc-500 font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-5">Product</th>
              <th className="px-6 py-5">Category</th>
              <th className="px-6 py-5">Price</th>
              <th className="px-6 py-5">Stock</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-zinc-50/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-12 h-12 rounded-xl object-cover bg-zinc-100 ring-1 ring-zinc-200/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {product.size}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-zinc-900">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.size}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 capitalize text-zinc-600 font-medium">{product.category}</td>
                <td className="px-6 py-5 font-bold text-zinc-900">{formatCurrency(product.priceInPesewas)}</td>
                <td className="px-6 py-5 text-zinc-600 font-medium">
                  <span className={`${product.stock < 10 ? "text-orange-600 font-bold" : ""}`}>
                    {product.stock} units
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    product.isAvailable 
                      ? "bg-green-100 text-green-700" 
                      : "bg-zinc-100 text-zinc-600"
                  }`}>
                    {product.isAvailable ? "Available" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onToggleStatus(product.id)}
                      disabled={togglingId === product.id}
                      className={`p-2 rounded-lg transition-all ${
                        product.isAvailable 
                          ? "text-zinc-400 hover:text-red-600 hover:bg-red-50" 
                          : "text-zinc-400 hover:text-green-600 hover:bg-green-50"
                      }`}
                      title={product.isAvailable ? "Disable" : "Enable"}
                    >
                      {togglingId === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        product.isAvailable ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-zinc-400 font-medium">No products found in the catalog.</p>
        </div>
      )}
    </div>
  );
};
