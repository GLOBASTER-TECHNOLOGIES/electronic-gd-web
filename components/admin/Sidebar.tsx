"use client";
import React from 'react';
import { Users, UserPlus, LayoutDashboard, LogOut, ShieldCheck, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {

  // --- CONFIGURATION: Add/Edit Menu Items Here ---
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />
    },
    {
      id: 'officers',
      label: 'Officer Records',
      icon: <Users size={18} />
    },
    {
      id: 'create-officer',
      label: 'Create Officer',
      icon: <UserPlus size={18} />
    },
    // Example of how easy it is to add new items:
    // { id: 'settings', label: 'System Settings', icon: <Settings size={18} /> },
  ];

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 2. Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-[#1a233a] text-white flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:shadow-none
        `}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-1.5 rounded-lg text-[#1a233a]">
              <ShieldCheck size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">RPF Admin</h1>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Secure Console</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items (Dynamic Mapping) */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeTab === item.id}
              onClick={() => handleNavClick(item.id)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon, label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}