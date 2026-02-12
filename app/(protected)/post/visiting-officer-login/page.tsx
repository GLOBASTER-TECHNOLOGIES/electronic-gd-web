"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Shield,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";

// --- 1. THE LOGIC COMPONENT ---
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [forceNumber, setForceNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "/api/post/visiting-officer-login",
        { forceNumber, password },
        { withCredentials: true }
      );

      router.replace(redirectTo);

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Authentication Failed: Invalid Credentials"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={16} /> Return to Dashboard
      </button>

      <div className="bg-white border border-gray-300 w-full max-w-sm overflow-hidden shadow-sm">

        {/* Official Header Strip */}
        <div className="bg-slate-900 p-6 text-center text-white">
          <Shield className="mx-auto text-blue-400 mb-2" size={28} />
          <h1 className="text-lg font-bold uppercase tracking-tight">
            Officer Authentication
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Railway Protection Force
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Force Number (Individual)
            </label>
            <input
              type="text"
              required
              value={forceNumber}
              onChange={(e) => setForceNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-black font-bold focus:bg-white focus:border-slate-900 outline-none transition-all"
              placeholder="e.g. RPF123456"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Personal Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-black font-bold focus:bg-white focus:border-slate-900 outline-none transition-all pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              "Verify Identity"
            )}
          </button>

          <p className="text-[9px] text-gray-400 font-bold text-center uppercase tracking-widest italic">
            Identity verification is mandatory for legal log entries
          </p>
        </form>
      </div>
    </div>
  );
}

// --- 2. EXPORTED PAGE WRAPPED IN SUSPENSE ---
export default function VisitingOfficerLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="animate-spin text-slate-900" size={32} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}