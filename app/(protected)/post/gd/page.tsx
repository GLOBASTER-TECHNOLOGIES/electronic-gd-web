"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Shield,
    Clock,
    ExternalLink,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    FileText
} from "lucide-react";

// --- Types ---
interface GDRegister {
    _id: string;
    division: string;
    postCode: string; // Ensure backend returns postCode
    postName?: string;
    diaryDate: string;
    pageSerialNo: number;
    entryCount: number;
    hasCorrections: boolean; // Tells us if an entry was updated
}

function PostGDRecordsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const postCode = searchParams.get("postCode");

    const [gds, setGds] = useState<GDRegister[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (postCode) {
            fetchGDs();
        } else {
            setError("No Post Code provided.");
            setLoading(false);
        }
    }, [postCode]);

    const fetchGDs = async () => {
        try {
            setLoading(true);
            // Ensure this backend route returns an array of GD summaries for this specific postCode!
            const res = await axios.get("/api/gd/get-entry", {
                params: { postCode }
            });

            if (res.data.success) {
                setGds(res.data.data);
            } else {
                setError("Failed to load records from the server.");
            }
        } catch (err) {
            console.error("Failed to load registers", err);
            setError("An error occurred while fetching the digital archives.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Navigates to the Single View Page we just built, passing the exact date!
    const handleViewFull = (gd: GDRegister) => {
        const formattedDate = gd.diaryDate.split('T')[0];
        router.push(`/post/view-gd?postCode=${postCode}&date=${formattedDate}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa]">
                <Loader2 className="animate-spin text-[#181f32] mb-4" size={48} />
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
                    Loading Archives...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-20">

            {/* --- HEADER SECTION --- */}
            <div className="bg-[#181f32] text-white pt-8 pb-12 px-6 md:px-12 shadow-lg">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
                            GD Digital Archives
                        </h1>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Shield size={16} className="text-yellow-500" />
                            Station Unit: {postCode}
                        </p>
                    </div>

                    <div className="text-left md:text-right bg-[#2a344a] p-4 rounded border border-[#3b455e]">
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Total Registers on File</span>
                        <span className="text-3xl font-black text-white">{gds.length}</span>
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="max-w-5xl mx-auto mt-8 px-4 md:px-8 space-y-6">

                {error ? (
                    <div className="bg-white border border-red-200 p-8 text-center text-red-500 shadow-sm rounded-lg mt-8">
                        <AlertTriangle className="mx-auto mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                        <p className="text-sm">{error}</p>
                    </div>
                ) : gds.length === 0 ? (
                    <div className="bg-white border border-gray-200 p-16 text-center text-gray-400 shadow-sm rounded-lg mt-8">
                        <Calendar className="mx-auto mb-4 opacity-20" size={64} />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No Archives Found</h2>
                        <p className="text-sm uppercase tracking-wide">No historical GD records exist for this station yet.</p>
                    </div>
                ) : (
                    /* List of Registers */
                    <div className="space-y-4">
                        {gds.map((gd) => (
                            <div key={gd._id} className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg transition-all hover:shadow-md hover:border-gray-400">
                                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">

                                    {/* Left Side: Date & Info */}
                                    <div className="flex items-center gap-6">
                                        {/* Date Badge */}
                                        <div className="text-center bg-gray-50 p-3 rounded border border-gray-100 min-w-[80px] group-hover:bg-[#181f32] group-hover:text-white transition-colors">
                                            <span className="block text-xs font-bold text-gray-400 group-hover:text-gray-300 uppercase">
                                                {new Date(gd.diaryDate).toLocaleDateString('en-GB', { month: 'short' })}
                                            </span>
                                            <span className="block text-2xl font-black text-gray-800 group-hover:text-white leading-none my-0.5">
                                                {new Date(gd.diaryDate).getDate()}
                                            </span>
                                            <span className="block text-[10px] font-bold text-gray-400 group-hover:text-gray-300 uppercase">
                                                {new Date(gd.diaryDate).getFullYear()}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded">
                                                    {gd.division || "SR"}
                                                </span>

                                                {/* Corrections Indicator */}
                                                {gd.hasCorrections && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-widest rounded">
                                                        <AlertTriangle size={10} /> Updated
                                                    </span>
                                                )}

                                                <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900 ml-1">
                                                    {gd.postName || postCode}
                                                </h2>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <FileText size={14} className="text-gray-400" /> Serial: {gd.pageSerialNo}
                                                </span>
                                                <span className="flex items-center gap-1 border-l border-gray-200 pl-4">
                                                    <Clock size={14} className="text-gray-400" /> {gd.entryCount} Entries Logged
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Area */}
                                    <div className="w-full md:w-auto mt-4 md:mt-0">
                                        <button
                                            onClick={() => handleViewFull(gd)}
                                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#181f32] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-800 transition-colors shadow-sm"
                                        >
                                            Open Register <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Wrapper for useSearchParams
export default function PostGDRecordsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                    <Loader2 className="animate-spin text-[#181f32]" size={48} />
                </div>
            }
        >
            <PostGDRecordsContent />
        </Suspense>
    );
}