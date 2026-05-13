"use client";

import React, { useEffect, useState } from "react";
import { 
  Map, 
  Plus, 
  Loader2, 
  Check, 
  X, 
  MapPin, 
  DollarSign, 
  Info,
  Trash2,
  Edit2
} from "lucide-react";
import { fetchZones, addZone, updateZoneStatus, updateZoneDetails, deleteZone } from "@/lib/firebase/zones";
import { Zone } from "@/types/zone";

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  
  const [newZone, setNewZone] = useState({
    name: "",
    description: "",
    deliveryFee: ""
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadZones = async () => {
    setLoading(true);
    try {
      const data = await fetchZones();
      setZones(data);
    } catch (error) {
      console.error("Error fetching zones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name || !newZone.deliveryFee) return;

    setIsSaving(true);
    setStatus(null);

    try {
      const feeInPesewas = Math.round(parseFloat(newZone.deliveryFee) * 100);
      
      if (editingZone) {
        await updateZoneDetails(editingZone.id, {
          name: newZone.name,
          description: newZone.description,
          deliveryFee: feeInPesewas
        });
      } else {
        await addZone({
          name: newZone.name,
          description: newZone.description,
          deliveryFee: feeInPesewas,
          active: true
        });
      }
      
      setNewZone({ name: "", description: "", deliveryFee: "" });
      setIsAdding(false);
      setEditingZone(null);
      setStatus({ type: "success", message: `Zone ${editingZone ? "updated" : "saved"} successfully!` });
      loadZones();
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      console.error("Error saving zone:", error);
      setStatus({ type: "error", message: `Failed to save: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setNewZone({
      name: zone.name,
      description: zone.description,
      deliveryFee: (zone.deliveryFee / 100).toString()
    });
    setIsAdding(true);
  };

  const toggleStatus = async (zone: Zone) => {
    try {
      await updateZoneStatus(zone.id, !zone.active);
      loadZones();
    } catch (error) {
      console.error("Error toggling zone status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this zone?")) {
      try {
        await deleteZone(id);
        loadZones();
      } catch (error) {
        console.error("Error deleting zone:", error);
      }
    }
  };


  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Zone Management</h1>
          <p className="text-zinc-500 font-medium">Define and manage serviceable delivery areas in Ho.</p>
        </div>
        <button
          onClick={() => {
            setEditingZone(null);
            setNewZone({ name: "", description: "", deliveryFee: "" });
            setIsAdding(true);
            setStatus(null);
          }}
          disabled={isAdding}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Add Service Zone
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {status.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <p className="font-bold text-sm tracking-tight">{status.message}</p>
        </div>
      )}

      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-zinc-100 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-zinc-900">{editingZone ? "Edit Zone" : "New Service Zone"}</h3>
            <button 
              onClick={() => {
                setIsAdding(false);
                setEditingZone(null);
              }} 
              className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddZone} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">Zone Name</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Bankoe"
                  className="w-full bg-zinc-50 border-none rounded-2xl pl-11 pr-5 py-4 font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  value={newZone.name}
                  onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">Delivery Fee (GH₵)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  required
                  type="number" 
                  step="0.01"
                  placeholder="10.00"
                  className="w-full bg-zinc-50 border-none rounded-2xl pl-11 pr-5 py-4 font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  value={newZone.deliveryFee}
                  onChange={(e) => setNewZone({...newZone, deliveryFee: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">Description / Landmarks</label>
              <input 
                type="text" 
                placeholder="e.g. Near HTU, Bankoe St."
                className="w-full bg-zinc-50 border-none rounded-2xl px-5 py-4 font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                value={newZone.description}
                onChange={(e) => setNewZone({...newZone, description: e.target.value})}
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
                    {editingZone ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  editingZone ? "Update Zone" : "Save Zone"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-orange-900">Zone-Based Estimates</h4>
          <p className="text-orange-700/80 text-sm font-medium leading-relaxed">
            Customers will only be able to place orders if their address matches an <strong>Active</strong> zone. 
            Delivery fees defined here will be added to the gas refill estimate shown on the customer app.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            <p className="mt-4 text-zinc-500 font-bold italic tracking-tight">Mapping your territory...</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Map className="w-16 h-16 text-zinc-200 mb-4" />
            <p className="text-zinc-500 font-bold">No zones defined yet.</p>
            <p className="text-zinc-400 text-sm">Expand your business by adding your first delivery area.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Zone Name</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Description</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Delivery Fee</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {zones.map((zone) => (
                  <tr key={zone.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-zinc-900">{zone.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-500 font-medium">{zone.description || "—"}</td>
                    <td className="px-8 py-6 font-bold text-zinc-900">GH₵ {(zone.deliveryFee / 100).toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleStatus(zone)}
                        className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all hover:scale-105 ${
                          zone.active ? "text-green-600" : "text-zinc-400"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${zone.active ? "bg-green-600 animate-pulse" : "bg-zinc-300"}`} />
                        {zone.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                       <button 
                         onClick={() => handleEdit(zone)}
                         className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(zone.id)}
                         className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
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
