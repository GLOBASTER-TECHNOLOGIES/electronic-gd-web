"use client";
import React from 'react';
import { Users, UserPlus, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#1a233a] text-white flex flex-col fixed h-full">
      <div className="p-6 flex items-center gap-3 border-b border-gray-700">
        <div className="p-2 bg-yellow-500 rounded text-[#1a233a]">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">RPF Admin</h1>
          <p className="text-xs text-gray-400">Secure Console</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard Overview"
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        />
        <SidebarItem
          icon={<Users size={20} />}
          label="All Officers"
          active={activeTab === 'officers'}
          onClick={() => setActiveTab('officers')}
        />
        <SidebarItem
          icon={<UserPlus size={20} />}
          label="Create Officer"
          active={activeTab === 'create-officer'}
          onClick={() => setActiveTab('create-officer')}
        />
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full px-4 py-2">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-400 hover:bg-[#25304c] hover:text-white'
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}