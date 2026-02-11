"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Shield, Calendar, Hash, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function UpdateSerialPage() {
    const [gd, setGd] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newSerial, setNewSerial] = useState("");
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Hardcoded post as requested
    const userPost = "TRICHY JUNCTION";

    useEffect(() => {
        fetchTodayGD();
    }, []);

    const fetchTodayGD = async () => {
        try {
            setLoading(true);
            // Targeted fetch for the hardcoded post
            const res = await axios.get(`/api/gd/get-entry?post=${userPost}`);
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
                post: userPost,
                pageSerialNo: parseInt(newSerial),
            });

            if (res.data.success) {
                setMessage({ type: "success", text: "Register serial number updated successfully." });
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

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-slate-400" size={32} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Authenticating Register...</span>
            </div>
        </div>
    );

    if (!gd) return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
            <AlertCircle size={40} className="text-slate-300 mb-4" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">No Active GD</h2>
            <p className="text-xs text-slate-500 mt-1 uppercase">Today's register for {userPost} has not been initiated.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col items-center py-20 px-4">
            <div className="w-full max-w-xl">
                
                {/* Formal Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-10">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Serial Authentication</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Railway Protection Force • Digital Record Management
                        </p>
                    </div>
                    <Shield size={32} className="text-slate-900" />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 mb-10">
                    <div className="bg-white p-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Deployment Station</span>
                        <p className="text-sm font-bold uppercase">{gd.post}</p>
                    </div>
                    <div className="bg-white p-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Register Date</span>
                        <p className="text-sm font-bold uppercase flex items-center gap-2">
                            <Calendar size={14} /> {new Date(gd.diaryDate).toLocaleDateString('en-GB')}
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleUpdate} className="space-y-8 bg-slate-50 p-8 border border-slate-200">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-700">
                                Assigned Page Serial No
                            </label>
                            <FileText size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="number"
                            required
                            value={newSerial}
                            onChange={(e) => setNewSerial(e.target.value)}
                            className="w-full bg-white border border-slate-300 px-4 py-4 font-mono text-xl font-bold focus:border-slate-900 focus:ring-0 outline-none transition-colors placeholder:text-slate-200"
                            placeholder="Enter 7-digit Serial"
                        />
                    </div>

                    {message && (
                        <div className={`flex items-center gap-3 p-4 border text-[10px] font-black uppercase tracking-widest ${
                            message.type === "success" 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}>
                            {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={updating}
                        className="w-full bg-slate-900 text-white py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all disabled:bg-slate-300 flex items-center justify-center gap-3"
                    >
                        {updating ? <Loader2 className="animate-spin" size={16} /> : "Update Official Record"}
                    </button>
                </form>

                {/* Compliance Footer */}
                <div className="mt-10 pt-6 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-loose text-center">
                        This update is governed by digital auditing standards. <br />
                        Updating previous records is strictly prohibited by system architecture.
                    </p>
                </div>
            </div>
        </div>
    );
}