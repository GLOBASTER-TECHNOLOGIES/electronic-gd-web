"use client";

import React from "react";
import { Copy, ArrowRightLeft } from "lucide-react";

export interface IFormData {
  abstract: string;
  details: string;
  reason: string;
}

interface CorrectionWorkspaceProps {
  original: { abstract: string; details: string };
  formData: IFormData;
  setFormData: React.Dispatch<React.SetStateAction<IFormData>>;
  onRestore: () => void;
}

export default function CorrectionWorkspace({
  original,
  formData,
  setFormData,
  onRestore
}: CorrectionWorkspaceProps) {
  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* LEFT: ORIGINAL */}
      <div className="w-full md:w-5/12 bg-gray-50/80 p-6 border-r border-gray-200 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Original Record</h3>
          <button type="button" onClick={onRestore} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors">
            <Copy className="w-3 h-3" /> Restore
          </button>
        </div>
        <div className="space-y-6 select-none opacity-80">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Subject / Abstract</label>
            <div className="font-mono text-sm bg-gray-100 p-3 rounded border border-gray-200 text-gray-700">{original.abstract}</div>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Detailed Entry</label>
            <div className="font-mono text-sm bg-gray-100 p-3 rounded border border-gray-200 text-gray-700 min-h-[200px] whitespace-pre-wrap leading-relaxed">{original.details}</div>
          </div>
        </div>
      </div>

      {/* CENTER ARROW */}
      <div className="hidden md:flex flex-col justify-center items-center w-12 bg-white -ml-6 z-10">
        <div className="bg-slate-900 text-white rounded-full p-2 shadow-lg border-4 border-white">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
      </div>

      {/* RIGHT: CORRECTION */}
      <div className="w-full md:w-7/12 p-6 bg-white">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Amendment Data</h3>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">ACTIVE EDIT</span>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Revised Subject</label>
            <input
              type="text"
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className="w-full text-sm font-semibold text-slate-900 border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Revised Details</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full text-sm leading-relaxed text-slate-900 border border-slate-300 rounded-md p-3 min-h-[200px] focus:ring-2 focus:ring-slate-900 outline-none transition-all resize-none font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}