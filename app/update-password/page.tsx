"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (formData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    const toastId = toast.loading("Updating password...");

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: formData.newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password updated successfully", { id: toastId });

      // 🔍 Detect login type from cookies
      const officerToken = document.cookie.includes("officerAccessToken");
      const postToken = document.cookie.includes("postAccessToken");

      setTimeout(() => {
        if (officerToken) {
          router.push("/officer/profile");
        } else if (postToken) {
          router.push("/post/dashboard");
        } else {
          router.push("/login"); // fallback
        }
      }, 1200);

    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <div className="flex justify-center mb-3">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wide">
            Set New Password
          </h1>
          <p className="text-xs text-gray-300 mt-2">
            Your password was reset. Please set a new secure password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 text-black space-y-5">

          <PasswordField
            label="New Password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            show={showNew}
            toggle={() => setShowNew(!showNew)}
          />

          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            show={showConfirm}
            toggle={() => setShowConfirm(!showConfirm)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  show,
  toggle
}: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-gray-500 tracking-widest">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required
          className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-slate-400 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}