"use client";
import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RAILWAY_ZONES = [
  "CENTRAL RAILWAY", "EASTERN RAILWAY", "EAST CENTRAL RAILWAY", "EAST COAST RAILWAY",
  "NORTHERN RAILWAY", "NORTH CENTRAL RAILWAY", "NORTH EASTERN RAILWAY",
  "NORTH EAST FRONTIER RAILWAY", "NORTH WESTERN RAILWAY", "SOUTHERN RAILWAY",
  "SOUTH CENTRAL RAILWAY", "SOUTH EASTERN RAILWAY", "SOUTH EAST CENTRAL RAILWAY",
  "SOUTH WESTERN RAILWAY", "WESTERN RAILWAY", "WEST CENTRAL RAILWAY",
  "METRO RAILWAY", "KONKAN RAILWAY"
];

const Input = ({ label, name, value, onChange, placeholder, type = "text", required = true }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-gray-300 rounded-lg px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-gray-400"
      required={required}
    />
  </div>
);

const Select = ({ label, name, value, onChange, options }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-gray-300 rounded-lg px-4 py-3 text-sm font-medium outline-none transition-all appearance-none cursor-pointer"
        required
      >
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  </div>
);

export default function CreateOfficerForm() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    forceNumber: '',
    rank: 'Constable',
    railwayZone: 'SOUTHERN RAILWAY',
    division: '',
    postCode: '',
    mobileNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Registering personnel...');

    try {
      const response = await fetch('/api/officer/create-officer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create officer account');
      }

      toast.success('Officer created successfully. Default password set.', { id: toastId });

      setFormData({
        name: '',
        forceNumber: '',
        rank: 'Constable',
        railwayZone: 'SOUTHERN RAILWAY',
        division: '',
        postCode: '',
        mobileNumber: ''
      });

    } catch (error: any) {
      toast.error(error.message || "Something went wrong", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">

      <div className="px-6 py-6 border-b border-gray-50 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
          Personnel Registration
        </h3>
        <p className="text-xs font-medium text-gray-400 mt-1">
          Default password will be assigned automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

        {/* Identity */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-gray-100 pb-2">
            01. Official Identity
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Full Name" name="name" placeholder="EX: RAJESH KUMAR" value={formData.name} onChange={handleChange} />
            <Input label="Force ID (Unique)" name="forceNumber" placeholder="EX: RPF-8821" value={formData.forceNumber} onChange={handleChange} />
            <Select label="Rank" name="rank" options={["Constable", "Head Constable", "ASI", "SI", "IPF", "ASC", "Sr.DSC", "ADMIN"]} value={formData.rank} onChange={handleChange} />
          </div>
        </div>

        {/* Posting */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-gray-100 pb-2">
            02. Posting Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Select label="Railway Zone" name="railwayZone" options={RAILWAY_ZONES} value={formData.railwayZone} onChange={handleChange} />
            <Input label="Division" name="division" placeholder="EX: DELHI" value={formData.division} onChange={handleChange} />
            <Input label="Post Code / Station Code" name="postCode" placeholder="EX: NDLS-MAIN-01" value={formData.postCode} onChange={handleChange} />
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-gray-100 pb-2">
            03. Contact Details
          </h4>
          <Input label="Mobile Number" name="mobileNumber" placeholder="+91 98765 43210" value={formData.mobileNumber} onChange={handleChange} />
        </div>

        <div className="pt-4 border-t border-gray-50">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Registering...' : 'Create Official Account'}
          </button>
        </div>

      </form>
    </div>
  );
}