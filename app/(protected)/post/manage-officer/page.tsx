"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateOfficerForm from "@/components/admin/CreateOfficerForm";
import OfficerList from "@/components/admin/OfficerList";
import { UserPlus, X } from "lucide-react";

const Page = () => {
    const [showForm, setShowForm] = useState(false);
    const [postCode, setPostCode] = useState<string | null>(null);
    console.log(postCode)

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get("/api/auth/me");

                if (res.data.success && res.data.userType === "POST") {
                    setPostCode(res.data.user.postCode); // 👈 sending postCode
                }
            } catch (err) {
                console.error("Failed to fetch post info");
            }
        };

        fetchPost();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="bg-white border-b-2 border-slate-900 p-6 shadow-sm flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-tight">
                            Officer Management
                        </h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Railway Protection Force • Official Use Only
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border transition-all shadow-sm
                        ${showForm
                                ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white"
                                : "bg-slate-900 text-white border-slate-900 hover:bg-slate-700"
                            }`}
                    >
                        {showForm ? <X size={14} /> : <UserPlus size={14} />}
                        {showForm ? "Close Form" : "Create Officer"}
                    </button>
                </div>

                {/* CREATE OFFICER FORM */}
                {showForm && (
                    <div className="bg-white border border-gray-300 shadow-sm p-6 md:p-8">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">
                            Create New Officer
                        </h2>

                        {/* 👇 Send postCode to form if needed */}
                        <CreateOfficerForm />
                    </div>
                )}

                {/* OFFICER LIST */}
                <div className="bg-white border border-gray-300 shadow-sm p-6 md:p-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">
                        Registered Officers
                    </h2>

                    {/* 👇 Passing postCode as prop */}
                    <OfficerList postCode={postCode} />
                </div>

            </div>
        </div>
    );
};

export default Page;