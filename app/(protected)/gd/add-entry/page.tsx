"use client";
import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, PenLine, AlignLeft, Shield, Clock, MapPin, User, Hash, Fingerprint } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Mock User Data
const CURRENT_USER = {
  _id: "65d4f...",
  name: "Rajesh Kumar",
  rank: "Sub-Inspector",
  forceNumber: "RPF-8821",
  division: "Central Division",
  post: "Connaught Place PS"
};

export default function AddGDEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());
  
  const [formData, setFormData] = useState({ abstract: '', details: '' });

  // Handle Hydration & Clock
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.abstract || !formData.details) {
      toast.error("Required fields missing");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Encrypting & Saving...");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Real payload logic would go here
      // const response = await fetch(...) 

      toast.success("Entry Secured Successfully", { id: toastId });
      setFormData({ abstract: '', details: '' });
      router.refresh();

    } catch (error: any) {
      toast.error("Transmission Failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Background Grid & Glow Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Toaster position="top-center" toastOptions={{
        style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b' }
      }} />

      {/* Main Interface Card */}
      <div className="w-full max-w-3xl relative z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-all px-4 py-2 rounded-lg hover:bg-slate-900/50"
          >
            <div className="bg-slate-800 p-2 rounded-md group-hover:bg-cyan-950 transition-colors border border-slate-700 group-hover:border-cyan-900/50">
               <ArrowLeft size={18} />
            </div>
            <span className="text-sm font-semibold tracking-wide">ABORT ENTRY</span>
          </button>

          {/* Live Clock Widget */}
          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full pl-5 pr-2 py-1.5 shadow-xl">
             <div className="flex flex-col items-end leading-none mr-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Time</span>
                <span className="text-sm font-mono text-cyan-400 font-medium">
                  {time.toLocaleTimeString([], { hour12: false })}
                </span>
             </div>
             <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <Clock size={14} className="text-slate-400 animate-pulse" />
             </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden relative">
          
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

          {/* Hero Section */}
          <div className="p-8 pb-6 border-b border-slate-800">
             <div className="flex items-start justify-between">
                <div>
                   <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                      <Shield className="text-cyan-500 fill-cyan-500/10" size={28} />
                      General Diary
                   </h1>
                   <p className="text-slate-400 mt-2 text-sm flex items-center gap-2">
                      <MapPin size={14} className="text-cyan-600" /> 
                      {CURRENT_USER.post} <span className="text-slate-600">|</span> {CURRENT_USER.division}
                   </p>
                </div>
                
                {/* ID Badge Look */}
                <div className="hidden sm:flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-3 rounded-xl">
                   <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600 shadow-inner">
                      <User size={20} className="text-slate-300" />
                   </div>
                   <div className="text-right">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Officer On Duty</div>
                      <div className="text-cyan-400 font-mono text-xs">{CURRENT_USER.forceNumber}</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Input Group 1 */}
            <div className="space-y-6">
               <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur"></div>
                  <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-1 flex items-center">
                     <div className="p-3 bg-slate-900 rounded-lg text-slate-400 border border-slate-800/50">
                        <Hash size={18} />
                     </div>
                     <input
                        type="text"
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleChange}
                        placeholder="Subject / Abstract..."
                        className="w-full bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 px-4 py-3 font-medium"
                        autoComplete="off"
                     />
                  </div>
               </div>

               <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur"></div>
                  <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-1">
                     <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-900">
                        <AlignLeft size={16} className="text-cyan-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Report Details</span>
                     </div>
                     <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        rows={8}
                        placeholder="Enter the complete occurrence details here..."
                        className="w-full bg-transparent border-none text-slate-300 placeholder:text-slate-700 focus:ring-0 px-4 py-4 text-sm leading-relaxed resize-none"
                     />
                  </div>
               </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-4">
               <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <Fingerprint size={14} className="text-slate-600" />
                  ID: {CURRENT_USER._id.substring(0, 8)}...
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
               >
                  {loading ? (
                     <span className="flex items-center gap-2">Processing...</span>
                  ) : (
                     <>
                        <Save size={18} className="text-cyan-100 group-hover:scale-110 transition-transform" />
                        <span>Secure Entry</span>
                     </>
                  )}
               </button>
            </div>

          </form>
        </div>
        
        {/* Footer Disclaimer */}
        <p className="text-center text-slate-600 text-[10px] mt-6 uppercase tracking-[0.2em] font-medium">
           Restricted Access • Official Use Only
        </p>

      </div>
    </div>
  );
}