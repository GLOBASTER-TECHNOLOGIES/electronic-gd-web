"use client";

import React, { useState } from "react";
import {
  Shield, Search, Calendar, Hash, MapPin, Loader2, AlertTriangle, ArrowRightLeft,
  Copy, FileBadge, Fingerprint, CheckCircle2, Clock, User, ArrowLeft
} from "lucide-react";

/* =================================================================================
   1. SHARED TYPES
   ================================================================================= */
interface IGDEntry {
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

interface IGDDocument {
  _id: string;
  postCode: string;
  diaryDate: string;
  entries: IGDEntry[];
}

interface IFormData {
  abstract: string;
  details: string;
  reason: string;
}

interface IAdminData {
  reqName: string;
  reqRank: string;
  reqForceNo: string;
  appName: string;
  appRank: string;
  appForceNo: string;
}

/* =================================================================================
   2. SUB-COMPONENTS
   ================================================================================= */

/* --- COMPONENT: Search View --- */
const SearchConsole = ({
  loading,
  error,
  searchParams,
  setSearchParams,
  onSearch
}: {
  loading: boolean;
  error: string;
  searchParams: any;
  setSearchParams: (v: any) => void;
  onSearch: (e: React.FormEvent) => void;
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white shadow-xl rounded-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-6 text-center border-b-4 border-yellow-500">
          <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">GD Correction Console</h1>
          <p className="text-slate-400 text-xs mt-1">Authorized Personnel Only</p>
        </div>

        <form onSubmit={onSearch} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-1.5">
              <MapPin className="w-3 h-3" /> Station / Post Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NDLS-MAIN"
              value={searchParams.station}
              onChange={(e) => setSearchParams({ ...searchParams, station: e.target.value.toUpperCase() })}
              className="w-full p-3 border border-slate-300 rounded text-sm outline-none focus:border-slate-500 font-bold text-slate-900 placeholder-slate-300 uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-1.5">
                <Calendar className="w-3 h-3" /> GD Date
              </label>
              <input
                type="date"
                required
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded text-sm outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-1.5">
                <Hash className="w-3 h-3" /> Entry No.
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 42"
                value={searchParams.entryNo}
                onChange={(e) => setSearchParams({ ...searchParams, entryNo: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded text-sm outline-none focus:border-slate-500 font-mono"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !searchParams.station || !searchParams.entryNo}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Searching Database..." : "Locate Entry"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* --- COMPONENT: Header --- */
const CorrectionHeader = ({ entryNo, onBack }: { entryNo: number, onBack: () => void }) => (
  <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-start border-b-4 border-yellow-500">
    <div>
      <h1 className="text-xl font-bold tracking-wide uppercase flex items-center gap-2">
        <Shield className="w-5 h-5 text-yellow-500" />
        General Diary Correction
      </h1>
      <div className="flex items-center gap-3 mt-1">
        <p className="text-slate-400 text-xs uppercase tracking-wider">
          Form 24-B • Electronic Record Amendment
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Change Entry
        </button>
      </div>
    </div>
    <div className="text-right">
      <div className="text-2xl font-mono font-bold text-yellow-400">#{entryNo}</div>
      <div className="text-xs text-slate-400">Entry Serial No.</div>
    </div>
  </div>
);

/* --- COMPONENT: Metadata Strip --- */
const EntryMetadata = ({ postCode, entryTime, diaryDate, signature }: {
  postCode: string,
  entryTime: string,
  diaryDate: string,
  signature: any
}) => (
  <div className="bg-slate-50 border-b border-gray-200 px-8 py-3 flex flex-wrap gap-6 text-sm">
    <div className="flex items-center gap-2 text-gray-600">
      <MapPin className="w-4 h-4 text-gray-400" />
      <span className="font-semibold text-gray-900">{postCode}</span>
    </div>
    <div className="flex items-center gap-2 text-gray-600">
      <Clock className="w-4 h-4 text-gray-400" />
      <span>{new Date(entryTime).toLocaleTimeString()} • {new Date(diaryDate).toLocaleDateString()}</span>
    </div>
    <div className="flex items-center gap-2 text-gray-600">
      <User className="w-4 h-4 text-gray-400" />
      <span>Original: <span className="font-semibold text-gray-900">{signature.rank} {signature.officerName}</span></span>
    </div>
  </div>
);

/* --- COMPONENT: Workspace (Split View) --- */
const CorrectionWorkspace = ({
  original,
  formData,
  setFormData,
  onRestore
}: {
  original: IGDEntry,
  formData: IFormData,
  setFormData: (d: any) => void,
  onRestore: () => void
}) => {
  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* LEFT: ORIGINAL */}
      <div className="w-full md:w-5/12 bg-gray-50/80 p-6 border-r border-gray-200 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Original Record</h3>
          <button type="button" onClick={onRestore} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors">
            <Copy className="w-3 h-3" /> Restore
          </button>
        </div>
        <div className="space-y-6 select-none opacity-80">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Subject / Abstract</label>
            <div className="font-mono text-sm bg-gray-100 p-3 rounded border border-gray-200 text-gray-700">{original.abstract}</div>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Detailed Entry</label>
            <div className="font-mono text-sm bg-gray-100 p-3 rounded border border-gray-200 text-gray-700 min-h-[200px] whitespace-pre-wrap leading-relaxed">{original.details}</div>
          </div>
        </div>
      </div>

      {/* CENTER ARROW */}
      <div className="hidden md:flex flex-col justify-center items-center w-12 bg-white -ml-6 z-10">
        <div className="bg-slate-900 text-white rounded-full p-2 shadow-lg border-4 border-white">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
      </div>

      {/* RIGHT: CORRECTION */}
      <div className="w-full md:w-7/12 p-6 bg-white">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Amendment Data</h3>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">ACTIVE EDIT</span>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Revised Subject</label>
            <input
              type="text"
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className="w-full text-sm font-semibold text-slate-900 border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Revised Details</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full text-sm leading-relaxed text-slate-900 border border-slate-300 rounded-md p-3 min-h-[200px] focus:ring-2 focus:ring-slate-900 outline-none transition-all resize-none font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- COMPONENT: Footer & Auth --- */
const AuthorizationFooter = ({
  formData,
  setFormData,
  adminData,
  setAdminData,
  isSubmitting,
  entryId,
  onCancel,
  onSubmit
}: {
  formData: IFormData,
  setFormData: (d: any) => void,
  adminData: IAdminData,
  setAdminData: (d: any) => void,
  isSubmitting: boolean,
  entryId: string,
  onCancel: () => void,
  onSubmit: (e: React.FormEvent) => void
}) => {
  return (
    <div className="bg-gray-50 border-t border-gray-200 p-6 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* REASON */}
        <div className="flex flex-col">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-2">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Reason for Amendment <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="State official reason (e.g. Typographical Error, Factual Update)..."
            className="w-full flex-1 text-sm border border-gray-300 rounded-md p-3 focus:border-amber-500 outline-none h-32"
          />
        </div>

        {/* ADMIN PROTOTYPE INPUTS */}
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <FileBadge className="w-3 h-3" /> Administrative Control (Prototype)
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 text-[10px] font-bold text-slate-500">REQUESTED BY</div>
              <input type="text" placeholder="Rank" value={adminData.reqRank} onChange={e => setAdminData({ ...adminData, reqRank: e.target.value })} className="text-xs p-2 border rounded" />
              <input type="text" placeholder="Name" value={adminData.reqName} onChange={e => setAdminData({ ...adminData, reqName: e.target.value })} className="col-span-2 text-xs p-2 border rounded" />
              <input type="text" placeholder="Force No" value={adminData.reqForceNo} onChange={e => setAdminData({ ...adminData, reqForceNo: e.target.value })} className="col-span-3 text-xs p-2 border rounded bg-slate-50" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 text-[10px] font-bold text-slate-500 mt-1">APPROVED BY (ADMIN)</div>
              <input type="text" placeholder="Rank" value={adminData.appRank} onChange={e => setAdminData({ ...adminData, appRank: e.target.value })} className="text-xs p-2 border rounded" />
              <input type="text" placeholder="Name" value={adminData.appName} onChange={e => setAdminData({ ...adminData, appName: e.target.value })} className="col-span-2 text-xs p-2 border rounded" />
              <input type="text" placeholder="Force No" value={adminData.appForceNo} onChange={e => setAdminData({ ...adminData, appForceNo: e.target.value })} className="col-span-3 text-xs p-2 border rounded bg-slate-50" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-[10px] text-gray-400 flex items-center gap-1">
          <Fingerprint className="w-3 h-3" /> Ref: {entryId}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || formData.reason.length < 5}
            className="px-8 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Sign & Update GD
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


/* =================================================================================
   3. MAIN PAGE CONTAINER
   ================================================================================= */
const CorrectionPage = () => {
  const [view, setView] = useState<"SEARCH" | "CORRECT">("SEARCH");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useState({
    station: "",
    date: new Date().toISOString().split('T')[0],
    entryNo: ""
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

  // --- LOGIC: SEARCH ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.entryNo || !searchParams.station) return;

    setLoading(true);
    setError("");

    try {
      // Calling your EXISTING route
      const query = new URLSearchParams({
        postCode: searchParams.station,
        date: searchParams.date
      }).toString();

      const res = await fetch(`/api/gd/get-entry?${query}`);

      // Safety check: is the response actually JSON?
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server did not return JSON. Check API route.");
      }

      const result = await res.json();

      if (!result.success) throw new Error(result.message || "Failed to fetch");

      // ✅ Handle CASE 2 where data might be null (GD not created yet)
      if (!result.data) {
        throw new Error(`No General Diary found for ${searchParams.station} on this date.`);
      }

      const gdDoc: IGDDocument = result.data;
      const targetEntryNo = parseInt(searchParams.entryNo);

      // Find the entry inside the document
      const foundEntry = gdDoc.entries.find((e) => e.entryNo === targetEntryNo);

      if (!foundEntry) {
        throw new Error(`Entry #${targetEntryNo} does not exist in this GD.`);
      }

      // Success
      setParentGD(gdDoc);
      setSelectedEntry(foundEntry);
      setFormData({
        abstract: foundEntry.abstract,
        details: foundEntry.details,
        reason: ""
      });
      setView("CORRECT");

    } catch (err: any) {
      setError(err.message);
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: SUBMIT ---
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
          details: formData.details
        },
        reason: formData.reason,
        requestedBy: {
          name: adminData.reqName,
          rank: adminData.reqRank,
          forceNumber: adminData.reqForceNo,
          officerId: "65c4a7f0e5b9c02d12345678"
        },
        approvedBy: {
          name: adminData.appName,
          rank: adminData.appRank,
          forceNumber: adminData.appForceNo,
          officerId: "65c4a7f0e5b9c02d87654321",
        }
      };

      const res = await fetch("/api/gd/update-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
    setFormData(prev => ({ ...prev, abstract: selectedEntry.abstract, details: selectedEntry.details }));
  };

  // --- RENDER ---
  if (view === "SEARCH") {
    return <SearchConsole
      loading={loading}
      error={error}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      onSearch={handleSearch}
    />;
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
};

export default CorrectionPage;