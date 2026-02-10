"use client";
import React, { useState } from 'react';
import { Save, MapPin, Shield, FileText, AlertCircle, ChevronLeft } from 'lucide-react'; // Removed Clock
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// MOCK SESSION - Replace this with your actual useSession() or AuthContext
const CURRENT_USER = {
  _id: "65d4f...", 
  name: "Rajesh Kumar",
  rank: "Sub-Inspector",
  forceNumber: "8821",
  division: "Central Division",
  post: "Connaught Place PS" 
};

export default function AddGDEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // REMOVED: currentTime state and useEffect (No longer needed)

  const [formData, setFormData] = useState({
    abstract: '',
    details: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.abstract || !formData.details) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Recording entry...");

    try {
      const payload = {
        ...formData,
        division: CURRENT_USER.division,
        post: CURRENT_USER.post,
        officerId: CURRENT_USER._id,
        entryTime: new Date() // We still capture the time on submit, just don't show it live
      };

      const response = await fetch('/api/gd/create-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to record entry");

      toast.success(`Entry #${data.entryNo} Recorded Successfully`, { id: toastId });
      
      setFormData({ abstract: '', details: '' });
      router.refresh(); 

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Server Error", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-3xl mx-auto">
        {/* Navigation / Header */}
        <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Top Banner: Location Only (Clock Removed) */}
          <div className="bg-[#1a233a] text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Shield size={32} className="text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wide">GENERAL DIARY ENTRY</h1>
                <div className="flex items-center gap-2 text-gray-300 text-xs uppercase tracking-wider mt-1">
                  <MapPin size={12} />
                  {CURRENT_USER.post}, {CURRENT_USER.division}
                </div>
              </div>
            </div>
            
            {/* REMOVED: The Right-side Clock div is completely gone */}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* Officer Context Card */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {CURRENT_USER.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Officer on Duty</p>
                  <p className="text-xs text-gray-500">{CURRENT_USER.name} ({CURRENT_USER.rank}) - {CURRENT_USER.forceNumber}</p>
                </div>
              </div>
              <div className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-500 font-medium">
                Digital Signature Ready
              </div>
            </div>

            {/* Subject / Abstract */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <FileText size={16} className="text-gray-400" />
                Subject / Abstract <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="abstract"
                value={formData.abstract}
                onChange={handleChange}
                placeholder="E.g., Charge Assumption, Patrol Departure, Complaint Received..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <FileText size={16} className="text-gray-400" />
                Detailed Entry <span className="text-red-500">*</span>
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={6}
                placeholder="Enter the full details of the occurrence..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-400 resize-none"
              />
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <AlertCircle size={12} />
                Entries cannot be deleted once saved. Only corrections are allowed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setFormData({ abstract: '', details: '' })}
                className="px-6 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                disabled={loading}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-[#1a233a] hover:bg-[#25304c] text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Recording...' : (
                  <>
                    <Save size={18} />
                    Record Entry
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}