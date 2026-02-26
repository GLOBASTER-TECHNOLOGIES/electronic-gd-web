"use client";

import React, { useEffect, useState } from "react";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    ChevronDown,
    MapPin,
    Clock,
    User,
    Copy,
    AlertTriangle,
    FileSignature,
    ArrowLeft,
} from "lucide-react";

// ✅ 1. UPDATED INTERFACE: Added the parent IDs needed for the API payload
interface ICorrection {
    _id: string;             // The specific log ID (inside the history array)
    containerId: string;     // The parent GdCorrection document ID
    dailyGDId: string;       // The General Diary document ID
    originalEntryId: string; // The specific entry ID inside the GD
    entryNo: number;
    postCode: string;
    diaryDate: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reason: string;
    requestedBy: {
        name: string;
        rank: string;
        forceNumber: string;
    };
    previousData: {
        abstract: string;
        details: string;
    };
    newData: {
        abstract: string;
        details: string;
    };
    createdAt: string;
}

export default function CorrectionRequestsPage() {
    const [corrections, setCorrections] = useState<ICorrection[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // ✅ 2. NEW STATE: Track which button is currently processing
    const [processingAction, setProcessingAction] = useState<{ id: string, action: 'APPROVE' | 'REJECT' } | null>(null);

    useEffect(() => {
        fetchCorrections();
        setExpandedId(null); // Close expanded view when switching tabs
    }, [statusFilter]);

    const fetchCorrections = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/gd/correction-list?status=${statusFilter}`
            );
            const result = await res.json();
            if (result.success) {
                setCorrections(result.data);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ 3. UPDATED HANDLERS: Accept full object and send correct payload
    // ✅ Hit the unified processing route
    const handleApprove = async (correction: ICorrection) => {
        if (!window.confirm("Are you sure you want to approve this correction? This will permanently alter the official diary entry.")) return;

        setProcessingAction({ id: correction._id, action: 'APPROVE' });
        try {
            const res = await fetch("/api/gd/process", { // 👈 Unified route
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "APPROVE", // 👈 Tell backend what to do
                    containerId: correction.containerId,
                    logId: correction._id,
                    dailyGDId: correction.dailyGDId,
                    originalEntryId: correction.originalEntryId
                }),
            });
            const data = await res.json();

            if (data.success) fetchCorrections();
            else alert(data.error || "Failed to approve correction.");
        } catch (error) {
            console.error("Approval Error:", error);
        } finally {
            setProcessingAction(null);
        }
    };

    const handleReject = async (correction: ICorrection) => {
        if (!window.confirm("Are you sure you want to reject this correction request?")) return;

        setProcessingAction({ id: correction._id, action: 'REJECT' });
        try {
            const res = await fetch("/api/gd/process", { // 👈 Unified route
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "REJECT", // 👈 Tell backend what to do
                    containerId: correction.containerId,
                    logId: correction._id,
                    dailyGDId: correction.dailyGDId,
                    originalEntryId: correction.originalEntryId
                }),
            });
            const data = await res.json();

            if (data.success) fetchCorrections();
            else alert(data.error || "Failed to reject correction.");
        } catch (error) {
            console.error("Rejection Error:", error);
        } finally {
            setProcessingAction(null);
        }
    };

    const statusStyles = {
        PENDING: "border-amber-400 text-amber-700 bg-amber-50",
        APPROVED: "border-emerald-400 text-emerald-700 bg-emerald-50",
        REJECTED: "border-red-400 text-red-700 bg-red-50",
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-6 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-medium tracking-tight text-slate-900">
                            Correction Requests
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Review and manage General Diary correction submissions
                        </p>
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-slate-300 bg-white px-4 py-2 rounded-md text-sm font-medium shadow-sm focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
                    >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                ) : corrections.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-xl border border-dashed border-slate-300">
                        No {statusFilter.toLowerCase()} correction requests found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {corrections.map((correction) => {
                            const isExpanded = expandedId === correction._id;

                            // --- EXPANDED VIEW ---
                            if (isExpanded) {
                                return (
                                    <div key={correction._id} className="bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden animate-in fade-in duration-200">

                                        {/* Dark Header */}
                                        <div className="bg-[#0f172a] text-white border-t-[6px] border-amber-500 p-6 flex justify-between items-start">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-xl font-bold tracking-wide uppercase">
                                                        General Diary Correction
                                                    </h2>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold tracking-widest uppercase">
                                                    <span>Form 24-B • Electronic Record Amendment</span>
                                                    <button
                                                        onClick={() => setExpandedId(null)}
                                                        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                                                    >
                                                        <ArrowLeft className="w-3 h-3" /> Change Entry
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black text-amber-500">#{correction.entryNo}</div>
                                                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Entry Serial No.</div>
                                            </div>
                                        </div>

                                        {/* Meta Info Bar */}
                                        <div className="flex items-center gap-6 px-6 py-4 bg-white border-b border-slate-200 text-sm text-slate-600 font-medium border-t-4 border-t-amber-500/20">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                <span className="font-bold text-slate-900">{correction.postCode}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {new Date(correction.diaryDate).toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-500">Original:</span> <span className="font-bold text-slate-900">{correction.requestedBy?.rank} {correction.requestedBy?.name}</span>
                                            </div>
                                        </div>

                                        {/* Split Workspace */}
                                        <div className="flex flex-col md:flex-row relative">
                                            {/* Left: Original */}
                                            <div className="w-full md:w-1/2 bg-slate-50 p-8 border-r border-slate-200">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Original Record</h3>
                                                    <button className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
                                                        <Copy className="w-3 h-3" /> Restore
                                                    </button>
                                                </div>
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Subject / Abstract</label>
                                                        <div className="font-mono text-sm bg-slate-100 p-4 rounded-md border border-slate-200 text-slate-500 min-h-[50px]">
                                                            {correction.previousData?.abstract}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Detailed Entry</label>
                                                        <div className="font-mono text-sm bg-slate-100 p-4 rounded-md border border-slate-200 text-slate-500 min-h-[160px] whitespace-pre-wrap">
                                                            {correction.previousData?.details}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            {/* Right: Amendment */}
                                            <div className="w-full md:w-1/2 p-8 bg-white">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Amendment Data</h3>
                                                    {correction.status === "PENDING" && (
                                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                            Active Edit
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Revised Subject</label>
                                                        <div className="font-medium text-sm p-4 rounded-md border border-slate-300 text-slate-900 min-h-[50px]">
                                                            {correction.newData?.abstract}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Revised Details</label>
                                                        <div className="font-medium text-sm p-4 rounded-md border border-slate-300 text-slate-900 min-h-[160px] whitespace-pre-wrap">
                                                            {correction.newData?.details}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reason for Amendment */}
                                        <div className="p-8 bg-white border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                                                    Reason for Amendment <span className="text-red-500">*</span>
                                                </h3>
                                            </div>
                                            <div className="w-full text-sm p-4 rounded-md border border-slate-300 text-slate-700 bg-slate-50 min-h-[80px]">
                                                {correction.reason}
                                            </div>
                                        </div>

                                        {/* Administrative Control */}
                                        <div className="p-8 bg-white border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-6">
                                                <FileSignature className="w-4 h-4 text-slate-400" />
                                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Administrative Control</h3>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Requested By</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <input readOnly value={correction.requestedBy?.rank || ""} className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-600 outline-none" placeholder="Rank" />
                                                        <input readOnly value={correction.requestedBy?.name || ""} className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-600 outline-none" placeholder="Name" />
                                                        <input readOnly value={correction.requestedBy?.forceNumber || ""} className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-600 outline-none" placeholder="Force No" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Forwarded By (Admin)</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <input readOnly className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-600 outline-none" placeholder="Rank" />
                                                        <input readOnly className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-600 outline-none" placeholder="Name" />
                                                        <input readOnly className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-600 outline-none" placeholder="Force No" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="bg-white p-6 flex flex-col sm:flex-row justify-end items-center border-t border-slate-200 gap-4">
                                            <div className="flex gap-4 w-full sm:w-auto">
                                                <button
                                                    onClick={() => setExpandedId(null)}
                                                    className="flex-1 sm:flex-none px-6 py-2.5 bg-white text-slate-700 text-sm font-semibold hover:text-slate-900 transition-colors"
                                                    disabled={!!processingAction}
                                                >
                                                    Close
                                                </button>

                                                {/* ✅ 4. CONDITIONALLY RENDER BUTTONS & ADD LOADING STATES */}
                                                {correction.status === "PENDING" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleReject(correction)}
                                                            disabled={!!processingAction}
                                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-red-300 hover:bg-red-50 text-red-600 text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
                                                        >
                                                            {processingAction?.id === correction._id && processingAction?.action === 'REJECT' ? (
                                                                <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting...</>
                                                            ) : (
                                                                <><XCircle className="w-4 h-4" /> Reject</>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(correction)}
                                                            disabled={!!processingAction}
                                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-emerald-300 hover:bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
                                                        >
                                                            {processingAction?.id === correction._id && processingAction?.action === 'APPROVE' ? (
                                                                <><Loader2 className="w-4 h-4 animate-spin" /> Approving...</>
                                                            ) : (
                                                                <><CheckCircle2 className="w-4 h-4" /> Approve</>
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                );
                            }

                            // --- COLLAPSED VIEW ---
                            return (
                                <div
                                    key={correction._id}
                                    onClick={() => setExpandedId(correction._id)}
                                    className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all flex justify-between group"
                                >
                                    {/* Left Side Info */}
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-sm font-bold text-slate-900">
                                                Entry #{correction.entryNo}
                                            </span>
                                            <span className="text-sm text-slate-400">
                                                {new Date(correction.diaryDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="text-sm text-slate-700">
                                            <span className="font-bold">Post:</span> {correction.postCode}
                                        </div>

                                        <div className="text-sm text-slate-700 line-clamp-1 max-w-xl">
                                            <span className="font-bold">Reason:</span> {correction.reason}
                                        </div>

                                        <div className="text-sm text-slate-400 pt-1">
                                            Requested by {correction.requestedBy?.name || "Unknown"} ({correction.requestedBy?.rank || "N/A"})
                                        </div>
                                    </div>

                                    {/* Right Side Controls */}
                                    <div className="flex flex-col items-end justify-between">
                                        <ChevronDown className="text-slate-400 group-hover:text-slate-600 transition-colors w-5 h-5" />
                                        <span
                                            className={`px-3 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wide ${statusStyles[correction.status]}`}
                                        >
                                            {correction.status}
                                        </span>
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