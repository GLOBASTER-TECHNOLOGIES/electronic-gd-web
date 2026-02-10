"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardStats from '@/components/admin/DashboardStats';
import OfficerList from '@/components/admin/OfficerList';
import CreateOfficerForm from '@/components/admin/CreateOfficerForm';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

      {/* 1. SIDEBAR (Navigation) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* 2. MAIN LAYOUT WRAPPER */}
      {/* This margin (lg:ml-64) pushes content right on desktop so sidebar doesn't overlap */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64 min-w-0">

        {/* 3. HEADER */}
        <AdminHeader
          activeTab={activeTab}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* 4. CONTENT AREA */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in duration-500">
                <DashboardStats />
              </div>
            )}

            {activeTab === 'create-officer' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <CreateOfficerForm />
              </div>
            )}

            {activeTab === 'officers' && (
              <div className="animate-in fade-in duration-500">
                <OfficerList />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}