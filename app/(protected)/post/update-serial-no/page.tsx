"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Loader2,
    Shield,
    Calendar,
    FileText,
    AlertCircle,
    CheckCircle,
    Lock
} from "lucide-react";

export default function UpdateSerialPage() {
    const [gd, setGd] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newSerial, setNewSerial] = useState("");
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Hardcoded post for Trichy Junction
    const userPost = "Trichy Junction";

    useEffect(() => {
        fetchTodayGD();
    }, []);

    const fetchTodayGD = async () => {
        try {
            setLoading(true);
            // Targeted fetch for the active register
            const res = await axios.get(`/api/gd/get-entry?post=${userPost}`);
            if (res.data.success && res.data.data) {
                setGd(res.data.data);
                // If a serial already exists, populate it and lock the UI
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
                post: userPost,
                pageSerialNo: parseInt(newSerial),
            });

            if (res.data.success) {
                setMessage({
                    type: "success",
                    text: "Official Serial Number has been authenticated and locked."
                });
                setGd({ ...gd, pageSerialNo: parseInt(newSerial) });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Internal system error occurred."
            });
        } finally {
            setUpdating(false);
        }
    };

    // Determine if the record is already locked
    const isLocked = gd?.pageSerialNo !== 0 && gd?.pageSerialNo !== undefined;

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-slate-400" size={32} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Verifying Register Status...</span>
            </div>
        </div>
    );

    if (!gd) return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
            <AlertCircle size={40} className="text-slate-300 mb-4" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">No Active Register</h2>
            <p className="text-xs text-slate-500 mt-1 uppercase">Today's register for {userPost} has not been started.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col items-center py-20 px-4">
            <div className="w-full max-w-xl">

                {/* Formal Header Section */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-10">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Serial Authentication</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Railway Protection Force • Official Record Management
                        </p>
                    </div>
                    {isLocked ? <Lock size={28} className="text-emerald-600" /> : <Shield size={32} className="text-slate-900" />}
                </div>

                {/* Info Grid - System Metadata */}
                <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 mb-10">
                    <div className="bg-white p-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Posting Station</span>
                        <p className="text-sm font-bold uppercase">{gd.post}</p>
                    </div>
                    <div className="bg-white p-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Diary Date</span>
                        <p className="text-sm font-bold uppercase flex items-center gap-2">
                            <Calendar size={14} /> {new Date(gd.diaryDate).toLocaleDateString('en-GB')}
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleUpdate} className={`space-y-8 p-8 border ${isLocked ? 'bg-emerald-50/30 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-700">
                                Assigned Page Serial No
                            </label>
                            {isLocked ? <CheckCircle size={16} className="text-emerald-500" /> : <FileText size={16} className="text-slate-400" />}
                        </div>
                        <input
                            type="number"
                            required
                            disabled={isLocked}
                            value={newSerial}
                            onChange={(e) => setNewSerial(e.target.value)}
                            className={`w-full border px-4 py-4 font-mono text-xl font-bold outline-none transition-all ${isLocked
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 cursor-not-allowed"
                                    : "bg-white border-slate-300 focus:border-slate-900 focus:ring-0"
                                }`}
                            placeholder="Enter 7-digit Serial"
                        />
                    </div>

                    {message && (
                        <div className={`flex items-center gap-3 p-4 border text-[10px] font-black uppercase tracking-widest ${message.type === "success"
                                ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                            {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={updating || isLocked}
                        className={`w-full py-5 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${isLocked
                                ? "bg-emerald-600 text-white cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-black disabled:bg-slate-300"
                            }`}
                    >
                        {isLocked ? (
                            <>Record Locked</>
                        ) : updating ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            "Authenticate Record"
                        )}
                    </button>
                </form>

                {/* Regulatory Footer */}
                <div className="mt-10 pt-6 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-loose text-center italic">
                        Once authenticated, the page serial number becomes a permanent part of the digital log. <br />
                        Tampering with official electronic records is a punishable offense.
                    </p>
                </div>
            </div>
        </div>
    );
}