"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Building2, 
  MapPin, 
  Search, 
  Filter, 
  Phone, 
  Loader2,
  TrainFront,
  UserSquare2,
  Edit, 
  Settings,
  Hash // 1. Added Hash icon for the Post Code
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

interface PostListProps {
  onEdit?: (id: string) => void; 
}

export default function PostList({ onEdit }: PostListProps) {
  // ... (State and Fetch logic remains exactly the same as your code) ...
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("ALL");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/post/get-post-data"); 
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  const divisions = ["ALL", ...Array.from(new Set(posts.map(p => p.division)))];
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.postName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.postCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = selectedDivision === "ALL" || post.division === selectedDivision;
    
    return matchesSearch && matchesDivision;
  });

  return (
    <div className="space-y-6">
      {/* HEADER & STATS (Same as before) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Total Stations" 
          value={posts.length} 
          icon={<TrainFront size={24} className="text-blue-500" />} 
        />
        <StatCard 
          label="Active Divisions" 
          value={divisions.length - 1} 
          icon={<MapPin size={24} className="text-emerald-500" />} 
        />
        <StatCard 
          label="Officers Assigned" 
          value={posts.filter(p => p.officerInCharge).length} 
          icon={<UserSquare2 size={24} className="text-purple-500" />} 
        />
      </div>

      {/* FILTERS (Same as before) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by Post Name or Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={20} className="text-slate-400" />
          <select 
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full md:w-48 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
          >
            {divisions.map(div => (
              <option key={div} value={div}>{div === "ALL" ? "All Divisions" : div}</option>
            ))}
          </select>
        </div>
      </div>

      {/* POSTS GRID */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          <Building2 size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold">No posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-components
function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <h2 className="text-3xl font-black text-slate-900">{value}</h2>
      </div>
      <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
    </div>
  );
}

function PostCard({ post, onEdit }: { post: Post, onEdit?: (id: string) => void }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      
      {/* CARD HEADER */}
      <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Kept the badge here as well for quick scanning */}
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide">
              {post.postCode}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {post.division}
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-800 leading-tight">
            {post.postName}
          </h3>
        </div>
        
        {/* EDIT BUTTON */}
        {onEdit && (
          <button 
            onClick={() => onEdit(post._id)}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
            title="Edit Station Details"
          >
            <Settings size={16} />
          </button>
        )}
      </div>

      {/* CARD BODY */}
      <div className="p-5 space-y-4 flex-1">
        
        {/* 2. Added Post Code Section explicitly */}
        <div className="flex items-start gap-3">
          <Hash size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Post Code</p>
            <p className="text-sm font-medium text-slate-700 font-mono">
              {post.postCode}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Contact</p>
            <p className="text-sm font-medium text-slate-700">
              {post.contactNumber || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Address</p>
            <p className="text-sm font-medium text-slate-700 line-clamp-2">
              {post.address || "No address"}
            </p>
          </div>
        </div>
      </div>

      {/* CARD FOOTER (Same as before) */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${post.officerInCharge ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
          {post.officerInCharge ? <UserSquare2 size={16} /> : "?"}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Officer In-Charge</p>
          <p className="text-xs font-bold text-slate-800">
            {post.officerInCharge 
              ? `${post.officerInCharge.rank} ${post.officerInCharge.name}` 
              : "Vacant"}
          </p>
        </div>
        
        {onEdit && (
            <button 
              onClick={() => onEdit(post._id)}
              className="text-[10px] font-bold text-blue-600 hover:underline uppercase md:hidden"
            >
              Edit
            </button>
        )}
      </div>
    </div>
  );
}