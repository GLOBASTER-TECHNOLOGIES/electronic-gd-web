"use client";
import React from 'react';
import { Users, ShieldAlert, Clock } from 'lucide-react';

export default function DashboardStats() {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-gray-500 text-sm font-medium">Overview</h3>
        <p className="text-gray-400 text-xs mt-1">Real-time force deployment metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          label="Total Personnel" 
          value="1,248" 
          icon={<Users size={24} />} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Active Shifts" 
          value="450" 
          icon={<Clock size={24} />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="System Alerts" 
          value="3" 
          icon={<ShieldAlert size={24} />} 
          color="bg-rose-500" 
        />
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-sm">
        Select an option from the sidebar to manage officer records or register new personnel.
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
          <h4 className="text-3xl font-bold text-gray-900 mt-2">{value}</h4>
        </div>
        <div className={`p-4 rounded-xl text-white ${color} shadow-lg shadow-gray-100`}>
          {icon}
        </div>
      </div>
    </div>
  );
}