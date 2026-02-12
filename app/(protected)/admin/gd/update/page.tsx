"use client";

import React, { useState } from "react";
import { 
  Shield, 
  Search, 
  ArrowRight, 
  Calendar, 
  Hash, 
  MapPin, 
  Loader2,
  AlertTriangle,
  ArrowRightLeft,
  Copy,
  FileBadge,
  Fingerprint,
  CheckCircle2,
  Clock,
  User,
  ArrowLeft
} from "lucide-react";

/* =============================
   TYPES
============================= */
interface IGDEntry {
  _id: string;
  entryNo: number;
  station: string;
  diaryDate: string;
  entryTime: string;
  abstract: string;
  details: string;
  signature: {
    officerName: string;
    rank: string;
    forceNumber: string;
  };
}

const CorrectionPage = () => {
  // VIEW STATE: 'SEARCH' | 'CORRECT'
  const [view, setView] = useState<"SEARCH" | "CORRECT">("SEARCH");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SEARCH INPUTS
  const [searchParams, setSearchParams] = useState({
    station: "", // Empty by default now
    date: new Date().toISOString().split('T')[0], // Today
    entryNo: ""
  });

  // DATA STATE
  const [data, setData] = useState<IGDEntry | null>(null);
  
  // CORRECTION FORM STATE
  const [formData, setFormData] = useState({
    abstract: "",
    details: "",
    reason: "",
  });

  // ADMIN AUTH STATE (PROTOTYPE)
  const [adminData, setAdminData] = useState({
    reqName: "Insp. Vikram Singh",
    reqRank: "SHO",
    reqForceNo: "DL-8821",
    appName: "DCP Amit Kumar",
    appRank: "DCP",
    appForceNo: "DL-0551",
  });

  // ==========================================
  // HANDLER: STEP 1 -> SEARCH ENTRY
  // ==========================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(!searchParams.entryNo || !searchParams.station) return;

    setLoading(true);

    // SIMULATE API CALL
    setTimeout(() => {
      // Create a mock entry based on WHAT THE USER SEARCHED
      const mockFoundEntry: IGDEntry = {
        _id: "65c_MOCK_ID_" + Math.random().toString(36).substr(2, 5),
        entryNo: parseInt(searchParams.entryNo),
        station: searchParams.station, // Uses the text input value
        diaryDate: searchParams.date,
        entryTime: "14:30", 
        abstract: "Routine Patrol Report (Mock Data)",
        details: `This is a simulated entry for testing. The user searched for Entry #${searchParams.entryNo} at Post ${searchParams.station}.\n\nOriginal content: Patrol started at 0800 hrs. Area checked. No suspicious activity observed.`,
        signature: { 
            officerName: "V. Sharma", 
            rank: "ASI", 
            forceNumber: "882100" 
        }
      };

      setData(mockFoundEntry);
      
      // Pre-fill the correction form
      setFormData({
        abstract: mockFoundEntry.abstract,
        details: mockFoundEntry.details,
        reason: ""
      });

      setLoading(false);
      setView("CORRECT"); // SWITCH TO UPDATE UI
    }, 1000);
  };

  // ==========================================
  // HANDLER: STEP 2 -> SUBMIT CORRECTION
  // ==========================================
  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
        originalEntryId: data?._id,
        dailyGDId: "MOCK_GD_ID_ABC",
        entryNo: data?.entryNo,
        postCode: data?.station,
        diaryDate: data?.diaryDate,
        correctedAt: new Date(),
        correctionType: "EDIT",
        previousData: {
            abstract: data?.abstract,
            details: data?.details,
            signature: data?.signature
        },
        newData: {
            abstract: formData.abstract,
            details: formData.details
        },
        reason: formData.reason,
        requestedBy: {
            name: adminData.reqName,
            rank: adminData.reqRank,
            forceNumber: adminData.reqForceNo,
            officerId: "MOCK_OFFICER_ID_1" 
        },
        approvedBy: {
            name: adminData.appName,
            rank: adminData.appRank,
            forceNumber: adminData.appForceNo,
            officerId: "MOCK_OFFICER_ID_2",
            approvedAt: new Date()
        }
    };

    console.log("🚀 SUBMITTING PAYLOAD:", payload);

    setTimeout(() => {
        alert("Correction Logged Successfully! (Check Console)");
        setIsSubmitting(false);
        // Optionally reset: setView("SEARCH");
    }, 1500);
  };

  const handleCopyOriginal = () => {
    if (!data) return;
    setFormData(prev => ({ ...prev, abstract: data.abstract, details: data.details }));
  };

  // ==========================================
  // VIEW 1: SEARCH INTERFACE
  // ==========================================
  if (view === "SEARCH") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        
        <div className="w-full max-w-md bg-white shadow-xl rounded-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-center border-b-4 border-yellow-500">
                <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h1 className="text-xl font-bold text-white uppercase tracking-wider">GD Correction Console</h1>
                <p className="text-slate-400 text-xs mt-1">Authorized Personnel Only</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSearch} className="p-8 space-y-5">
                
                {/* STATION INPUT (Text Input Now) */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-1.5">
                        <MapPin className="w-3 h-3" /> Station / Post Code
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. NDLS-MAIN"
                        value={searchParams.station}
                        // Auto-uppercase for better UX
                        onChange={(e) => setSearchParams({...searchParams, station: e.target.value.toUpperCase()})}
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
                            onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
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
                            onChange={(e) => setSearchParams({...searchParams, entryNo: e.target.value})}
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
                    {loading ? "Retrieving Record..." : "Locate Entry"}
                </button>

                <div className="text-[10px] text-center text-slate-400 pt-2">
                    Action logged: IP 192.168.1.44
                </div>
            </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: CORRECTION INTERFACE (The Official Ledger)
  // ==========================================
  if (!data) return null; // Should not happen

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans text-gray-800 flex justify-center">
      
      <form onSubmit={handleSubmitCorrection} className="w-full max-w-5xl bg-white shadow-xl border border-gray-300 rounded-sm overflow-hidden flex flex-col">
        
        {/* 1. HEADER */}
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
                    onClick={() => setView("SEARCH")}
                    className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-white flex items-center gap-1"
                >
                    <ArrowLeft className="w-3 h-3" /> Change Entry
                </button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-yellow-400">#{data.entryNo}</div>
            <div className="text-xs text-slate-400">Entry Serial No.</div>
          </div>
        </div>

        {/* 2. METADATA STRIP (Populated from Search) */}
        <div className="bg-slate-50 border-b border-gray-200 px-8 py-3 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{data.station}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{data.diaryDate} • {data.entryTime} hrs</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>Original Signatory: <span className="font-semibold text-gray-900">{data.signature.rank} {data.signature.officerName}</span></span>
          </div>
        </div>

        {/* 3. THE WORKSPACE (SPLIT VIEW) */}
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* LEFT: ORIGINAL (READ ONLY) */}
          <div className="w-full md:w-5/12 bg-gray-50/80 p-6 border-r border-gray-200 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Original Record
              </h3>
              <button 
                type="button"
                onClick={handleCopyOriginal}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                title="Reset to original text"
              >
                <Copy className="w-3 h-3" /> Restore
              </button>
            </div>

            <div className="space-y-6 select-none opacity-80">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Subject / Abstract</label>
                <div className="font-mono text-sm bg-gray-100 p-3 rounded border border-gray-200 text-gray-700">
                  {data.abstract}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Detailed Entry</label>
                <div className="font-mono text-sm bg-gray-100 p-3 rounded border border-gray-200 text-gray-700 min-h-[200px] whitespace-pre-wrap leading-relaxed">
                  {data.details}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: ARROW */}
          <div className="hidden md:flex flex-col justify-center items-center w-12 bg-white -ml-6 z-10">
            <div className="bg-slate-900 text-white rounded-full p-2 shadow-lg border-4 border-white">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>

          {/* RIGHT: CORRECTION (EDITABLE) */}
          <div className="w-full md:w-7/12 p-6 bg-white">
            <div className="flex items-center gap-2 mb-6">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                Amendment Data
               </h3>
               <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">ACTIVE EDIT</span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Revised Subject</label>
                <input
                  type="text"
                  value={formData.abstract}
                  onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                  className="w-full text-sm font-semibold text-slate-900 border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Revised Details</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  className="w-full text-sm leading-relaxed text-slate-900 border border-slate-300 rounded-md p-3 min-h-[200px] focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all resize-none font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. FOOTER: REASON & AUTH */}
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
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="State official reason (e.g. Typographical Error, Factual Update)..."
                    className="w-full flex-1 text-sm border border-gray-300 rounded-md p-3 focus:border-amber-500 outline-none h-32"
                />
             </div>

             {/* PROTOTYPE MANUAL ADMIN PANEL */}
             <div className="bg-white border border-slate-200 rounded-md p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <FileBadge className="w-3 h-3" /> Administrative Control (Prototype)
                </h4>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-3 text-[10px] font-bold text-slate-500">REQUESTED BY</div>
                        <input type="text" placeholder="Rank" value={adminData.reqRank} onChange={e=>setAdminData({...adminData, reqRank: e.target.value})} className="text-xs p-2 border rounded" />
                        <input type="text" placeholder="Name" value={adminData.reqName} onChange={e=>setAdminData({...adminData, reqName: e.target.value})} className="col-span-2 text-xs p-2 border rounded" />
                        <input type="text" placeholder="Force No" value={adminData.reqForceNo} onChange={e=>setAdminData({...adminData, reqForceNo: e.target.value})} className="col-span-3 text-xs p-2 border rounded bg-slate-50" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-3 text-[10px] font-bold text-slate-500 mt-1">APPROVED BY (ADMIN)</div>
                        <input type="text" placeholder="Rank" value={adminData.appRank} onChange={e=>setAdminData({...adminData, appRank: e.target.value})} className="text-xs p-2 border rounded" />
                        <input type="text" placeholder="Name" value={adminData.appName} onChange={e=>setAdminData({...adminData, appName: e.target.value})} className="col-span-2 text-xs p-2 border rounded" />
                        <input type="text" placeholder="Force No" value={adminData.appForceNo} onChange={e=>setAdminData({...adminData, appForceNo: e.target.value})} className="col-span-3 text-xs p-2 border rounded bg-slate-50" />
                    </div>
                </div>
             </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
             <div className="text-[10px] text-gray-400 flex items-center gap-1">
                <Fingerprint className="w-3 h-3" /> 
                System ID: {data._id} • Post: {data.station}
             </div>

             <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setView("SEARCH")}
                  className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
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

      </form>
    </div>
  );
};

export default CorrectionPage;