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
  BadgeCheck,
  UserCog,
  Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Officer {
  _id: string;
  name: string;
  forceNumber: string;
  rank: string;
  appRole: string;
  railwayZone: string;
  division: string;
  postName: string;
  postCode?: string;
  mobileNumber: string;
  lastLoginAt?: string;
  status?: string;
}

interface OfficerListProps {
  onEdit?: (id: string) => void;
  postCode?: string | null; // ✅ Added optional postCode
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
      const msg = error.response?.data?.message || "Error connecting to server";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOfficers(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, postCode ?? null]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Officer Directory</h3>
          <p className="text-sm text-gray-500">Manage personnel, roles, and assignments.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 text-sm font-medium shadow-sm transition-colors">
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search by Name, Force ID, or Rank..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Loader2 className="animate-spin mb-2 text-blue-500" size={32} />
            <p className="text-sm font-medium">Loading records...</p>
          </div>
        ) : officers.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-medium">No officers found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? `No matches for "${searchTerm}"` : "Get started by adding a new officer."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officers.map((officer) => (
              <OfficerCard key={officer._id} officer={officer} onEdit={onEdit} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && officers.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 px-2 pt-2 border-t border-gray-100">
          <span>Showing {officers.length} records</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" disabled>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

function OfficerCard({ officer, onEdit }: { officer: Officer, onEdit?: (id: string) => void }) {
  const isLoginActive = !!officer.lastLoginAt;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow p-5 flex flex-col justify-between h-full group">

      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-blue-100 shadow-lg">
            {officer.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">{officer.name}</h4>
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
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Details"
            >
              <Edit size={16} />
            </button>
          )}
          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-2 border border-gray-100">
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
            <div className="flex-1">
              <span className="font-semibold text-gray-900 block">{officer.postName}</span>
              <span className="text-gray-500">{officer.division}, {officer.railwayZone}</span>
            </div>
          </div>

          {officer.postCode && (
            <div className="flex items-center gap-2 pl-6">
              <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm">
                <Hash size={10} className="text-gray-400" />
                <span className="font-mono font-bold text-[10px] text-gray-700 tracking-wider">
                  {officer.postCode}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 text-gray-600">
            <UserCog size={14} className="text-gray-400" />
            <span className="font-medium">{officer.appRole}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 text-gray-600">
            <Phone size={14} className="text-gray-400" />
            <span className="font-mono tracking-tight">{officer.mobileNumber}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-xs">
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