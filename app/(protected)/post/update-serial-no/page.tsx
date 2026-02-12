"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    FileText,
    Shield,
    CheckCircle,
    AlertCircle,
    Loader2,
    Lock
} from "lucide-react";

// --- 1. THE MAIN LOGIC COMPONENT ---
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
            const res = await axios.get(`/api/gd/get-entry?postId=${postId}`);
            if (res.data.success && res.data.data) {
                setGd(res.data.data);
                if (res.data.data.pageSerialNo && res.data.data.pageSerialNo !== 0) {
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
                postId: postId,
                pageSerialNo: parseInt(newSerial),
            });

            if (res.data.success) {
                setMessage({ type: "success", text: "Authenticated successfully." });
                setGd({ ...gd, pageSerialNo: parseInt(newSerial) });
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to update." });
        } finally {
            setUpdating(false);
        }
    };

    const isLocked = gd?.pageSerialNo !== 0 && gd?.pageSerialNo !== undefined;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-slate-900" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* COMPACT NAV */}
            <div className="bg-slate-900 text-white p-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity">
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                    <h1 className="text-sm font-bold uppercase tracking-widest">Register Management</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 mt-4">
                {!gd ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-xl">
                        <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-sm font-bold text-slate-500 uppercase">No Active Register Today</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* STATION INFO - FLAT LIST */}
                        <div className="border-b border-slate-100 pb-6 flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">{gd.post}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Official Diary • {new Date(gd.diaryDate).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                <p className={`text-xs font-bold uppercase ${isLocked ? 'text-emerald-600' : 'text-amber-500'}`}>
                                    {isLocked ? 'Locked' : 'Awaiting Serial'}
                                </p>
                            </div>
                        </div>

                        {/* SIMPLE FORM */}
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    Official Page Serial Number
                                </label>
                                <input
                                    type="number"
                                    required
                                    disabled={isLocked}
                                    value={newSerial}
                                    onChange={(e) => setNewSerial(e.target.value)}
                                    placeholder="0000000"
                                    className={`w-full p-4 text-xl font-bold border rounded-lg focus:outline-none transition-all ${isLocked ? "bg-slate-50 border-slate-100 text-slate-400" : "bg-white border-slate-200 focus:border-slate-900"
                                        }`}
                                />
                            </div>

                            {message && (
                                <p className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                    }`}>
                                    {message.text}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={updating || isLocked}
                                className={`w-full p-4 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${isLocked
                                        ? "bg-slate-100 text-slate-300"
                                        : "bg-slate-900 text-white hover:bg-black"
                                    }`}
                            >
                                {isLocked ? <><Lock size={14} /> Record Authenticated</> : updating ? "Processing..." : "Update Serial No."}
                            </button>
                        </form>

                        <p className="text-[9px] text-slate-300 font-bold uppercase text-center leading-relaxed italic">
                            Official digital entry must match the physical register book.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 2. THE EXPORTED PAGE WITH SUSPENSE BOUNDARY ---
export default function UpdateSerialPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-slate-900" size={32} />
            </div>
        }>
            <UpdateSerialForm />
        </Suspense>
    );
}