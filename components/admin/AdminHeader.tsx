"use client";
import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface AdminHeaderProps {
  activeTab: string;
  onMenuClick: () => void;
}

export default function AdminHeader({ activeTab, onMenuClick }: AdminHeaderProps) {
  const titles: Record<string, string> = {
    'dashboard': 'Dashboard Overview',
    'create-officer': 'Register Personnel',
    'officers': 'Officer Records'
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Left Side: Menu Trigger & Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
            {titles[activeTab] || 'Admin Panel'}
          </h2>
        </div>

        {/* Right Side: Profile & Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900">System Admin</span>
            <span className="text-xs text-gray-500">Superuser Access</span>
          </div>
          
          <div className="h-9 w-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}