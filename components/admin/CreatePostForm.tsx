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
  AlertCircle 
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
    officerForceId: "", // Control room enters "12345" here
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // POST request to the route we created earlier
      const res = await axios.post("/api/admin/posts/add", formData);

      if (res.data.success) {
        setMessage({ type: "success", text: `Post "${res.data.data.postName}" created successfully!` });
        // Reset form
        setFormData({
          postName: "",
          postCode: "",
          division: "",
          contactNumber: "",
          address: "",
          officerForceId: "",
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
    <div className="max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Create New Post / Station</h1>
          <p className="text-sm text-slate-500">Register a new RPF Thana or Outpost</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
        
        {/* Section 1: Station Details */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <MapPin size={16} /> Station Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase">Post Name</label>
              <input
                name="postName"
                value={formData.postName}
                onChange={handleChange}
                placeholder="e.g. TRICHY JUNCTION"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase">Station Code</label>
              <input
                name="postCode"
                value={formData.postCode}
                onChange={handleChange}
                placeholder="e.g. TPJ"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-700 uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase">Division</label>
              <input
                name="division"
                value={formData.division}
                onChange={handleChange}
                placeholder="e.g. TRICHY"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 uppercase"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Section 2: Contact & Location */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Phone size={16} /> Contact Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase">Contact Number</label>
              <input
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Landline or CUG"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase">Address / Location</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Brief location description"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Section 3: Officer in Charge (Auto-Link) */}
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2">
            <UserSquare2 size={16} /> Officer In-Charge (Optional)
          </h3>
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-semibold text-slate-600 uppercase">Officer Force ID</label>
            <div className="flex gap-2">
              <input
                name="officerForceId"
                value={formData.officerForceId}
                onChange={handleChange}
                placeholder="Enter Force Number (e.g. 95123)"
                className="flex-1 p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              * Enter the Force ID of the SHO/IPf. The system will automatically link their profile. Leave blank if vacant.
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Post"}
          </button>
        </div>

      </form>
    </div>
  );
}