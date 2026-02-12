"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  User, 
  Shield, 
  Phone, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Save,
  ArrowLeft,
  Lock,
  Briefcase
} from "lucide-react";

interface UpdateOfficerFormProps {
  officerId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function UpdateOfficerForm({ officerId, onCancel, onSuccess }: UpdateOfficerFormProps) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    forceNumber: "",
    rank: "",
    mobileNumber: "",
    appRole: "",
    postName: "",
    division: "",
    railwayZone: "",
    password: "",
  });

  // Fetch officer data
  useEffect(() => {
    const fetchOfficer = async () => {
      try {
        // We reuse the existing get-officer API, filtering by ID via query param if supported, 
        // OR we can fetch all and find one (temporary fix until get-by-id API exists).
        // ideally: GET /api/officer/get-officer?id=${officerId}
        // For now, let's assume get-officer supports ?query=${forceNumber} or we add ID support.
        // Let's implement a specific fetch for this form.
        
        // NOTE: You might need to update your GET /api/officer/get-officer to handle `?id=` param
        // similar to how we did for Post. 
        const res = await axios.get(`/api/officer/get-officer?id=${officerId}`);
        
        if (res.data.success) {
           // If the API returns an array, pick the first one, or if object, use directly.
           const data = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
           
           setFormData({
             name: data.name,
             forceNumber: data.forceNumber,
             rank: data.rank,
             mobileNumber: data.mobileNumber,
             appRole: data.appRole,
             postName: data.postName,
             division: data.division,
             railwayZone: data.railwayZone,
             password: "",
           });
        }
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load officer details." });
      } finally {
        setLoading(false);
      }
    };

    if (officerId) fetchOfficer();
  }, [officerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const res = await axios.patch("/api/officer/update-officer", { ...formData, id: officerId });

      if (res.data.success) {
        setMessage({ type: "success", text: "Officer details updated successfully!" });
        setTimeout(onSuccess, 1500);
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
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
           <h1 className="text-xl font-bold text-slate-900">Edit Officer Profile</h1>
           <p className="text-xs font-bold text-slate-400 uppercase">Force No: {formData.forceNumber}</p>
        </div>
        <button onClick={onCancel} className="flex items-center gap-2 text-xs font-bold uppercase hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">
            <ArrowLeft size={16} /> Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
               <User size={18} /> Personal Details
             </h3>
             
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
               <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" required />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Rank</label>
                  <input name="rank" value={formData.rank} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Mobile</label>
                  <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" required />
                </div>
             </div>
          </div>

          {/* Password Reset */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
               <Lock size={18} /> Security
             </h3>
             <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-amber-800 uppercase">Reset Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password to reset"
                    className="w-full p-3 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
              </div>
          </div>
        </div>

        {/* Official Info */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
               <Briefcase size={18} /> Posting Details
             </h3>
             
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-600 uppercase">Current Post</label>
               <input name="postName" value={formData.postName} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-600 uppercase">Division</label>
                 <input name="division" value={formData.division} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-600 uppercase">Zone</label>
                 <input name="railwayZone" value={formData.railwayZone} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" />
               </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">System Role</label>
                <select name="appRole" value={formData.appRole} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold">
                   <option value="OFFICER">Officer</option>
                   <option value="ADMIN">Admin</option>
                </select>
             </div>
           </div>

           {/* Actions */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             {message && (
                <div className={`p-3 rounded-lg flex gap-2 mb-4 text-xs font-bold ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
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
                {updating ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}