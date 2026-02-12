"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaUserShield, FaLock, FaShieldAlt, FaBuilding } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  // Renamed to userId to represent either Force No or Post Code
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // LOGIC: Detect Login Type
    // If the ID contains numbers, we treat it as an Officer. 
    // If it is pure text (like 'NDLS'), we treat it as a Post.
    const hasDigits = /\d/.test(userId);
    const isPostLogin = !hasDigits;

    // ✅ Match your actual API routes
    const endpoint = isPostLogin ? "/api/post/login" : "/api/officer/login";

    // ✅ Match the keys expected by your POST controllers
    const payload = isPostLogin
      ? { postCode: userId.trim(), password }
      : { forceNumber: userId.trim(), password };

    // ✅ Match the dashboard paths defined in your middleware
    const redirectPath = isPostLogin ? "/post/dashboard" : "/gd/add-entry";

    try {
      const res = await axios.post(endpoint, payload);

      if (res.data.success) {
        // Use window.location for a hard refresh if middleware 
        // needs to re-read the new cookies immediately
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

        {/* Header - Navy Blue for RPF Theme */}
        <div className="bg-blue-900 p-6 text-center">
          <div className="mx-auto w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md">
            <FaShieldAlt className="text-3xl text-blue-900" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">RPF OFFICIAL LOGIN</h1>
          <p className="text-blue-200 text-xs mt-1">Railway Protection Force Portal</p>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="p-8 space-y-5">

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Force Number / Post Code Input */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Force Number / Post Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Dynamic Icon based on input content */}
                  {/\d/.test(userId) || userId === "" ? (
                    <FaUserShield className="text-gray-400" />
                  ) : (
                    <FaBuilding className="text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Enter Force No. or Station Code"
                  className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all uppercase"
                  onChange={(e) => setUserId(e.target.value.toUpperCase().trim())} // Added trim
                  value={userId}
                  autoComplete="username" // Helps browser password managers
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">
                Examples: "951234" (Officer) or "TPJ" (Post)
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-md text-sm transition-all shadow-md
              ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Verifying..." : "SECURE LOGIN"}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 p-3 text-center border-t border-gray-200">
          <p className="text-[10px] text-gray-500 font-medium">
            Authorized Personnel Only • RPF System Logs Active
          </p>
        </div>
      </div>

      {/* Bottom Branding (Optional) */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400 font-semibold tracking-wider">SECURE • VIGILANT • PROTECTIVE</p>
      </div>
    </div>
  );
}