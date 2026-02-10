"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Save, ShieldAlert, Loader2 } from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  rank: string;
  forceNumber: string;
  division: string;
  postName: string;
}

export default function AddGDEntryPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  
  const [time, setTime] = useState(new Date());
  const [formData, setFormData] = useState({
    abstract: "",
    details: "",
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", {
            params: { fields: "name,rank,forceNumber,division,postName" }
        });
        setUser(res.data.user);
      } catch {
        router.push("/login");
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUser();
    return () => clearInterval(timer);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await axios.post("/api/gd/create-entry", {
        ...formData,
        division: user.division,
        post: user.postName,
        officerId: user._id,
        officerName: user.name,
        rank: user.rank,
        forceNumber: user.forceNumber,
      });

      setFormData({ abstract: "", details: "" });
      router.refresh();
      alert("Entry Recorded. Reference Number Generated.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#eef0f3] py-8 px-4 flex justify-center font-sans text-gray-900">
      
      {/* Document Container */}
      <div className="w-full max-w-3xl bg-white shadow-sm border border-gray-300 min-h-[900px] flex flex-col">
        
        {/* --- HEADER SECTION --- */}
        <header className="border-b-2 border-black p-8 pb-4">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight leading-none">General Diary</h1>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">Railway Protection Force</p>
                </div>
                <div className="text-right">
                    <div className="inline-block border border-gray-900 px-2 py-1">
                        <p className="text-[10px] font-bold uppercase">Form No.</p>
                        <p className="text-sm font-mono font-bold">RPF-GD-2026</p>
                    </div>
                </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm border-t border-gray-200 pt-4">
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Station / Post</span>
                    <span className="block font-semibold uppercase">{user.postName}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Division</span>
                    <span className="block font-semibold uppercase">{user.division}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</span>
                    <span className="block font-mono">{time.toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Time</span>
                    <span className="block font-mono text-red-700 font-bold">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-8">
                 <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Duty Officer</span>
                    <span className="block font-medium">{user.name}</span>
                </div>
                 <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Rank & ID</span>
                    <span className="block font-medium">{user.rank} / {user.forceNumber}</span>
                </div>
            </div>
        </header>

        {/* --- BODY SECTION --- */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-10 flex flex-col gap-8">
            
            {/* Subject Line */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Subject</label>
                <input
                    type="text"
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    required
                    placeholder="ENTER SUBJECT HERE..."
                    className="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-black py-2 outline-none uppercase placeholder:text-gray-300 transition-colors"
                />
            </div>

            {/* --- BOOK PAGE ENTRY AREA --- */}
            <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Occurrence Details</label>
                
                {/* The Ruled Page */}
                <div className="flex-1 w-full border border-gray-200 bg-white shadow-inner relative">
                    <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        required
                        className="w-full h-full resize-none outline-none text-xl leading-[2.5rem] font-serif text-gray-900 bg-transparent px-6 py-0"
                        style={{
                            // 1. Create the horizontal lines
                            backgroundImage: 'linear-gradient(transparent 96%, #e2e8f0 97%, #e2e8f0 100%)',
                            // 2. Set size to match line-height exactly (40px)
                            backgroundSize: '100% 2.5rem',
                            // 3. Ensure background scrolls with text
                            backgroundAttachment: 'local',
                            lineHeight: '2.5rem'
                        }}
                        placeholder="Record the occurrence here..."
                    />
                </div>
            </div>

            {/* --- FOOTER / SIGNATURE --- */}
            <div className="pt-6 border-t-2 border-black flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-red-600 font-bold uppercase">
                    <ShieldAlert size={14} />
                    <span>Official Record • Cannot be modified</span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    Sign & Submit
                </button>
            </div>

        </form>

      </div>
    </div>
  );
}