"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  Loader2,
  ShieldCheck,
  Camera,
  AlertCircle
} from "lucide-react";
import { fetchPartnersByStatus, updatePartnerStatus, deletePartner } from "@/lib/firebase/partners";
import { PartnerStatus } from "@/types/user";
import { Trash2 } from "lucide-react";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PartnerStatus | "all">("pending");
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadPartners = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const data = await fetchPartnersByStatus(activeTab === "all" ? undefined : activeTab);
      setPartners(data);
    } catch (error: any) {
      console.error("Error loading partners:", error);
      setStatus({ type: "error", message: `Failed to load partners: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, [activeTab]);

  const handleAction = async (status: PartnerStatus) => {
    if (!selectedPartner) return;
    if (status === "rejected" && !rejectionReason) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setActionLoading(true);
    setStatus(null);
    try {
      await updatePartnerStatus(selectedPartner.uid, status, status === "rejected" ? rejectionReason : undefined);
      setSelectedPartner(null);
      setRejectionReason("");
      setStatus({ type: "success", message: `Partner ${status === "active" ? "approved" : "rejected"} successfully!` });
      loadPartners();
      setTimeout(() => setStatus(null), 3000);
    } catch (error: any) {
      console.error("Error updating partner status:", error);
      setStatus({ type: "error", message: `Operation failed: ${error.message}` });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Rider Network</h1>
          <p className="text-zinc-500 font-medium">Manage and verify delivery personnel applications.</p>
        </div>
        <button 
          onClick={async () => {
            if (!window.confirm("CRITICAL: This will permanently delete ALL riders from the system. This action cannot be undone. Proceed?")) return;
            setActionLoading(true);
            try {
              const allRiders = await fetchPartnersByStatus();
              for (const rider of allRiders) {
                await deletePartner(rider.uid);
              }
              loadPartners();
              setStatus({ type: "success", message: `Successfully purged ${allRiders.length} riders from the system.` });
            } catch (error: any) {
              setStatus({ type: "error", message: `Purge failed: ${error.message}` });
            } finally {
              setActionLoading(false);
            }
          }}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
          Purge All Riders
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <p className="font-bold text-sm tracking-tight">{status.message}</p>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-3xl border border-zinc-100 shadow-sm">
        <div className="flex p-1 bg-zinc-50 rounded-2xl w-full md:w-auto">
          {["pending", "active", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" 
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search partners..." 
            className="w-full bg-zinc-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
          />
        </div>
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            <p className="mt-4 text-zinc-500 font-bold italic tracking-tight">Syncing network...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="w-16 h-16 text-zinc-200 mb-4" />
            <p className="text-zinc-500 font-bold">No partners found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Partner Info</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Bike Details</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Applied On</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {partners.map((partner) => (
                  <tr key={partner.uid} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-400">
                          {partner.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-zinc-900">{partner.name}</p>
                          <p className="text-sm text-zinc-500 font-medium">{partner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-zinc-900">{partner.verificationDocs?.bikeModel || "N/A"}</p>
                      <p className="text-xs text-zinc-400 font-black uppercase tracking-widest">{partner.verificationDocs?.bikeRegNumber || "No Reg"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={partner.status} />
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-zinc-500">
                        {partner.createdAt ? new Date(partner.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedPartner(partner)}
                        className="p-3 bg-zinc-100 rounded-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-95"
                        title="Review Documents"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (!window.confirm(`Delete ${partner.name} permanently?`)) return;
                          setActionLoading(true);
                          try {
                            await deletePartner(partner.uid);
                            loadPartners();
                            setStatus({ type: "success", message: "Partner deleted." });
                          } catch (e: any) {
                            setStatus({ type: "error", message: e.message });
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                        title="Delete Partner"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black">
                    {selectedPartner.name?.substring(0, 2).toUpperCase()}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Verify Rider: {selectedPartner.name}</h3>
                    <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">{selectedPartner.email}</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedPartner(null)}
                className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-zinc-200 transition-all"
              >
                <XCircle className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Document Comparison Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-orange-600" />
                      Primary Documents
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                      <DocItem label="ID Document" url={selectedPartner.verificationDocs?.idDocumentUrl} />
                      <DocItem label="Driver's License" url={selectedPartner.verificationDocs?.licenseUrl} />
                   </div>
                   
                   <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Residential Address</h4>
                      <p className="font-bold text-zinc-900 leading-relaxed">{selectedPartner.verificationDocs?.residentialAddress || "Address not provided"}</p>
                      <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase">Bike Model</p>
                            <p className="text-xs font-bold text-zinc-900">{selectedPartner.verificationDocs?.bikeModel}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase">Registration</p>
                            <p className="text-xs font-bold text-zinc-900">{selectedPartner.verificationDocs?.bikeRegNumber}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-600" />
                      Facial Verification
                   </h4>
                   <div className="aspect-square bg-zinc-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl relative group">
                      {selectedPartner.verificationDocs?.facialPhotoUrl ? (
                         <>
                            <img 
                              src={selectedPartner.verificationDocs.facialPhotoUrl} 
                              alt="Facial Verification" 
                              className="w-full h-full object-cover" 
                            />
                            <a 
                              href={selectedPartner.verificationDocs.facialPhotoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black uppercase tracking-widest text-xs gap-2"
                            >
                               <Eye className="w-5 h-5" />
                               Full View
                            </a>
                         </>
                      ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                            <Camera className="w-10 h-10 mb-2 opacity-20" />
                            <span className="text-[10px] font-black uppercase">No photo uploaded</span>
                         </div>
                      )}
                   </div>
                </div>
              </div>

              {/* Rejection Form */}
              {activeTab !== "active" && (
                <div className="space-y-4 pt-6 border-t border-zinc-100">
                   <label className="text-sm font-black text-zinc-900 uppercase tracking-widest px-1">Rejection Reason (Required if rejecting)</label>
                   <textarea 
                     placeholder="Tell the rider why they were rejected..."
                     className="w-full bg-zinc-50 border-none rounded-3xl p-6 font-medium text-zinc-900 h-32 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-inner"
                     value={rejectionReason}
                     onChange={(e) => setRejectionReason(e.target.value)}
                   />
                </div>
              )}
            </div>

            <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex gap-4">
              <button 
                disabled={actionLoading}
                onClick={() => handleAction("rejected")}
                className="flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-red-600 border-2 border-red-100 hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reject Rider</>}
              </button>
              <button 
                disabled={actionLoading}
                onClick={() => handleAction("active")}
                className="flex-[2] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm bg-zinc-900 text-white shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Approve Rider</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PartnerStatus }) {
  const configs = {
    pending: { icon: Clock, color: "text-amber-600 bg-amber-50", label: "Pending" },
    active: { icon: CheckCircle2, color: "text-green-600 bg-green-50", label: "Active" },
    rejected: { icon: XCircle, color: "text-red-600 bg-red-50", label: "Rejected" },
  };

  const config = configs[status] || configs.pending;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${config.color}`}>
      <config.icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

function DocItem({ label, url }: { label: string, url?: string }) {
  return (
    <div className="relative aspect-[4/3] bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-200 group">
       {url ? (
         <>
           <img src={url} alt={label} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{label}</span>
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="p-3 bg-white text-zinc-900 rounded-2xl hover:scale-110 transition-transform shadow-xl"
              >
                <Eye className="w-5 h-5" />
              </a>
           </div>
         </>
       ) : (
         <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
           <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
           <span className="text-[10px] font-black uppercase">No Document</span>
         </div>
       )}
    </div>
  );
}
