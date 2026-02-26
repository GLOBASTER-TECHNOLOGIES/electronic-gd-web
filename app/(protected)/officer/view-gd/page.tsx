"use client";

import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Download,
  Shield,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";
// import { generateGDPDF } from "@/config/gdPdfGenerator"; // Uncomment when ready

interface Entry {
  _id: string;
  entryNo: number;
  timeOfSubmission: string;
  abstract?: string;
  details?: string;
  signature: {
    officerName: string;
    rank: string;
    postCode: string;
    forceNumber: string;
  };
}

interface GDData {
  _id: string;
  division: string;
  postName: string;
  postCode: string;
  diaryDate: string;
  pageSerialNo: number;
  entries: Entry[];
}

function SingleGDViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postCode = searchParams.get("postCode");

  const [gd, setGd] = useState<GDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGD = async () => {
      try {
        if (!postCode) {
          setError("Post code not provided.");
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/gd/get-entry", {
          params: { postCode },
        });

        if (response.data.success && response.data.data) {
          const data = response.data.data;

          if (Array.isArray(data)) {
            if (data.length === 0) {
              setError("No General Diary found for this post.");
            } else {
              setGd(data[0]); // take latest
            }
          } else {
            setGd(data);
          }
        } else {
          setError("No General Diary found for this post.");
        }
      } catch (err) {
        console.error("GD Fetch Error:", err);
        setError("Failed to load register.");
      } finally {
        setLoading(false);
      }
    };

    fetchGD();
  }, [postCode]);

  // const handleDownloadPDF = () => { ... } // Kept your logic, just commented for now

  // Helper to format time strictly as HH:MM
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Helper to format date like "13 February 2026"
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#181f32] mb-4" size={48} />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Loading Register...
        </p>
      </div>
    );

  if (error || !gd)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600 p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 text-center">Unable to Load Data</h2>
        <p className="text-center mt-2 mb-6 text-sm">{error || "The register does not exist."}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 md:py-2 bg-[#181f32] text-white rounded text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-20">

      {/* --- HEADER SECTION (Dark Navy) --- */}
      <div className="bg-[#181f32] text-white pt-8 pb-12 px-4 md:px-12 relative shadow-lg">
        {/* Top Nav Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        {/* Title & Metadata Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight mb-4 leading-tight">
              General Diary Register
            </h1>
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-6 text-sm text-gray-300 font-medium">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md w-fit">
                <Shield size={16} className="text-gray-400" />
                <span>{gd.division} Division</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md w-fit">
                <MapPin size={16} className="text-gray-400" />
                <span>Post : {gd.postCode}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md w-fit">
                <Calendar size={16} className="text-gray-400" />
                <span>{formatDate(gd.diaryDate)}</span>
              </div>
            </div>
          </div>

          {/* Page Serial Display */}
          <div className="mt-4 md:mt-0 text-left md:text-right w-full md:w-auto border-t md:border-t-0 border-gray-700 pt-4 md:pt-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Page Serial No</p>
            <p className="text-3xl md:text-4xl font-bold text-white tracking-widest leading-none">
              {gd.pageSerialNo}
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-[1400px] mx-auto mt-6 md:mt-8 px-4 md:px-8">

        {/* Empty State */}
        {gd.entries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-400 shadow-sm">
            <FileText className="mx-auto mb-3 opacity-20" size={48} />
            <p className="text-sm font-medium">No entries recorded for this date.</p>
          </div>
        ) : (
          <>
            {/* 📱 MOBILE VIEW: Stacked Cards (Hidden on Medium screens and up) */}
            <div className="md:hidden flex flex-col gap-4">
              {gd.entries.map((entry) => (
                <div key={entry._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Card Header (Time & Entry No) */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Entry No</span>
                      <span className="text-lg font-black text-gray-900">#{entry.entryNo}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</span>
                      <span className="text-sm font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {formatTime(entry.timeOfSubmission)}
                      </span>
                    </div>
                  </div>

                  {/* Card Body (Abstract & Details) */}
                  <div className="p-4 space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Abstract</span>
                      <p className="text-sm font-bold text-gray-800 uppercase">{entry.abstract || "N/A"}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Details of Occurrence</span>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.details || "N/A"}</p>
                    </div>
                  </div>

                  {/* Card Footer (Signature) */}
                  <div className="bg-slate-50 p-4 border-t border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Officer Signature</span>
                    <p className="text-sm font-bold text-gray-900 uppercase">{entry.signature.officerName}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-0.5">{entry.signature.rank}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-gray-400 font-mono uppercase">
                      <span>Post: {entry.signature.postCode || gd.postCode}</span>
                      <span>ID: {entry.signature.forceNumber}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 💻 DESKTOP VIEW: Data Table (Hidden on small screens) */}
            <div className="hidden md:block bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black bg-gray-50">
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-900 w-24">Time</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-900 w-24">Entry No</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-900 w-48">Abstract</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-900">Details of Occurrence</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-900 w-64">Officer Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gd.entries.map((entry) => (
                      <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-5 px-6 text-sm font-mono font-medium text-gray-600 align-top">
                          {formatTime(entry.timeOfSubmission)}
                        </td>
                        <td className="py-5 px-6 text-sm font-bold text-gray-900 align-top">
                          {entry.entryNo}
                        </td>
                        <td className="py-5 px-6 text-sm font-semibold text-gray-800 uppercase align-top">
                          {entry.abstract || "N/A"}
                        </td>
                        <td className="py-5 px-6 text-sm text-gray-700 leading-relaxed align-top whitespace-pre-wrap">
                          {entry.details || "N/A"}
                        </td>
                        <td className="py-5 px-6 align-top">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 uppercase">
                              {entry.signature.officerName}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                              {entry.signature.rank}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase mt-1">
                              Post: {entry.signature.postCode || gd.postCode}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase">
                              Force No: {entry.signature.forceNumber}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* --- FOOTER --- */}
        <div className="mt-8 text-center px-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            End of Digital Record • Generated by RPF E-GD System
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SingleGDViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
          <Loader2 className="animate-spin text-[#181f32]" size={48} />
        </div>
      }
    >
      <SingleGDViewContent />
    </Suspense>
  );
}