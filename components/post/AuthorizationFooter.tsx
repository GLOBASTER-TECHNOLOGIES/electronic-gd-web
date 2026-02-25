"use client";

import React from "react";
import { AlertTriangle, FileBadge, Fingerprint, CheckCircle2 } from "lucide-react";
import { IFormData } from "./CorrectionWorkspace";

export interface IAdminData {
  reqName: string;
  reqRank: string;
  reqForceNo: string;
  appName: string;
  appRank: string;
  appForceNo: string;
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
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
            className="w-full flex-1 text-sm border border-gray-300 rounded-md p-3 focus:border-amber-500 outline-none h-32"
          />
        </div>

        {/* ADMIN PROTOTYPE INPUTS */}
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <FileBadge className="w-3 h-3" /> Administrative Control (Prototype)
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 text-[10px] font-bold text-slate-500">REQUESTED BY</div>
              <input type="text" placeholder="Rank" value={adminData.reqRank} onChange={e => setAdminData({ ...adminData, reqRank: e.target.value })} className="text-xs p-2 border rounded" />
              <input type="text" placeholder="Name" value={adminData.reqName} onChange={e => setAdminData({ ...adminData, reqName: e.target.value })} className="col-span-2 text-xs p-2 border rounded" />
              <input type="text" placeholder="Force No" value={adminData.reqForceNo} onChange={e => setAdminData({ ...adminData, reqForceNo: e.target.value })} className="col-span-3 text-xs p-2 border rounded bg-slate-50" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 text-[10px] font-bold text-slate-500 mt-1">APPROVED BY (ADMIN)</div>
              <input type="text" placeholder="Rank" value={adminData.appRank} onChange={e => setAdminData({ ...adminData, appRank: e.target.value })} className="text-xs p-2 border rounded" />
              <input type="text" placeholder="Name" value={adminData.appName} onChange={e => setAdminData({ ...adminData, appName: e.target.value })} className="col-span-2 text-xs p-2 border rounded" />
              <input type="text" placeholder="Force No" value={adminData.appForceNo} onChange={e => setAdminData({ ...adminData, appForceNo: e.target.value })} className="col-span-3 text-xs p-2 border rounded bg-slate-50" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-[10px] text-gray-400 flex items-center gap-1">
          <Fingerprint className="w-3 h-3" /> Ref: {entryId}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || formData.reason.length < 5}
            className="px-8 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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