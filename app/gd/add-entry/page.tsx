"use client";

import React, { useState } from "react";
import axios from "axios";

const AddGDEntryPage = () => {
    const [abstract, setAbstract] = useState("");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Normally this comes from auth context / token
    const officer =
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("officer") || "{}")
            : {};

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post("/api/gd/add-entry", {
                division: officer.division,
                post: officer.postName,
                abstract,
                details,
                officerId: officer.id,
                officerName: officer.name,
                rank: officer.rank,
                forceNumber: officer.forceNumber,
            });

            setMessage(`Entry saved successfully (Entry No: ${res.data.entryNo})`);
            setAbstract("");
            setDetails("");
        } catch (err: any) {
            setMessage(
                err?.response?.data?.message || "Failed to save GD entry"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 text-black">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
                <h1 className="text-2xl font-semibold mb-4">
                    Add General Diary Entry
                </h1>

                {message && (
                    <div className="mb-4 text-sm text-center text-blue-700">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Abstract */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Abstract
                        </label>
                        <input
                            type="text"
                            value={abstract}
                            onChange={(e) => setAbstract(e.target.value)}
                            required
                            className="w-full border rounded px-3 py-2"
                            placeholder="Short heading (e.g. Roll call conducted)"
                        />
                    </div>

                    {/* Details */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Details of Report
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            required
                            rows={5}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Full details of the event"
                        />
                    </div>

                    {/* Officer Info (Read-only display) */}
                    <div className="text-sm bg-gray-50 p-3 rounded">
                        <p><strong>Officer:</strong> {officer.name}</p>
                        <p><strong>Rank:</strong> {officer.rank}</p>
                        <p><strong>Force No:</strong> {officer.forceNumber}</p>
                        <p><strong>Post:</strong> {officer.postName}</p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-60"
                    >
                        {loading ? "Saving Entry..." : "Save GD Entry"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddGDEntryPage;
