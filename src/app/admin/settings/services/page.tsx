"use client";

import React, { useEffect, useState } from "react";
import { Wrench, Plus, Info, Loader2, Check, X } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";

interface ServiceConfig {
  id: string;
  size: string;
  estimatedPrice: number;
  commission: number;
  active: boolean;
}

export default function ServiceSettingsPage() {
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({
    size: "",
    estimatedPrice: "",
    commission: ""
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      // Use weightValue for numeric sorting instead of size string
      const q = query(collection(db, "services"), orderBy("weightValue", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceConfig[];
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.size || !newService.estimatedPrice || !newService.commission) return;

    setIsSaving(true);
    setStatus(null);

    // Extract numerical value for sorting (e.g., "12.5kg" -> 12.5)
    const weightMatch = newService.size.match(/(\d+(\.\d+)?)/);
    const weightValue = weightMatch ? parseFloat(weightMatch[0]) : 0;

    try {
      await addDoc(collection(db, "services"), {
        size: newService.size,
        weightValue, 
        estimatedPrice: Math.round(parseFloat(newService.estimatedPrice) * 100), // Pesewas
        commission: Math.round(parseFloat(newService.commission) * 100), // Pesewas
        active: true,
        createdAt: new Date().toISOString()
      });
      setNewService({ size: "", estimatedPrice: "", commission: "" });
      setIsAdding(false);
      setStatus({ type: "success", message: "Configuration saved successfully!" });
      fetchServices();
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      console.error("Error adding service:", error);
      setStatus({ type: "error", message: `Failed to save: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (service: ServiceConfig) => {
    try {
      const serviceRef = doc(db, "services", service.id);
      await updateDoc(serviceRef, {
        active: !service.active
      });
      fetchServices();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Service Settings</h1>
          <p className="text-zinc-500 font-medium">Configure available cylinder sizes and price estimates.</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setStatus(null);
          }}
          disabled={isAdding}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Add Cylinder Size
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {status.type === 'success' ? <Check className="w-5 h-5 transition-transform scale-110" /> : <X className="w-5 h-5" />}
          <p className="font-bold text-sm tracking-tight">{status.message}</p>
        </div>
      )}

      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-zinc-100 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-zinc-900">New Cylinder Configuration</h3>
            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">Cylinder Size (e.g. 12kg)</label>
              <input 
                required
                type="text" 
                placeholder="12kg"
                className="w-full bg-zinc-50 border-none rounded-2xl px-5 py-4 font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                value={newService.size}
                onChange={(e) => setNewService({...newService, size: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">Est. Price (GH₵)</label>
              <input 
                required
                type="number" 
                step="0.01"
                placeholder="150.00"
                className="w-full bg-zinc-50 border-none rounded-2xl px-5 py-4 font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                value={newService.estimatedPrice}
                onChange={(e) => setNewService({...newService, estimatedPrice: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">Commission (GH₵)</label>
              <input 
                required
                type="number" 
                step="0.01"
                placeholder="10.00"
                className="w-full bg-zinc-50 border-none rounded-2xl px-5 py-4 font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                value={newService.commission}
                onChange={(e) => setNewService({...newService, commission: e.target.value})}
              />
            </div>
            <div className="md:col-span-3 pt-2">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-blue-900">About Pricing Estimates</h4>
          <p className="text-blue-700/80 text-sm font-medium leading-relaxed">
            Prices displayed here are <strong>estimates</strong> for customer transparency. 
            Delivery partners pay for gas directly at the station. Commissions are calculated 
            per order regardless of final gas price.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-opacity">
            <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            <p className="mt-4 text-zinc-500 font-bold italic tracking-tight">Syncing with services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Wrench className="w-16 h-16 text-zinc-200 mb-4" />
            <p className="text-zinc-500 font-bold">No cylinder configurations found.</p>
            <p className="text-zinc-400 text-sm">Add your first service size to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Cylinder Size</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Est. Market Price</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Platform Commission</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {services.map((service) => (
                  <tr key={service.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-zinc-900">{service.size}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-zinc-600">GH₵ {(service.estimatedPrice / 100).toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs font-black">
                        GH₵ {(service.commission / 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleStatus(service)}
                        className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all hover:scale-105 ${
                          service.active ? "text-green-600" : "text-zinc-400"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${service.active ? "bg-green-600 animate-pulse" : "bg-zinc-300"}`} />
                        {service.active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-sm font-black text-zinc-400 hover:text-zinc-900 transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
