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
  TrainFront,
  AlertCircle,
  ShieldCheck,
  Map as MapIcon,
  Globe,
  Navigation,
  FileText,
  Clock,
  ExternalLink,
  Hash,
  Settings2
} from "lucide-react";

interface Post {
  _id: string;
  postName: string;
  postCode: string;
  division: string;
  contactNumber: string;
  address: string;
  officerInCharge?: {
    name: string;
    rank: string;
    forceNumber: string;
  } | null;
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

      // 1. Fetch logged-in user identity
      const meRes = await axios.get("/api/auth/me");
      if (!meRes.data.success || !meRes.data.user) throw new Error("Verification failed.");

      const myId = meRes.data.user._id;

      // 2. Fetch post assigned to this officer
      const postRes = await axios.get("/api/post/get-post-data", { 
        params: { officerInCharge: myId } 
      });

      if (postRes.data.success) {
        setPosts(postRes.data.data);
      }
    } catch (err: any) {
      console.error("Dashboard Load Error:", err);
      setError(err.response?.status === 404 ? "No assigned post found in records." : "Failed to load command details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-slate-900 mx-auto" size={40} />
        <p className="text-slate-600 font-bold tracking-widest uppercase text-xs">Accessing Secure Records...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP SYSTEM BAR */}
        <div className="flex items-center justify-between bg-slate-900 text-white px-6 py-3 rounded-t-xl shadow-lg border-b border-slate-700">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={16} className="text-blue-400" />
            Official Station Terminal
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono opacity-70">
            <span className="flex items-center gap-1"><Clock size={12}/> {new Date().toLocaleTimeString()}</span>
            <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
          </div>
        </div>

        {error ? (
          <div className="bg-white border-l-4 border-red-600 p-6 rounded-xl shadow-md flex items-center gap-5">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black uppercase text-sm tracking-tighter">Database Alert</h3>
              <p className="text-slate-500 text-sm font-medium">{error}</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-slate-200 shadow-sm">
             <Building2 size={64} className="mx-auto text-slate-200 mb-4" />
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Assignment Pending</h2>
             <p className="text-slate-500 text-sm max-w-xs mx-auto">No active jurisdiction assigned to this Force ID. Contact the Divisional Control Room.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              
              {/* COMMAND MASTHEAD */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className="md:col-span-3 p-8 md:p-12 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-black tracking-[0.2em] uppercase">
                        Unit Code: {post.postCode}
                      </div>
                      <div className="h-[1px] flex-1 bg-slate-100"></div>
                    </div>
                    
                    <div>
                      <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">
                        {post.postName}
                      </h1>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-2 border-r border-slate-200 pr-6">
                          <Globe size={16} className="text-blue-600"/> {post.division} Division
                        </span>
                        <span className="flex items-center gap-2">
                          <Navigation size={16} className="text-blue-600"/> Southern Railway
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SIDE BADGE */}
                  <div className="bg-slate-50 border-l border-slate-100 p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-white rounded-full shadow-sm border border-slate-200">
                      <TrainFront size={40} className="text-slate-900" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-tight">Official<br/>Jurisdiction</p>
                  </div>
                </div>
              </div>

              {/* INFORMATION & ACTIONS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. PERSONNEL CARD */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4">
                      <UserSquare2 size={32} className="text-slate-900" />
                   </div>
                   <div className="space-y-1 mb-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Officer In-Charge</p>
                     <h3 className="text-base font-black text-slate-900 uppercase leading-tight">
                        {post.officerInCharge ? `${post.officerInCharge.rank} ${post.officerInCharge.name}` : "Post Vacant"}
                     </h3>
                     <p className="text-xs font-mono font-bold text-blue-600 italic">Force No: {post.officerInCharge?.forceNumber || "N/A"}</p>
                   </div>
                </div>

                {/* 2. COMMUNICATIONS CARD */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Phone size={14} className="text-blue-600" /> Communications
                  </h3>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Line / CUG</p>
                    <p className="text-xl font-black text-slate-900 font-mono tracking-tighter">
                      {post.contactNumber || "DATA MISSING"}
                    </p>
                  </div>
                </div>

                {/* 3. LOCATION CARD */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-400"></div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <MapIcon size={14} className="text-slate-900" /> Location Details
                  </h3>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-slate-300 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Physical Address</p>
                      <p className="text-xs font-bold text-slate-700 leading-snug line-clamp-2">
                        {post.address || "No precise address logged."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. ADMINISTRATIVE ACTIONS CARD */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Settings2 size={14} className="text-amber-500" /> Station Control
                    </h3>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-[9px] font-black text-amber-600 uppercase">Registry Management</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/post/update-serial-no?id=${post._id}`)}
                    className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-200"
                  >
                    <Hash size={14} /> Update Serial No
                  </button>
                </div>

              </div>

              {/* SYSTEM FOOTER */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-10 border-t border-slate-200 opacity-40">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1"><FileText size={12}/> Internal Document</span>
                  <span className="flex items-center gap-1"><ExternalLink size={12}/> Ref ID: {post._id.slice(-8).toUpperCase()}</span>
                </div>
                <p className="text-[10px] font-bold">© {new Date().getFullYear()} RPF IT MANAGEMENT CELL</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}