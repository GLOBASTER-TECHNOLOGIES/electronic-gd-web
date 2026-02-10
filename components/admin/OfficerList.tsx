"use client";
import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, Shield, MoreVertical } from 'lucide-react';

// Mock Data
const OFFICERS = [
    { id: 1, name: "Vikram Singh", forceId: "RPF-8821", rank: "Inspector", zone: "Northern", status: "Active" },
    { id: 2, name: "Anjali Sharma", forceId: "RPF-9912", rank: "SI", zone: "Western", status: "On Leave" },
    { id: 3, name: "Rajesh Kumar", forceId: "RPF-1120", rank: "Constable", zone: "Southern", status: "Active" },
    { id: 4, name: "Amit Verma", forceId: "RPF-3321", rank: "ASI", zone: "Eastern", status: "Suspended" },
    { id: 5, name: "Sita Reddy", forceId: "RPF-4455", rank: "IPF", zone: "Central", status: "Active" },
    { id: 6, name: "Kiran Desai", forceId: "RPF-6678", rank: "Constable", zone: "Western", status: "Active" },
];

export default function OfficerList() {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter logic
    const filteredOfficers = OFFICERS.filter(off =>
        off.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        off.forceId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* 1. Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Officer Directory</h3>
                    <p className="text-sm text-gray-500">Manage active personnel and assignments.</p>
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

            {/* 2. Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by Name or Force ID..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* 3. Table Container */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Officer Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Rank & ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 hidden md:table-cell">Zone</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOfficers.map((officer) => (
                                <tr key={officer.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200">
                                                {officer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="block font-medium text-gray-900">{officer.name}</span>
                                                <span className="block text-xs text-gray-400 md:hidden">{officer.rank}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-700">{officer.rank}</span>
                                            <span className="text-xs text-gray-400 font-mono">{officer.forceId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell text-gray-500">{officer.zone}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={officer.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredOfficers.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-medium">No officers found</h3>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Footer Pagination (Visual Only) */}
            <div className="flex items-center justify-between text-sm text-gray-500 px-2">
                <span>Showing {filteredOfficers.length} of {OFFICERS.length} records</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
                </div>
            </div>
        </div>
    );
}

// Helper Component for Status Badges
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
        "On Leave": "bg-amber-100 text-amber-700 border-amber-200",
        Suspended: "bg-rose-100 text-rose-700 border-rose-200",
    };

    const defaultStyle = "bg-gray-100 text-gray-700 border-gray-200";

    return (
        <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
      ${styles[status] || defaultStyle}
    `}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'Active' ? 'bg-emerald-500' : status === 'Suspended' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
            {status}
        </span>
    );
}