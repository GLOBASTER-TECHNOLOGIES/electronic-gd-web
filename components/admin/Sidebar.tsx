"use client";
import React, { useState } from 'react';
import { Users, UserPlus, LayoutDashboard, LogOut, ShieldCheck, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to auto-close sidebar on mobile when an item is clicked
  const handleItemClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* --- Mobile Trigger Button --- */}
      {/* Visible only on small screens (lg:hidden) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-[#1a233a] text-white rounded-lg shadow-lg hover:bg-[#25304c] transition-colors"
        aria-label="Open Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* --- Mobile Overlay/Backdrop --- */}
      {/* Darkens the background when sidebar is open on mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* --- Sidebar Container --- */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#1a233a] text-white flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:block
        `}
      >
        {/* Header Section */}
        <div className="p-6 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded text-[#1a233a]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">RPF Admin</h1>
              <p className="text-xs text-gray-400">Secure Console</p>
            </div>
          </div>
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard Overview"
            active={activeTab === 'dashboard'}
            onClick={() => handleItemClick('dashboard')}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label="All Officers"
            active={activeTab === 'officers'}
            onClick={() => handleItemClick('officers')}
          />
          <SidebarItem
            icon={<UserPlus size={20} />}
            label="Create Officer"
            active={activeTab === 'create-officer'}
            onClick={() => handleItemClick('create-officer')}
          />
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full px-4 py-2 hover:bg-[#25304c] rounded-lg">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-400 hover:bg-[#25304c] hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}