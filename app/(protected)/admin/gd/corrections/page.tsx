"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Clock, AlertCircle } from "lucide-react";

// --- Types ---
interface ICorrection {
  _id: string;
  entryNo: number;
  postCode: string;
  diaryDate: string;
  correctedAt: string;
  correctionType: "EDIT" | "DELETE" | "LATE_ENTRY";
  reason: string;
  previousData: {
    abstract?: string;
    details?: string;
  };
  newData: {
    abstract?: string;
    details?: string;
  };
  requestedBy: {
    name: string;
    rank: string;
    forceNumber: string;
  };
  approvedBy: {
    name: string;
    rank: string;
    forceNumber: string;
    approvedAt: string;
  };
}

function GDCorrectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("gdId");

  const [corrections, setCorrections] = useState<ICorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchCorrections();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCorrections = async () => {
    try {
      const res = await axios.get(`/api/gd/correction?dailyGDId=${id}`);
      setCorrections(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load correction logs.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-800" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12 px-4">
        <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 text-red-900 rounded-lg">
          <div className="flex items-center gap-2 font-bold mb-2">
            <AlertCircle size={20} />
            <span>Error Loading Data</span>
          </div>
          <p className="text-sm">{error}</p>
          <button onClick={() => router.back()} className="mt-4 text-sm font-medium underline text-red-700 hover:text-red-900">
            Return to Master Viewer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">

        {/* --- PAGE HEADER --- */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Back to Master Viewer
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-300 pb-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Audit Log</h1>
              <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-bold">General Diary Modifications</p>
            </div>
            {id && (
              <div className="md:text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Reference ID</p>
                {/* Removed .toUpperCase() to keep original DB format */}
                <p className="text-sm font-mono bg-white border border-gray-300 px-3 py-1.5 rounded shadow-sm text-gray-700">
                  {id}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- EMPTY STATES --- */}
        {!id && (
          <div className="bg-white p-10 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="font-bold text-gray-800 text-lg">No Register Selected</p>
            <p className="text-sm text-gray-500 mt-2">Please select a specific General Diary entry to inspect its audit trail.</p>
          </div>
        )}

        {id && corrections.length === 0 && (
          <div className="bg-white p-10 rounded-lg border border-gray-200 text-center shadow-sm">
            <p className="font-bold text-gray-800 text-lg">Record is Pristine</p>
            <p className="text-sm text-gray-500 mt-2">This General Diary has not been altered since its original creation.</p>
          </div>
        )}

        {/* --- AUDIT LOG CARDS --- */}
        {id && corrections.length > 0 && (
          <div className="space-y-6">
            {corrections.map((log) => {
              const isDelete = log.correctionType === "DELETE";

              return (
                <div key={log._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                  {/* Card Header */}
                  <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded ${isDelete ? "bg-red-100 text-red-800 border border-red-200" : "bg-black text-white"
                        }`}>
                        {log.correctionType}
                      </span>
                      <h2 className="text-lg font-bold text-gray-900">Entry #{log.entryNo}</h2>
                    </div>
                    <div className="text-sm text-gray-600 font-medium flex items-center gap-1.5 bg-white px-3 py-1 rounded border border-gray-200">
                      <Clock size={14} className="text-gray-400" />
                      {formatDate(log.correctedAt)}
                    </div>
                  </div>

                  {/* Reason Section */}
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Reason for Modification</h3>
                    <p className="text-sm text-gray-800">{log.reason}</p>
                  </div>

                  {/* Before & After Data Comparison */}
                  {log.correctionType !== "LATE_ENTRY" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">

                      {/* Original State */}
                      <div className="p-6 bg-red-50/30">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest mb-4">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span> Original Data (Overwritten)
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Abstract</span>
                            <div className="bg-white border border-gray-200 p-3 rounded text-sm text-gray-700 min-h-[3rem]">
                              {log.previousData?.abstract || "N/A"}
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Details</span>
                            <div className="bg-white border border-gray-200 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap min-h-[5rem]">
                              {log.previousData?.details || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Updated State */}
                      <div className="p-6 bg-green-50/30">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-widest mb-4">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span> Current Data (Active)
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Abstract</span>
                            <div className="bg-white border border-green-200 p-3 rounded text-sm text-gray-900 font-medium min-h-[3rem]">
                              {log.newData?.abstract || "N/A"}
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Details</span>
                            <div className="bg-white border border-green-200 p-3 rounded text-sm text-gray-900 font-medium whitespace-pre-wrap min-h-[5rem]">
                              {log.newData?.details || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Chain of Custody Footer */}
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col md:flex-row gap-8 md:gap-16">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Requested By</span>
                      <p className="text-sm font-bold text-gray-900">{log.requestedBy?.rank} {log.requestedBy?.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {log.requestedBy?.forceNumber}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Authorized By</span>
                      <p className="text-sm font-bold text-gray-900">{log.approvedBy?.rank} {log.approvedBy?.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {log.approvedBy?.forceNumber}</p>
                      {log.approvedBy?.approvedAt && (
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5">
                          Signed: {formatDate(log.approvedBy.approvedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Export ---
export default function GDCorrectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-800" size={32} />
      </div>
    }>
      <GDCorrectionsContent />
    </Suspense>
  );
}