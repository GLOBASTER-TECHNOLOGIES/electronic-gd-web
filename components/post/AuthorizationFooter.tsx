"use client";

import React from "react";
import { AlertTriangle, FileBadge, Fingerprint, CheckCircle2 } from "lucide-react";
import { IFormData } from "./CorrectionWorkspace";

export interface IAdminData {
  reqName: string;
  reqRank: string;
  reqForceNo: string;
  fwdName: string;
  fwdRank: string;
  fwdForceNo: string;
}

interface AuthorizationFooterProps {
  formData: IFormData;
  setFormData: React.Dispatch<React.SetStateAction<IFormData>>;
  adminData: IAdminData;
  setAdminData: React.Dispatch<React.SetStateAction<IAdminData>>;
  isSubmitting: boolean;
  entryId: string;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AuthorizationFooter({
  formData,
  setFormData,
  adminData,
  setAdminData,
  isSubmitting,
  entryId,
  onCancel,
  onSubmit
}: AuthorizationFooterProps) {
  return (
    <div className="bg-gray-50 border-t border-gray-200 p-6 md:px-8">
      {/* Changed to flex-col to prevent side-by-side layout and improve flow */}
      <div className="flex flex-col gap-8 mb-6">
        
        {/* REASON */}
        <div className="flex flex-col">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-2">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Reason for Amendment <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="State official reason (e.g. Typographical Error, Factual Update)..."
            className="w-full text-sm border border-gray-300 rounded-md p-3 focus:border-amber-500 outline-none h-24 resize-y"
          />
        </div>

        {/* ADMIN PROTOTYPE INPUTS */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileBadge className="w-4 h-4" /> Administrative Control
          </h4>
          
          <div className="space-y-6">
            {/* REQUESTED BY */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 mb-2 tracking-wider">REQUESTED BY</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  placeholder="Rank" 
                  value={adminData.reqRank || ""} 
                  onChange={e => setAdminData({ ...adminData, reqRank: e.target.value })} 
                  className="text-xs p-2.5 border border-slate-200 rounded focus:border-slate-400 outline-none w-full" 
                />
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={adminData.reqName || ""} 
                  onChange={e => setAdminData({ ...adminData, reqName: e.target.value })} 
                  className="text-xs p-2.5 border border-slate-200 rounded focus:border-slate-400 outline-none w-full" 
                />
                <input 
                  type="text" 
                  placeholder="Force No" 
                  value={adminData.reqForceNo || ""} 
                  onChange={e => setAdminData({ ...adminData, reqForceNo: e.target.value })} 
                  className="text-xs p-2.5 border border-slate-200 rounded bg-slate-50 focus:border-slate-400 outline-none w-full" 
                />
              </div>
            </div>

            {/* FORWARDED BY */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-500 mb-2 mt-2 tracking-wider">FORWARDED BY</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  placeholder="Rank" 
                  value={adminData.fwdRank || ""} 
                  onChange={e => setAdminData({ ...adminData, fwdRank: e.target.value })} 
                  className="text-xs p-2.5 border border-slate-200 rounded focus:border-slate-400 outline-none w-full" 
                />
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={adminData.fwdName || ""} 
                  onChange={e => setAdminData({ ...adminData, fwdName: e.target.value })} 
                  className="text-xs p-2.5 border border-slate-200 rounded focus:border-slate-400 outline-none w-full" 
                />
                <input 
                  type="text" 
                  placeholder="Force No" 
                  value={adminData.fwdForceNo || ""} 
                  onChange={e => setAdminData({ ...adminData, fwdForceNo: e.target.value })} 
                  className="text-xs p-2.5 border border-slate-200 rounded bg-slate-50 focus:border-slate-400 outline-none w-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-4">
        <div className="text-[10px] text-gray-400 flex items-center gap-1 w-full sm:w-auto">
          <Fingerprint className="w-3 h-3" /> Ref: {entryId}
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <button 
            type="button" 
            onClick={onCancel} 
            className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || formData.reason.length < 5}
            className="flex-1 sm:flex-none px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "Processing..." : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Sign & Update GD
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}