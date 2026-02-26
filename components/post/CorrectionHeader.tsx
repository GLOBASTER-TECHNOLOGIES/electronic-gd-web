import React from "react";
import { Shield, ArrowLeft } from "lucide-react";

interface CorrectionHeaderProps {
  entryNo: number;
  onBack: () => void;
}

export default function CorrectionHeader({ entryNo, onBack }: CorrectionHeaderProps) {
  return (
    <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-start border-b-4 border-yellow-500">
      <div>
        <h1 className="text-xl font-bold tracking-wide uppercase flex items-center gap-2">
          {/* <Shield className="w-5 h-5 text-yellow-500" /> */}
          General Diary Correction
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-slate-400 text-xs uppercase tracking-wider">
            Electronic Record Amendment
          </p>
          <button
            type="button"
            onClick={onBack}
            className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" /> Change Entry
          </button>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-mono font-bold text-yellow-400">#{entryNo}</div>
        <div className="text-xs text-slate-400">Entry Serial No.</div>
      </div>
    </div>
  );
}