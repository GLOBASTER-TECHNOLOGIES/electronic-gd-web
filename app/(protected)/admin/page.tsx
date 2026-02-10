"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardStats from '@/components/admin/DashboardStats';
import CreateOfficerForm from '@/components/admin/CreateOfficerForm';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* 1. Sidebar Section */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-64 overflow-y-auto">
        {/* 2. Header Section */}
        <AdminHeader activeTab={activeTab} />

        {/* 3. Dynamic Content Section */}
        <div className="p-8">
          {activeTab === 'dashboard' && <DashboardStats />}

          {activeTab === 'create-officer' && (
            <div className="max-w-4xl mx-auto">
              <CreateOfficerForm />
            </div>
          )}

          {activeTab === 'officers' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-500">
              Officer List Component will be loaded here...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}