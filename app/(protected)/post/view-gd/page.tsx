"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Download,
  Shield,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { generateGDPDF } from "@/config/gdPdfGenerator";

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

export default function SingleGDViewPage() {
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

        setLoading(true);
        setError(null);

        const response = await axios.get("/api/gd/get-entry", {
          params: {
            postCode: postCode,
          },
        });

        if (response.data.success && response.data.data) {
          setGd(response.data.data);
        } else {
          setError("No General Diary found for this post.");
        }
      } catch (error) {
        console.error("GD Fetch Error:", error);
        setError("Failed to load register.");
      } finally {
        setLoading(false);
      }
    };

    fetchGD();
  }, [postCode]);

  const handleDownloadPDF = () => {
    if (!gd) return;

    // We map the fields here so they match the PDF generator's "GDData" interface
    const safeGD = {
      ...gd,
      post: gd.postName || gd.postCode, // 🔥 Maps your API field to what the generator expects
      entries: gd.entries.map((entry) => ({
        ...entry,
        abstract: entry.abstract ?? "",
        details: entry.details ?? "",
        signature: {
          ...entry.signature,
          // Ensure post is set for the signature block in the PDF
          post: entry.signature.postCode || gd.postCode
        }
      })),
    };

    generateGDPDF(safeGD);
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Fetching Register...
        </p>
      </div>
    );

  if (error || !gd)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">
          Unable to Load Data
        </h2>
        <p className="text-center mt-2 max-w-xs">
          {error || "The register does not exist."}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-bold"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto bg-white shadow-md border border-gray-200 min-h-[11in]">
        <div className="bg-[#1a233a] text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm font-bold uppercase"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1">
                भारतीय रेल / INDIAN RAILWAYS
              </p>

              <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
                General Diary
              </h1>

              <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
                <span className="flex items-center gap-2">
                  <Shield size={16} /> {gd.division}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin size={16} /> {gd.postName}
                </span>

                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(gd.diaryDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider"
              >
                <Download size={16} /> Export Official PDF
              </button>

              <div className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Serial No
                </p>
                <p className="text-2xl font-mono font-black text-white">
                  {gd.pageSerialNo}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="py-4 pr-4 w-24">Time</th>
                <th className="py-4 px-2 w-16 text-center">No.</th>
                <th className="py-4 px-4 w-1/4">Abstract</th>
                <th className="py-4 px-4">Details</th>
                <th className="py-4 pl-4 w-48 text-right">Signature</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {gd.entries.map((entry) => (
                <tr key={entry._id}>
                  <td className="py-5 pr-4 font-mono text-xs font-bold text-gray-500">
                    {new Date(entry.timeOfSubmission).toLocaleTimeString(
                      "en-IN",
                      { hour: "2-digit", minute: "2-digit", hour12: false }
                    )}
                  </td>

                  <td className="py-5 px-2 text-center font-black">
                    {entry.entryNo}
                  </td>

                  <td className="py-5 px-4 font-bold uppercase text-blue-900 text-xs">
                    {entry.abstract}
                  </td>

                  <td className="py-5 px-4 whitespace-pre-wrap">
                    {entry.details}
                  </td>

                  <td className="py-5 pl-4 text-right">
                    <p className="font-bold text-xs uppercase">
                      {entry.signature?.officerName}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {entry.signature?.forceNumber}
                    </p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">
                      {entry.signature?.postCode}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
