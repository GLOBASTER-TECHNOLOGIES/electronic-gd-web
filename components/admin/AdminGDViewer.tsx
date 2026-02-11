"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, ChevronDown, ChevronUp, Shield, Clock, Calendar, AlertCircle } from "lucide-react";

// --- Types ---
interface Entry {
  _id: string;
  entryNo: number;
  entryTime: string;
  timeOfSubmission: string;
  abstract: string;
  details: string;
  signature: {
    officerName: string;
    rank: string;
    post: string;
  };
}

interface GDRegister {
  _id: string;
  division: string;
  post: string;
  diaryDate: string;
  pageSerialNo: number;
  entries: Entry[];
}

export default function AdminGDViewer() {
  const [gds, setGds] = useState<GDRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchGDs();
  }, []);

  const fetchGDs = async () => {
    try {
      // ✅ CHANGED: Use '/api/gd/all' to fetch everything without params
      const res = await axios.get("/api/gd/get-entry");
      setGds(res.data.data);
    } catch (err) {
      console.error("Failed to load registers");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
        <div className="text-right">
            <span className="text-xs font-bold text-gray-400 uppercase block">Total Registers</span>
            <span className="text-2xl font-black">{gds.length}</span>
        </div>
      </div>

      {/* List of Registers */}
      <div className="space-y-4">
        {gds.map((gd) => (
          <div key={gd._id} className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg transition-all hover:shadow-md">
            
            {/* --- REGISTER HEADER (Clickable) --- */}
            <div 
              onClick={() => toggleExpand(gd._id)}
              className="p-6 cursor-pointer flex items-center justify-between group bg-white"
            >
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
                          <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors">
                              {gd.post}
                          </h2>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                         <span className="flex items-center gap-1">
                           <Shield size={12} /> Serial: {gd.pageSerialNo}
                         </span>
                         <span className="flex items-center gap-1">
                           <Clock size={12} /> Entries: {gd.entries.length}
                         </span>
                      </div>
                  </div>
              </div>

              {/* Chevron */}
              <div className="text-gray-300 group-hover:text-black transition-colors">
                  {expandedId === gd._id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
            </div>

            {/* --- ENTRIES TABLE (Expandable) --- */}
            {expandedId === gd._id && (
              <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in slide-in-from-top-2 duration-200">
                  {gd.entries.length === 0 ? (
                      <div className="text-center py-4 text-gray-400 text-xs font-bold uppercase tracking-widest italic">
                          No entries recorded.
                      </div>
                  ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 tracking-wider border-b border-gray-200">
                                  <tr>
                                      <th className="px-4 py-3 w-24">Time</th>
                                      <th className="px-4 py-3 w-16">#</th>
                                      <th className="px-4 py-3 w-1/4">Abstract</th>
                                      <th className="px-4 py-3">Details</th>
                                      <th className="px-4 py-3 w-48">Officer</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {gd.entries.map((entry) => (
                                      <tr key={entry._id} className="hover:bg-blue-50/30 transition-colors">
                                          <td className="px-4 py-3 font-mono text-xs font-medium text-gray-600 whitespace-nowrap align-top">
                                              {new Date(entry.timeOfSubmission).toLocaleTimeString('en-IN', {
                                                  hour: '2-digit', minute: '2-digit', hour12: true
                                              })}
                                          </td>
                                          <td className="px-4 py-3 font-bold text-gray-900 align-top">
                                              {entry.entryNo}
                                          </td>
                                          <td className="px-4 py-3 font-bold uppercase text-gray-800 text-xs align-top">
                                              {entry.abstract}
                                          </td>
                                          <td className="px-4 py-3 text-gray-600 font-serif text-sm align-top leading-relaxed">
                                              {entry.details}
                                          </td>
                                          <td className="px-4 py-3 align-top">
                                              <div className="flex flex-col">
                                                  <span className="font-bold text-xs uppercase text-black">
                                                      {entry.signature.officerName}
                                                  </span>
                                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                      {entry.signature.post}
                                                  </span>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}