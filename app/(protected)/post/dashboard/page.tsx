"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Loader2,
  UserSquare2,
  ShieldCheck,
  FileText,
  Clock,
  Hash,
  BookOpen,
  ArrowRight,
  UserPlus,
  AlertCircle,
  LogOut // New icon for logout
} from "lucide-react";

// ... Interfaces remain the same ...

interface Officer {
  _id: string;
  name: string;
  rank: string;
  forceNumber: string;
}

interface Post {
  _id: string;
  postName: string;
  postCode: string;
  division: string;
  contactNumber?: string;
  address: string;
  officerInCharge?: Officer;
}

export default function PostsDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Get Current Identity
      const meRes = await axios.get("/api/auth/me");
      if (!meRes.data.success || !meRes.data.user) throw new Error("Verification failed.");

      const currentUser = meRes.data.user;
      const userType = meRes.data.userType; // "OFFICER" or "POST"

      // 2. Logic Branch
      if (userType === "POST") {
        // CASE A: Logged in as Station -> The user object IS the post
        setPosts([currentUser]);
      } else {
        // CASE B: Logged in as Officer -> Fetch posts assigned to this officer
        const postRes = await axios.get("/api/post/get-post-data", {
          params: { officerInCharge: currentUser._id }
        });
        if (postRes.data.success) {
          setPosts(postRes.data.data);
        }
      }

    } catch (err: any) {
      setError("Records could not be retrieved at this time.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.get("/api/auth/logout");
      if (res.data.success) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed", err);
      // Fallback redirect if API fails
      router.push("/login");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* OFFICIAL HEADER WITH LOGOUT */}
        <div className="bg-white border-b-2 border-slate-900 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Building2 className="text-slate-900" size={32} />
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">Station Command Dashboard</h1>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Railway Protection Force • Official Use Only</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8 justify-between md:justify-end">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase">System Date</p>
                <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="flex items-center gap-3 border-l border-gray-200 pl-4 md:pl-8">
                <ShieldCheck className="text-emerald-600" size={24} />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-100 rounded text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700 text-sm font-bold uppercase flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="space-y-6">

              {/* MAIN RECORD CARD */}
              <div className="bg-white border border-gray-300 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest flex justify-between">
                  <span>Post Assignment Details</span>
                  <span>Unit Code: {post.postCode}</span>
                </div>

                <div className="p-6 md:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Station Info */}
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Station Name</label>
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{post.postName}</h2>
                        <p className="text-sm font-bold text-blue-700 mt-1 uppercase tracking-wide">{post.division} Division | Southern Railway</p>
                      </div>

                      <div className="flex gap-10 border-t border-gray-100 pt-6">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Contact Number</label>
                          <p className="text-lg font-bold text-slate-800 flex items-center gap-2"><Phone size={16} /> {post.contactNumber || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Jurisdiction Address</label>
                          <p className="text-sm font-medium text-slate-600 flex items-start gap-2 max-w-xs"><MapPin size={16} className="mt-1 shrink-0" /> {post.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Officer in charge */}
                    <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-center items-center text-center">
                      <UserSquare2 className="text-gray-400 mb-2" size={40} />
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 underline">In-Charge Details</label>
                      <h3 className="text-lg font-bold text-slate-900 uppercase leading-tight">
                        {post.officerInCharge ? `${post.officerInCharge.rank} ${post.officerInCharge.name}` : "UNASSIGNED"}
                      </h3>
                      <p className="text-xs font-mono font-bold text-gray-500 mt-2">Force No: {post.officerInCharge?.forceNumber || "---"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION ROW - THREE TILES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. VIEW GD */}
                <button
                  onClick={() => router.push(`/post/view-gd?postCode=${post.postCode}`)}
                  className="bg-white border border-gray-300 p-5 hover:bg-gray-50 flex items-center justify-between transition-colors group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded text-blue-700">
                      <BookOpen size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold uppercase text-slate-900">General Diary</h4>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider text-wrap">View / Download Records</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-slate-900 transition-colors" />
                </button>

                {/* 2. ADD ENTRY (VISITING OFFICER) */}
                <button
                  onClick={() => router.push("/post/visiting-officer-login")}
                  className="bg-white border border-gray-300 p-5 hover:bg-gray-50 flex items-center justify-between transition-colors group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded text-emerald-700">
                      <UserPlus size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold uppercase text-slate-900 leading-tight">Add GD Entry</h4>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">(Visiting Officer)</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-slate-900 transition-colors" />
                </button>

                {/* 3. PAGE SERIAL NO */}
                <button
                  onClick={() => router.push(`/post/update-serial-no?id=${post._id}`)}
                  className="bg-white border border-gray-300 p-5 hover:bg-gray-50 flex items-center justify-between transition-colors group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-100 p-3 rounded text-amber-700">
                      <Hash size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold uppercase text-slate-900">Serial Number</h4>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider text-wrap">Authenticate Register</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-slate-900 transition-colors" />
                </button>
              </div>

            </div>
          ))
        )}

        <div className="pt-10 border-t border-gray-200 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Clock size={12} /> Last Data Refresh: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}