"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Building2,
    MapPin,
    Phone,
    UserSquare2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Save,
    TrainFront,
    Lock,
    ArrowLeft
} from "lucide-react";

interface UpdatePostFormProps {
    postId: string;
    onCancel: () => void;
    onSuccess: () => void;
}

export default function UpdatePostForm({ postId, onCancel, onSuccess }: UpdatePostFormProps) {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [formData, setFormData] = useState({
        postName: "",
        postCode: "",
        division: "",
        contactNumber: "",
        address: "",
        officerForceId: "",
        password: "", // Only sent if changing
    });

    // Fetch existing data on mount
    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                // 👇 PASS THE ID HERE
                const res = await axios.get(`/api/post/get-post-data?id=${postId}`);

                if (res.data.success) {
                    const data = res.data.data; // Now this is a single object, not an array

                    setFormData({
                        postName: data.postName,
                        postCode: data.postCode,
                        division: data.division,
                        contactNumber: data.contactNumber || "",
                        address: data.address || "",
                        officerForceId: data.officerInCharge?.forceNumber || "",
                        password: "",
                    });
                }
            } catch (err) {
                setMessage({ type: "error", text: "Failed to load post details." });
            } finally {
                setLoading(false);
            }
        };

        if (postId) fetchPostDetails();
    }, [postId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setMessage(null);

        try {
            const res = await axios.patch("/api/post/update-post", { ...formData, id: postId });

            if (res.data.success) {
                setMessage({ type: "success", text: "Station details updated successfully!" });
                setTimeout(onSuccess, 1500); // Return to list after success
            }
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Update failed.",
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Edit Station Details</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase">Updating: {formData.postName} ({formData.postCode})</p>
                </div>
                <button onClick={onCancel} className="flex items-center gap-2 text-xs font-bold uppercase hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">
                    <ArrowLeft size={16} /> Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Main Station Info */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <MapPin size={18} className="text-slate-900" /> Identity & Security
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Post Name</label>
                                    <input
                                        name="postName"
                                        value={formData.postName}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Station Code</label>
                                    <input
                                        name="postCode"
                                        value={formData.postCode}
                                        disabled // Usually code shouldn't change easily
                                        className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-500 cursor-not-allowed uppercase"
                                    />
                                </div>
                            </div>

                            {/* Password Update Field */}
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                                <label className="text-xs font-bold text-amber-800 uppercase flex items-center gap-2">
                                    <Lock size={12} /> Reset Station Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter new password to reset (leave blank to keep current)"
                                    className="w-full p-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                />
                                <p className="text-[10px] text-amber-600 font-medium">Only enter a value here if you want to change the login password.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase">Contact Number</label>
                                <input
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase">Address</label>
                                <textarea
                                    name="address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100">
                            <h3 className="text-sm font-bold uppercase text-blue-800 flex items-center gap-2">
                                <UserSquare2 size={18} /> Officer In-Charge
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase">Force ID</label>
                            <input
                                name="officerForceId"
                                value={formData.officerForceId}
                                onChange={handleChange}
                                placeholder="e.g. 95123"
                                className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 font-mono text-center tracking-widest"
                            />
                            <p className="text-[10px] text-slate-400 text-center">Changing this will re-assign the station commander.</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        {message && (
                            <div className={`p-3 rounded-lg flex gap-2 mb-4 text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            {updating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Changes</>}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}