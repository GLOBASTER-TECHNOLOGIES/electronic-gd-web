"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchConsole, { ISearchParamsState } from "@/components/post/SearchConsole";
import CorrectionHeader from "@/components/post/CorrectionHeader";
import EntryMetadata from "@/components/post/EntryMetadata";
import CorrectionWorkspace, { IFormData } from "@/components/post/CorrectionWorkspace";
import AuthorizationFooter, { IAdminData } from "@/components/post/AuthorizationFooter";

/* =================================================================================
   DATABASE TYPES
================================================================================= */

export interface IGDEntry {
  _id: string;
  entryNo: number;
  entryTime: string;
  abstract: string;
  details: string;
  signature: {
    officerName: string;
    rank: string;
    forceNumber: string;
  };
}

export interface IGDDocument {
  _id: string;
  postCode: string;
  diaryDate: string;
  entries: IGDEntry[];
}

/* =================================================================================
   DEFAULT EXPORT WITH SUSPENSE WRAPPER
================================================================================= */

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CorrectionPageClient />
    </Suspense>
  );
}

/* =================================================================================
   CLIENT COMPONENT (All Logic Here)
================================================================================= */

function CorrectionPageClient() {
  const urlParams = useSearchParams();
  const postCodeFromUrl = urlParams.get("postCode") || "";

  const [view, setView] = useState<"SEARCH" | "CORRECT">("SEARCH");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useState<ISearchParamsState>({
    station: postCodeFromUrl,
    date: new Date().toISOString().split("T")[0],
    entryNo: "",
  });

  const [selectedEntry, setSelectedEntry] = useState<IGDEntry | null>(null);
  const [parentGD, setParentGD] = useState<IGDDocument | null>(null);

  const [formData, setFormData] = useState<IFormData>({
    abstract: "",
    details: "",
    reason: "",
  });

  const [adminData, setAdminData] = useState<IAdminData>({
    reqName: "Insp. Vikram Singh",
    reqRank: "SHO",
    reqForceNo: "DL-8821",
    appName: "DCP Amit Kumar",
    appRank: "DCP",
    appForceNo: "DL-0551",
  });

  /* =================================================================================
     SEARCH LOGIC
  ================================================================================= */

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.entryNo) return;

    if (!postCodeFromUrl) {
      setError("No Post Code found in URL. Please navigate from dashboard.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        postCode: postCodeFromUrl,
        date: searchParams.date,
        mode: "post",
      }).toString();

      const res = await fetch(`/api/gd/get-entry?${query}`);

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON.");
      }

      const result = await res.json();

      if (!result.success) throw new Error(result.message || "Failed to fetch");
      if (!result.data) {
        throw new Error(`No General Diary found for ${postCodeFromUrl} on this date.`);
      }

      const gdDoc: IGDDocument = result.data;
      const targetEntryNo = parseInt(searchParams.entryNo);

      const foundEntry = gdDoc.entries.find(
        (entry) => entry.entryNo === targetEntryNo
      );

      if (!foundEntry) {
        throw new Error(`Entry #${targetEntryNo} does not exist in this GD.`);
      }

      setParentGD(gdDoc);
      setSelectedEntry(foundEntry);

      setFormData({
        abstract: foundEntry.abstract,
        details: foundEntry.details,
        reason: "",
      });

      setView("CORRECT");
    } catch (err: any) {
      setError(err.message);
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* =================================================================================
     SUBMIT LOGIC
  ================================================================================= */

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !parentGD) return;

    setIsSubmitting(true);

    try {
      const payload = {
        originalEntryId: selectedEntry._id,
        dailyGDId: parentGD._id,
        entryNo: selectedEntry.entryNo,
        postCode: parentGD.postCode,
        diaryDate: parentGD.diaryDate,
        newData: {
          abstract: formData.abstract,
          details: formData.details,
        },
        reason: formData.reason,
        requestedBy: {
          name: adminData.reqName,
          rank: adminData.reqRank,
          forceNumber: adminData.reqForceNo,
        },
        approvedBy: {
          name: adminData.appName,
          rank: adminData.appRank,
          forceNumber: adminData.appForceNo,
        },
      };

      const res = await fetch("/api/gd/update-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Correction Failed");
      }

      alert("Correction Signed & Logged Successfully!");

      setView("SEARCH");
      setSearchParams({ ...searchParams, entryNo: "" });
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOriginal = () => {
    if (!selectedEntry) return;

    setFormData((prev) => ({
      ...prev,
      abstract: selectedEntry.abstract,
      details: selectedEntry.details,
    }));
  };

  /* =================================================================================
     RENDER
  ================================================================================= */

  if (view === "SEARCH") {
    return (
      <SearchConsole
        loading={loading}
        error={error}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onSearch={handleSearch}
      />
    );
  }

  if (!selectedEntry || !parentGD) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-5xl bg-white shadow-xl border border-gray-300 rounded-sm overflow-hidden flex flex-col">
        <CorrectionHeader
          entryNo={selectedEntry.entryNo}
          onBack={() => setView("SEARCH")}
        />

        <EntryMetadata
          postCode={parentGD.postCode}
          entryTime={selectedEntry.entryTime}
          diaryDate={parentGD.diaryDate}
          signature={selectedEntry.signature}
        />

        <CorrectionWorkspace
          original={selectedEntry}
          formData={formData}
          setFormData={setFormData}
          onRestore={handleCopyOriginal}
        />

        <AuthorizationFooter
          formData={formData}
          setFormData={setFormData}
          adminData={adminData}
          setAdminData={setAdminData}
          isSubmitting={isSubmitting}
          entryId={selectedEntry._id}
          onCancel={() => setView("SEARCH")}
          onSubmit={handleSubmitCorrection}
        />
      </div>
    </div>
  );
}