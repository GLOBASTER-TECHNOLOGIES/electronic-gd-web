"use client";
import React, { useState } from 'react';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';

export default function PremiumOfficerForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-8 border-b border-gray-50 bg-gray-50/30">
        <h3 className="text-xl font-bold text-gray-900">New Personnel Profile</h3>
        <p className="text-gray-400 text-sm mt-1">Enter officer details to generate system credentials.</p>
      </div>

      <form className="p-6 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" placeholder="Officer Name" />
          <Input label="Force ID" placeholder="RPF-XXXX" />
          <Select label="Rank" options={["Constable", "ASI", "SI", "Inspector"]} />
          <Select label="Zone" options={["Northern", "Southern", "Eastern", "Western"]} />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Security Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Mobile Number" placeholder="+91" />
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-2">PASSWORD</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2">
            Create Account <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <input type="text" placeholder={placeholder} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
    </div>
  );
}

function Select({ label, options }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
        {options.map((o: string) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}