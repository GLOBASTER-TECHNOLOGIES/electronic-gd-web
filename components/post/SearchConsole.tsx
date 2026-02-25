"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Search, Hash, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";

export interface ISearchParamsState {
  station: string;
  date: string;
  entryNo: string;
}

interface SearchConsoleProps {
  loading: boolean;
  error: string;
  searchParams: ISearchParamsState;
  setSearchParams: React.Dispatch<React.SetStateAction<ISearchParamsState>>;
  onSearch: (e: React.FormEvent) => void;
}

export default function SearchConsole({
  loading,
  error,
  searchParams,
  setSearchParams,
  onSearch
}: SearchConsoleProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      
      {/* 🔹 Back Button */}
      <div className="w-full max-w-md mb-4">
        <button
          onClick={() => router.push("/post/dashboard")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="w-full max-w-md bg-white shadow-xl rounded-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-6 text-center border-b-4 border-yellow-500">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">
            GD Correction Console
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={onSearch} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-1.5">
                <Hash className="w-3 h-3" /> Entry No.
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 42"
                value={searchParams.entryNo}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    entryNo: e.target.value
                  })
                }
                className="w-full p-3 border border-slate-300 rounded text-sm outline-none focus:border-slate-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !searchParams.entryNo}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Searching Database..." : "Locate Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}