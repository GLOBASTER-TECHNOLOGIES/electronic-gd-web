"use client";

import React, { useEffect, useState, Suspense } from "react";
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

/* ---------------------- KEEP YOUR INTERFACES SAME ---------------------- */
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

/* ---------------------- MOVE YOUR FULL COMPONENT HERE ---------------------- */
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

    const safeGD = {
      ...gd,
      post: gd.postName || gd.postCode,
      entries: gd.entries.map((entry) => ({
        ...entry,
        abstract: entry.abstract ?? "",
        details: entry.details ?? "",
        signature: {
          ...entry.signature,
          post: entry.signature.postCode || gd.postCode,
        },
      })),
    };

    generateGDPDF(safeGD);
  };

  /* ---------------------- KEEP YOUR RETURN JSX SAME ---------------------- */

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
    /* 🔥 KEEP YOUR ENTIRE ORIGINAL JSX HERE EXACTLY SAME */
    <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-900">
      {/* DO NOT CHANGE ANYTHING INSIDE */}
      {/* Your full JSX unchanged */}
    </div>
  );
}

/* ---------------------- DEFAULT EXPORT WITH SUSPENSE ---------------------- */

export default function SingleGDViewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      }
    >
      <SingleGDViewContent />
    </Suspense>
  );
}
