"use client";
import React, { useState } from 'react';
import { ChevronRight, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const RAILWAY_ZONES = [
  "CENTRAL RAILWAY", "EASTERN RAILWAY", "EAST CENTRAL RAILWAY", "EAST COAST RAILWAY",
  "NORTHERN RAILWAY", "NORTH CENTRAL RAILWAY", "NORTH EASTERN RAILWAY",
  "NORTH EAST FRONTIER RAILWAY", "NORTH WESTERN RAILWAY", "SOUTHERN RAILWAY",
  "SOUTH CENTRAL RAILWAY", "SOUTH EASTERN RAILWAY", "SOUTH EAST CENTRAL RAILWAY",
  "SOUTH WESTERN RAILWAY", "WESTERN RAILWAY", "WEST CENTRAL RAILWAY",
  "METRO RAILWAY", "KONKAN RAILWAY"
];

export default function CreateOfficerForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    forceNumber: '',
    rank: 'Constable',
    appRole: 'STAFF',
    railwayZone: 'SOUTHERN RAILWAY',
    division: '',
    postName: '',
    mobileNumber: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Initialize Loading Toast
    const toastId = toast.loading('Registering personnel...');

    try {
      // 2. Minimum Delay (1s) for better UX (prevents flickering)
      const minDelay = new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Real API Request
      const request = fetch('/api/officer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // 4. Wait for BOTH the API and the Timer
      const [response] = await Promise.all([request, minDelay]);

      const data = await response.json();

      // 5. Check for API Errors (e.g., 400 Bad Request, 409 Conflict)
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create officer account');
      }

      // 6. SUCCESS: Update toast to Success
      toast.success(data.message || 'Officer registered successfully!', { id: toastId });

      // 7. Reset Form
      setFormData({
        name: '', forceNumber: '', rank: 'Constable', appRole: 'STAFF',
        railwayZone: 'SOUTHERN RAILWAY', division: '', postName: '',
        mobileNumber: '', password: ''
      });

    } catch (error: any) {
      // 8. ERROR: Update toast to Error (No console.error used)
      // Using console.log just for dev debugging if needed
      console.log("Registration failed:", error.message);

      toast.error(error.message || "Something went wrong", { id: toastId });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-8 border-b border-gray-50 bg-gray-50/30">
        <h3 className="text-xl font-bold text-gray-900">New Personnel Profile</h3>
        <p className="text-gray-400 text-sm mt-1">Enter officer details to generate system credentials.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

        {/* 1. Official Identity */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Official Identity</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" name="name" placeholder="EX: RAJESH KUMAR" value={formData.name} onChange={handleChange} />
            <Input label="Force ID (Unique)" name="forceNumber" placeholder="EX: RPF-8821" value={formData.forceNumber} onChange={handleChange} />
            <Select label="Rank" name="rank" options={["Constable", "Head Constable", "ASI", "SI", "Inspector", "IPF", "DSC", "Sr.DSC", "ADMIN"]} value={formData.rank} onChange={handleChange} />
            <Select label="Application Role" name="appRole" options={["STAFF", "SO", "IPF", "DSC", "ADMIN"]} value={formData.appRole} onChange={handleChange} />
          </div>
        </div>

        {/* 2. Posting Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Posting Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select label="Railway Zone" name="railwayZone" options={RAILWAY_ZONES} value={formData.railwayZone} onChange={handleChange} />
            <Input label="Division" name="division" placeholder="EX: DELHI" value={formData.division} onChange={handleChange} />
            <Input label="Post Name / Station" name="postName" placeholder="EX: NDLS MAIN" value={formData.postName} onChange={handleChange} />
          </div>
        </div>

        {/* 3. Security Credentials */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Security & Access</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Mobile Number" name="mobileNumber" placeholder="+91 98765 43210" value={formData.mobileNumber} onChange={handleChange} />
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Processing...' : (<> <Save size={18} /> Create Official Account <ChevronRight size={16} /> </>)}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helpers
function Input({ label, name, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label} <span className="text-red-500">*</span></label>
      <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300" required />
    </div>
  );
}

function Select({ label, name, value, onChange, options }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <select name={name} value={value} onChange={onChange} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black transition-all appearance-none cursor-pointer" required>
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div>
  );
}