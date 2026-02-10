"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Shield, BookOpen, PenTool, Save, AlertTriangle } from "lucide-react";

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
  const [formData, setFormData] = useState({
    abstract: "",
    details: "",
  });

  // Current Date for the Header
  const today = new Date();
  const dateString = today.toLocaleDateString('en-IN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  const timeString = today.toLocaleTimeString('en-IN', { 
    hour: '2-digit', minute: '2-digit' 
  });

  useEffect(() => {
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
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const payload = {
        abstract: formData.abstract,
        details: formData.details,
        division: user.division,
        post: user.postName,
        officerId: user._id,
        officerName: user.name,
        rank: user.rank,
        forceNumber: user.forceNumber,
      };

      await axios.post("/api/gd/create-entry", payload);

      setFormData({ abstract: "", details: "" });
      router.refresh();
      alert("Entry successfully recorded in the General Diary.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600 gap-3">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-wide uppercase">Retrieving Personnel File...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans flex justify-center items-start">
      
      {/* Logbook Container */}
      <div className="w-full max-w-4xl bg-[#fdfbf7] shadow-2xl border border-gray-300 relative overflow-hidden flex flex-col md:flex-row min-h-[800px]">
        
        {/* Left Binding / Spine (Visual Decoration) */}
        <div className="hidden md:block w-12 bg-[#2c3e50] border-r-2 border-gray-400 relative">
             <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#34495e]"></div>
        </div>

        {/* Main Page Content */}
        <div className="flex-1 p-8 md:p-12 relative">
            
            {/* Paper Texture Overlay (Optional, using CSS opacity) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}>
            </div>

            {/* Official Header Block */}
            <div className="border-b-4 border-double border-gray-800 pb-6 mb-8 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-blue-900" />
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 uppercase tracking-wider">
                        General Diary
                    </h1>
                    <Shield className="w-8 h-8 text-blue-900" />
                </div>
                <div className="text-xs font-bold text-gray-500 tracking-[0.3em] uppercase mb-4">
                    Railway Protection Force
                </div>
                
                {/* Meta Data Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-gray-300 pt-4 mt-2">
                    <div className="text-left space-y-1">
                        <p><span className="font-bold text-gray-600 uppercase text-xs w-24 inline-block">Station:</span> {user.postName}</p>
                        <p><span className="font-bold text-gray-600 uppercase text-xs w-24 inline-block">Division:</span> {user.division}</p>
                        <p><span className="font-bold text-gray-600 uppercase text-xs w-24 inline-block">Date:</span> {dateString}</p>
                    </div>
                    <div className="text-left md:text-right space-y-1">
                        <p><span className="font-bold text-gray-600 uppercase text-xs inline-block md:hidden w-24">Officer:</span> {user.name} ({user.rank})</p>
                        <p><span className="font-bold text-gray-600 uppercase text-xs inline-block md:hidden w-24">Force No:</span> {user.forceNumber}</p>
                        <p className="text-blue-900 font-mono font-medium"><span className="font-bold text-gray-600 uppercase text-xs inline-block md:hidden w-24">Time:</span> {timeString}</p>
                    </div>
                </div>
            </div>

            {/* Form Area */}
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                
                {/* Subject Field */}
                <div className="relative">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <BookOpen size={14} /> Subject / Abstract
                    </label>
                    <input
                        type="text"
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-lg font-medium text-gray-900 focus:outline-none focus:border-blue-900 transition-colors placeholder:text-gray-400/70"
                        placeholder="e.g. Charge Assumption, Patrol Report..."
                    />
                </div>

                {/* Details Field (Ruled Paper Look) */}
                <div className="relative">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <PenTool size={14} /> Full Entry Details
                    </label>
                    
                    <div className="relative w-full border border-gray-300 bg-white shadow-inner">
                        {/* Ruled Lines CSS Background */}
                        <textarea
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            required
                            rows={12}
                            style={{
                                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)',
                                lineHeight: '32px',
                                padding: '8px 16px',
                                backgroundAttachment: 'local'
                            }}
                            className="w-full bg-transparent resize-none text-gray-800 text-base focus:outline-none focus:bg-blue-50/10 transition-colors block"
                            placeholder="Record the occurrence here..."
                        />
                    </div>
                    
                    <div className="flex justify-between items-start mt-2">
                         <p className="text-xs text-amber-700 flex items-center gap-1">
                             <AlertTriangle size={12} />
                             Entries are immutable. Verify before signing.
                         </p>
                         <p className="text-xs text-gray-400 text-right">
                             Pg 1 / 1
                         </p>
                    </div>
                </div>

                {/* Signature / Submit Block */}
                <div className="pt-8 mt-8 border-t border-dashed border-gray-300 flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    <div className="text-center md:text-left">
                        <div className="h-10">
                            {/* Visual placeholder for signature if you had an image */}
                            <span className="font-cursive text-2xl text-blue-900 opacity-80 rotate-[-5deg] block" style={{ fontFamily: 'cursive' }}>
                                {user.name}
                            </span>
                        </div>
                        <div className="border-t border-gray-400 w-48 mt-1 pt-1">
                            <p className="text-[10px] uppercase font-bold text-gray-500">Officer's Signature</p>
                            <p className="text-[10px] text-gray-400">{user.forceNumber}</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative px-8 py-3 bg-[#2c3e50] text-[#fdfbf7] font-medium text-sm tracking-wide shadow-lg hover:bg-[#1a252f] hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? "Recording..." : <> <Save size={16} /> RECORD ENTRY </>}
                        </span>
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
}