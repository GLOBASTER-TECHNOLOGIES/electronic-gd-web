"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Download, Shield, Calendar, MapPin } from "lucide-react";
import { generateGDPDF } from "@/config/gdPdfGenerator";

// ✅ STRICT TYPES: Removed all references to postName or post
interface Entry {
    _id: string;
    entryNo: number;
    timeOfSubmission: string;
    abstract?: string;
    details?: string;
    signature: {
        officerName: string;
        rank: string;
        postCode: string; 
        forceNumber: string;
    };
}

interface GDData {
    _id: string;
    division: string;
    postCode: string; 
    diaryDate: string;
    pageSerialNo: number;
    entries: Entry[];
}

export default function SingleGDViewPage() {
    const { id } = useParams();
    const router = useRouter();
    const [gd, setGd] = useState<GDData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGD = async () => {
            try {
                const res = await axios.get(`/api/gd/get-entry?id=${id}`);
                if (res.data.success) {
                    setGd(res.data.data);
                }
            } catch (err) {
                alert("Failed to load register details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchGD();
    }, [id]);

    const handleDownloadPDF = () => {
        if (!gd) return;

        const safeGD = {
            ...gd,
            // 🔒 Send ONLY postCode to the PDF generator
            // (Passed as 'post' too, just in case your PDF Generator script still looks for that key)
            post: gd.postCode, 
            postCode: gd.postCode,

            entries: gd.entries.map((entry) => ({
                ...entry,
                abstract: entry.abstract ?? "",
                details: entry.details ?? "",

                signature: {
                    ...entry.signature,
                    // 🔒 Ensure PDF only gets the postCode for the signature
                    post: entry.signature.postCode, 
                    postCode: entry.signature.postCode
                }
            })),
        };

        generateGDPDF(safeGD);
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );

    if (!gd)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
                <p>Register not found.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Go Back
                </button>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-900">
            <div className="max-w-5xl mx-auto bg-white shadow-md border border-gray-200 min-h-[11in]">

                {/* HEADER */}
                <div className="bg-[#1a233a] text-white p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm font-bold uppercase transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Dashboard
                            </button>

                            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
                                General Diary Register
                            </h1>

                            <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
                                <span className="flex items-center gap-2">
                                    <Shield size={16} /> {gd.division} Division
                                </span>
                                {/* ✅ Updated to postCode */}
                                <span className="flex items-center gap-2">
                                    <MapPin size={16} /> {gd.postCode}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} />{" "}
                                    {new Date(gd.diaryDate).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <button
                                onClick={handleDownloadPDF}
                                className="bg-white text-black px-4 py-2 rounded font-bold uppercase text-xs tracking-wider hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg"
                            >
                                <Download size={16} /> Download Official PDF
                            </button>

                            <div className="mt-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    Page Serial No
                                </p>
                                <p className="text-xl font-mono font-bold">
                                    {gd.pageSerialNo || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="p-8">
                    <div className="bg-yellow-50 border border-yellow-200 p-3 mb-6 text-xs text-yellow-800 font-bold uppercase tracking-wide text-center">
                        Preview Mode • Click Download to get the Official Form Format
                    </div>

                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black text-xs font-black uppercase tracking-wider">
                                <th className="py-3 pr-4 w-24 align-top">Time</th>
                                <th className="py-3 px-2 w-16 align-top">Entry No</th>
                                <th className="py-3 px-4 w-1/4 align-top">Abstract</th>
                                <th className="py-3 px-4 align-top">Details of Occurrence</th>
                                <th className="py-3 pl-4 w-48 align-top">Officer Signature</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {gd.entries.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-12 text-center text-gray-400 font-bold uppercase italic"
                                    >
                                        No entries recorded in this register.
                                    </td>
                                </tr>
                            ) : (
                                gd.entries.map((entry) => (
                                    <tr key={entry._id}>
                                        <td className="py-4 pr-4 font-mono text-xs font-bold text-gray-600 align-top">
                                            {new Date(entry.timeOfSubmission).toLocaleTimeString(
                                                "en-IN",
                                                { hour: "2-digit", minute: "2-digit", hour12: false }
                                            )}
                                        </td>

                                        <td className="py-4 px-2 font-black text-gray-900 align-top">
                                            {entry.entryNo}
                                        </td>

                                        <td className="py-4 px-4 font-bold uppercase text-gray-800 text-xs align-top">
                                            {entry.abstract || (
                                                <span className="text-red-400 italic">
                                                    Missing Data
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-4 px-4 text-gray-800 font-serif text-sm leading-relaxed align-top whitespace-pre-wrap">
                                            {entry.details || (
                                                <span className="text-gray-400 italic">
                                                    No details recorded...
                                                </span>
                                            )}
                                        </td>

                                        {/* SIGNATURE COLUMN */}
                                        <td className="py-4 pl-4 align-top">
                                            <div className="flex flex-col leading-tight gap-1">
                                                <span className="font-bold text-xs uppercase text-black">
                                                    {entry.signature?.officerName}
                                                </span>

                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    {entry.signature?.rank}
                                                </span>

                                                {/* ✅ Only Post Code Displayed Here */}
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                    Post Code: {entry.signature?.postCode}
                                                </span>

                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Force No: {entry.signature?.forceNumber}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-gray-50 border-t border-gray-200 p-8 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        End of Digital Record • Generated by RPF E-GD System
                    </p>
                </div>
            </div>
        </div>
    );
}