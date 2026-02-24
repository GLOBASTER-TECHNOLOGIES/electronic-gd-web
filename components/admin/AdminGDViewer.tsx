"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Clock, ExternalLink, AlertTriangle, Pen } from "lucide-react";

// --- Types ---
interface GDRegister {
  _id: string;
  division: string;
  post: string;
  diaryDate: string;
  pageSerialNo: number;
  entryCount: number;
  hasCorrections: boolean;
}

export default function AdminGDViewer() {
  const router = useRouter();
  const [gds, setGds] = useState<GDRegister[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGDs();
  }, []);

  const fetchGDs = async () => {
    try {
      const res = await axios.get("/api/gd/get-entry");
      setGds(res.data.data);
    } catch (err) {
      console.error("Failed to load registers");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFull = (id: string) => {
    router.push(`/admin/gd/${id}`);
  };

  // ✅ New Global Correction Handler
  const handleGlobalCorrection = () => {
    router.push("/admin/gd/update/");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Component Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Master GD Viewer</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time Station Monitoring</p>
        </div>

        <div className="flex items-center gap-8">
          {/* ✅ Global Make Correction Button */}
          <button
            onClick={handleGlobalCorrection}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-50 hover:text-black transition-colors shadow-sm"
          >
            <Pen size={14} /> Make Correction
          </button>

          {/* Stats */}
          <div className="text-right">
            <span className="text-xs font-bold text-gray-400 uppercase block">Total Registers</span>
            <span className="text-2xl font-black">{gds.length}</span>
          </div>
        </div>
      </div>

      {/* List of Registers */}
      <div className="space-y-4">
        {gds.map((gd) => (
          <div key={gd._id} className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg transition-all hover:shadow-md">

            {/* --- REGISTER CARD --- */}
            <div className="p-6 flex items-center justify-between group bg-white">
              <div className="flex items-center gap-6">
                {/* Date Badge */}
                <div className="text-center bg-gray-50 p-3 rounded border border-gray-100 min-w-[80px]">
                  <span className="block text-xs font-bold text-gray-400 uppercase">
                    {new Date(gd.diaryDate).toLocaleDateString('en-GB', { month: 'short' })}
                  </span>
                  <span className="block text-2xl font-black text-gray-800 leading-none my-0.5">
                    {new Date(gd.diaryDate).getDate()}
                  </span>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">
                    {new Date(gd.diaryDate).getFullYear()}
                  </span>
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded">
                      {gd.division}
                    </span>

                    {/* Corrections Indicator */}
                    {gd.hasCorrections && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-widest rounded">
                        <AlertTriangle size={10} /> Edited
                      </span>
                    )}

                    <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors ml-1">
                      {gd.post}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1">
                      <Shield size={12} /> Serial: {gd.pageSerialNo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Entries: {gd.entryCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Area - Single Button Only */}
              <div>
                <button
                  onClick={() => handleViewFull(gd._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-800 transition-colors"
                >
                  Open Register <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}