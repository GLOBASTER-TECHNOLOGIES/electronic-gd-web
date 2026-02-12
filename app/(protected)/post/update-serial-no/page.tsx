"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    FileText,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Lock,
    Calendar,
    MapPin,
    Hash
} from "lucide-react";

function UpdateSerialForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get("id");

    const [gd, setGd] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newSerial, setNewSerial] = useState("");
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (postId) fetchTodayGD();
    }, [postId]);

    const fetchTodayGD = async () => {
        try {
            setLoading(true);
            const postRes = await axios.get(`/api/post/get-post-data`, { params: { id: postId } });
            if (!postRes.data.success || !postRes.data.data) {
                setLoading(false);
                return;
            }
            const postCode = postRes.data.data.postCode;
            const res = await axios.get(`/api/gd/get-entry`, { params: { postCode } });

            if (res.data.success && res.data.data) {
                setGd(res.data.data);
                if (res.data.data.pageSerialNo) {
                    setNewSerial(res.data.data.pageSerialNo.toString());
                }
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setMessage(null);
        try {
            const res = await axios.patch("/api/gd/add-serial-no", {
                postCode: gd.postCode,
                pageSerialNo: parseInt(newSerial),
            });
            if (res.data.success) {
                setMessage({ type: "success", text: "Serial number authenticated and locked." });
                setGd({ ...gd, pageSerialNo: parseInt(newSerial) });
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to update record." });
        } finally {
            setUpdating(false);
        }
    };

    const isLocked = gd?.pageSerialNo !== 0 && gd?.pageSerialNo !== undefined;

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium animate-pulse">Retrieving Ledger Data...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-12">
            {/* STICKY HEADER */}
            <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()} 
                        className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <div className="p-2 rounded-full group-hover:bg-slate-100 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="text-sm font-semibold">Back to Dashboard</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-indigo-600" size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Secure Portal</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-xl mx-auto px-4 mt-8">
                {!gd ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm mt-10">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No Active Register</h3>
                        <p className="text-slate-500 text-sm mt-1">There is no General Diary entry found for today.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* MAIN CARD */}
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                            <MapPin size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Reporting Post</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                            {gd.post}
                                        </h2>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1.5 shadow-sm border ${
                                        isLocked 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                        : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                    }`}>
                                        {isLocked ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                        {isLocked ? 'Record Locked' : 'Pending Entry'}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar size={14} />
                                        <span className="text-xs font-medium">{new Date(gd.diaryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 border-l border-slate-200 pl-4">
                                        <FileText size={14} />
                                        <span className="text-xs font-medium uppercase tracking-wider">{gd.postCode}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                        <Hash size={14} className="text-indigo-500" />
                                        Official Page Serial Number
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            required
                                            disabled={isLocked}
                                            value={newSerial}
                                            onChange={(e) => setNewSerial(e.target.value)}
                                            placeholder="Enter serial number"
                                            className={`w-full p-5 text-3xl font-mono font-bold rounded-xl outline-none transition-all border-2 ${
                                                isLocked 
                                                ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
                                                : "bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                                            }`}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic ml-1">
                                        Note: This number must correspond with the physical register book.
                                    </p>
                                </div>

                                {message && (
                                    <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 ${
                                        message.type === "success" 
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                                        : "bg-red-50 border-red-100 text-red-800"
                                    }`}>
                                        {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        <p className="text-xs font-bold uppercase tracking-wide">{message.text}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={updating || isLocked}
                                    className={`w-full p-5 rounded-xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-md ${
                                        isLocked
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                        : "bg-slate-900 text-white hover:bg-black hover:shadow-lg shadow-slate-200"
                                    }`}
                                >
                                    {isLocked ? (
                                        <><Lock size={18} /> Record Authenticated</>
                                    ) : updating ? (
                                        <><Loader2 className="animate-spin" size={18} /> Updating Ledger...</>
                                    ) : (
                                        "Authenticate Serial No."
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <div className="flex gap-3">
                                <ShieldCheck className="text-amber-600 shrink-0" size={18} />
                                <p className="text-[10px] text-amber-800 font-bold uppercase leading-relaxed tracking-wide">
                                    Warning: Once a serial number is authenticated, the digital record is locked to maintain the integrity of the General Diary. Contact the administrator for corrections.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function UpdateSerialPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        }>
            <UpdateSerialForm />
        </Suspense>
    );
}