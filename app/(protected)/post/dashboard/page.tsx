"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  MapPin,
  Phone,
  Loader2,
  UserSquare2,
  TrainFront,
  AlertCircle
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

      // 1. First, call your EXISTING auth route to get the ID
      // Make sure the path matches your folder structure (e.g., /api/auth/me)
      const meRes = await axios.get("/api/auth/me");
      
      if (!meRes.data.success || !meRes.data.user) {
        throw new Error("Could not verify officer identity.");
      }

      const myId = meRes.data.user._id;

      // 2. Now call the Post API with that ID
      const postRes = await axios.get("/api/post/get-post-data", { 
        params: { 
          officerInCharge: myId 
        } 
      });

      if (postRes.data.success) {
        setPosts(postRes.data.data);
      }

    } catch (err: any) {
      console.error("Failed to load dashboard:", err);
      // specific error handling
      if (err.response?.status === 404) {
         setError("No post data found.");
      } else {
         setError("Failed to load your post assignment.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-8 font-sans text-slate-900">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <Building2 className="text-blue-600" size={28} />
          My Assigned Post
        </h1>
        <p className="text-slate-500 mt-1">Details of the jurisdiction currently under your command.</p>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : posts.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Building2 size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">No Post Assigned</h3>
          <p className="text-slate-500">You are not currently listed as the In-Charge of any post.</p>
        </div>
      ) : (
        /* POSTS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- POST CARD COMPONENT ---
function PostCard({ post }: { post: Post }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide">
              {post.postCode}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {post.division}
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
            {post.postName}
          </h3>
        </div>
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
           <TrainFront size={20} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4 flex-1">
        <div className="flex items-start gap-3">
          <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Control Room / CUG</p>
            <p className="text-sm font-medium text-slate-700">
              {post.contactNumber || "Not Available"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Location</p>
            <p className="text-sm font-medium text-slate-700 line-clamp-2">
              {post.address || "No address provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${post.officerInCharge ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
          {post.officerInCharge ? <UserSquare2 size={16} /> : "?"}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Officer In-Charge</p>
          <p className="text-xs font-bold text-slate-800">
            {post.officerInCharge
              ? `${post.officerInCharge.rank} ${post.officerInCharge.name}`
              : "Vacant"}
          </p>
        </div>
      </div>
    </div>
  );
}