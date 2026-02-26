"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Shield,
  FilePlus,
  BookOpen,
  LogOut,
  Loader2,
  Settings
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  rank: string;
  forceNumber: string;
  division: string;
  postName: string;
  postCode: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", {
          params: { fields: "name,rank,forceNumber,division,postName,postCode" }
        });
        setUser(res.data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await axios.get("/api/auth/logout");
      router.push("/login");
    } catch {
      alert("Logout failed");
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.rank?.toUpperCase() === "ADMIN"; // ✅ Rank check

  return (
    <div className="min-h-screen text-black bg-[#eef0f3] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white border border-gray-300 shadow-sm p-8">

        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Officer Profile
          </h1>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
            Railway Protection Force
          </p>
        </div>

        {/* Officer Info */}
        <div className="space-y-4 text-sm border-b border-gray-200 pb-6 mb-6">

          <div className="flex justify-between">
            <span className="text-gray-500 uppercase text-xs">Name</span>
            <span className="font-medium">{user.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 uppercase text-xs">Rank</span>
            <span className="font-medium">{user.rank}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 uppercase text-xs">Force Number</span>
            <span className="font-medium">{user.forceNumber}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 uppercase text-xs">Division</span>
            <span className="font-medium">{user.division}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 uppercase text-xs">Post</span>
            <span className="font-medium">{user.postName}</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="space-y-4">

          <button
            onClick={() => router.push("/gd/add-entry")}
            className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <FilePlus size={16} />
            Add GD Entry
          </button>

          <button
            onClick={() => router.push(`view-gd?postCode=${user.postCode}`)}
            className="w-full border border-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <BookOpen size={16} />
            View GD Entries
          </button>

          {/* ✅ NEW ADMIN BUTTON */}
          {isAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className="w-full bg-slate-900 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              Go to Admin Panel
            </button>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full border border-red-600 text-red-600 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <LogOut size={16} />
            )}
            {loggingOut ? "Logging Out..." : "Logout"}
          </button>

        </div>

      </div>
    </div>
  );
}