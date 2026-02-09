"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaUserShield, FaLock, FaIdCard, FaUserPlus, FaTrain } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";

export default function CreateOfficerPage() {
  const router = useRouter();
  
  // Added 'name' to make the creation form realistic
  const [formData, setFormData] = useState({
    name: "",
    forceNumber: "",
    password: ""
  });
  
  const [status, setStatus] = useState<{ type: 'error' | 'success' | ''; message: string }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      // Changed endpoint to register/create
      await axios.post("/api/officer/create", formData);
      
      setStatus({ type: 'success', message: 'Officer account created successfully.' });
      
      // Optional: Reset form or redirect
      setFormData({ name: "", forceNumber: "", password: "" });
      // router.push("/admin/officers"); // Uncomment to redirect after success
    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        message: err?.response?.data?.message || "Failed to create officer account." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] bg-gray-50 p-4 md:p-8 font-sans">
      
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* LEFT PANEL: Branding & Visuals */}
        <div className="w-full md:w-5/12 bg-blue-950 p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <FaTrain className="text-[300px] absolute -right-10 -bottom-10 text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center">
                <MdSecurity className="text-yellow-400 text-xl" />
              </div>
              <span className="text-white font-bold tracking-wider text-sm">RPF ADMIN CONSOLE</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Register New Personnel</h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Create secure access credentials for Railway Protection Force officers. Ensure Force Number matches official records before proceeding.
            </p>
          </div>

          <div className="relative z-10 mt-10 md:mt-0">
            <div className="flex items-center gap-4 text-blue-200/60 text-xs font-mono">
              <span>SECURE ENCRYPTION</span>
              <span>•</span>
              <span>ROLE BASED ACCESS</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: The Form */}
        <div className="w-full md:w-7/12 p-10 md:p-14 bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaUserPlus className="text-blue-900" />
              Officer Details
            </h3>
            <p className="text-gray-500 text-sm mt-1">Fill in the information to generate new credentials.</p>
          </div>

          {/* Status Messages */}
          {status.message && (
            <div className={`mb-6 p-4 rounded-lg text-sm flex items-center gap-3 border ${
              status.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
              {status.message}
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Officer Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaIdCard className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-11 pr-4 text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  placeholder="e.g. Rajesh Kumar"
                  required
                />
              </div>
            </div>

            {/* Force Number Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Force Number (ID)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUserShield className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="forceNumber"
                  value={formData.forceNumber}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-11 pr-4 text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  placeholder="e.g. RPF-2024-X89"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assign Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-11 pr-4 text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg text-sm transition-all transform active:scale-[0.98] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2
                  ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <>Create Officer Account <FaArrowRight className="text-xs" /></>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

// Simple Helper Icon
function FaArrowRight({ className }: { className?: string }) {
  return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l143 143c9.4 9.4 9.4 24.6 0 33.9l-143 143c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l127.1-127z"></path></svg>;
}