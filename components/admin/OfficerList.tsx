"use client";
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  Loader2,
  Phone,
  MapPin,
  UserCog,
  Hash,
  KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Officer {
  _id: string;
  name: string;
  forceNumber: string;
  rank: string;
  railwayZone: string;
  division: string;
  postName?: string;
  postCode?: string;
  mobileNumber: string;
  lastLoginAt?: string;
  status?: string;
}

interface OfficerListProps {
  onEdit?: (id: string) => void;
  postCode?: string | null;
}

export default function OfficerList({ onEdit, postCode }: OfficerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOfficers = async (search = '') => {
    setLoading(true);
    try {
      const finalQuery = search || postCode || '';

      const response = await axios.get('/api/officer/get-officer', {
        params: { query: finalQuery }
      });

      if (response.data.success) {
        setOfficers(response.data.data);
      } else {
        toast.error("Failed to load officers");
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchOfficers(searchTerm);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchTerm, postCode]);

  /* ============================
     🔐 RESET PASSWORD
  ============================ */
  const handleResetPassword = async (id: string, name: string) => {
    const confirmReset = confirm(
      `Reset password for ${name}?\n\nPassword will be set to 0000000.\nOfficer must change password on next login.`
    );

    if (!confirmReset) return;

    try {
      const res = await axios.post("/api/officer/reset-password", { id });

      if (res.data.success) {
        toast.success("Password reset successfully");
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Reset failed");
    }
  };

  /* ============================
     🗑 DELETE OFFICER
  ============================ */
  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = confirm(
      `Delete officer ${name}?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete("/api/officer/delete", {
        params: { id } // ✅ FIXED
      });

      if (res.data.success) {
        toast.success("Officer deleted successfully");
        fetchOfficers(searchTerm);
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Officers List</h3>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search by Name or Force ID..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : officers.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed">
            <Shield size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No officers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officers.map((officer) => (
              <OfficerCard
                key={officer._id}
                officer={officer}
                onEdit={onEdit}
                onDelete={handleDelete}
                onReset={handleResetPassword}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfficerCard({
  officer,
  onEdit,
  onDelete,
  onReset
}: {
  officer: Officer,
  onEdit?: (id: string) => void,
  onDelete: (id: string, name: string) => void,
  onReset: (id: string, name: string) => void
}) {
  const isLoginActive = !!officer.lastLoginAt;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between h-full group">

      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
            {officer.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{officer.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{officer.rank}</span>
              <span className="font-mono text-[10px] tracking-wide">• {officer.forceNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">

          {onEdit && (
            <button
              onClick={() => onEdit(officer._id)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Edit size={16} />
            </button>
          )}

          {/* RESET PASSWORD */}
          <button
            onClick={() => onReset(officer._id, officer.name)}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
            title="Reset Password"
          >
            <KeyRound size={16} />
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete(officer._id, officer.name)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-xs border">
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin size={14} />
            <div>
              <span className="font-semibold text-gray-900 block">
                {officer.postName || officer.postCode}
              </span>
              <span>{officer.division}, {officer.railwayZone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs border p-2 rounded-lg text-gray-600">
          <Phone size={14} />
          <span className="font-mono">{officer.mobileNumber}</span>
        </div>
      </div>

      <div className="pt-3 border-t text-xs flex justify-between">
        <div className="flex items-center gap-1.5 text-gray-400">
          <div className={`w-2 h-2 rounded-full ${isLoginActive ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
          {isLoginActive ? 'Active recently' : 'No recent login'}
        </div>
        {officer.status && <StatusBadge status={officer.status} />}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "text-emerald-700 bg-emerald-50 border-emerald-100",
    Suspended: "text-rose-700 bg-rose-50 border-rose-100",
    Inactive: "text-gray-600 bg-gray-50 border-gray-100",
  };

  return (
    <span className={`px-2 py-0.5 rounded-md border font-medium ${styles[status] || styles.Inactive}`}>
      {status}
    </span>
  );
}