"use client";

import React, { useState } from "react";
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
  Lock // Added Lock icon
} from "lucide-react";

export default function CreatePostForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    postName: "",
    postCode: "",
    division: "",
    contactNumber: "",
    address: "",
    officerForceId: "", 
    password: "", // Added password field
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("/api/post/create-post", formData);

      if (res.data.success) {
        setMessage({ type: "success", text: `Post "${res.data.data.postName}" created successfully!` });
        setFormData({
          postName: "",
          postCode: "",
          division: "",
          contactNumber: "",
          address: "",
          officerForceId: "",
          password: "",
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create post. Check connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Building2 size={28} className="text-blue-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Post</h1>
            <p className="text-blue-200 text-sm">Register a new RPF Thana or Outpost</p>
          </div>
        </div>
        <div className="hidden sm:block">
           <TrainFront size={48} className="text-white/10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Station Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD 1: Essential Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin size={18} className="text-slate-900" /> Station Identity
            </h3>
            
            <div className="space-y-6">
              {/* Row 1: Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Post Name <span className="text-red-500">*</span></label>
                  <input
                    name="postName"
                    value={formData.postName}
                    onChange={handleChange}
                    placeholder="E.g. TRICHY JUNCTION"
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 uppercase transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Station Code <span className="text-red-500">*</span></label>
                  <input
                    name="postCode"
                    value={formData.postCode}
                    onChange={handleChange}
                    placeholder="E.g. TPJ"
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-800 uppercase transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Division & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Division <span className="text-red-500">*</span></label>
                  <input
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    placeholder="E.g. TRICHY"
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 uppercase transition-all"
                  />
                </div>
                
                {/* NEW PASSWORD FIELD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1">
                    <Lock size={12} className="text-slate-400" /> Station Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Set Desk Login Password"
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 transition-all"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* CARD 2: Contact & Location */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone size={18} className="text-slate-900" /> Contact & Location
            </h3>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Contact Number</label>
                  <input
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Landline or CUG Number"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Full Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter the complete postal address or location details..."
                    rows={3}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                  />
               </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Officer Assign & Actions */}
        <div className="space-y-6">
          
          {/* CARD 3: Officer Assignment */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-800 flex items-center gap-2">
                  <UserSquare2 size={18} /> In-Charge
                </h3>
                <p className="text-xs text-blue-600 mt-1">Assign an SHO/IPF now (Optional)</p>
             </div>

             <div className="space-y-4">
               <label className="text-xs font-bold text-slate-600 uppercase">Officer Force ID</label>
               <input
                 name="officerForceId"
                 value={formData.officerForceId}
                 onChange={handleChange}
                 placeholder="E.g. 95123"
                 className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono text-lg text-center tracking-widest text-slate-800 placeholder:text-slate-300 transition-all"
               />
               <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                 Enter the Force ID. The system will auto-link the profile if found. Leave empty to assign later.
               </p>
             </div>
          </div>

          {/* CARD 4: Actions & Feedback */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             {message && (
              <div className={`p-4 rounded-xl flex items-start gap-3 mb-6 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                  : 'bg-red-50 text-red-800 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="shrink-0" size={20} /> : <AlertCircle className="shrink-0" size={20} />}
                <span className="text-sm font-medium leading-tight">{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Create Post</>}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}